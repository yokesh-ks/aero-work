### 🧩 **Revised Task: Implement Project Creation & GitHub Linking (v1.0 Foundation)**

> **Goal**: Enable users to create a new project by linking a GitHub repository via OAuth. Store project metadata locally in SQLite. This unlocks all downstream features (Kanban, agents, diffs).

---

#### ✅ **Deliverables**
By completing this task, you will have:
- A “New Project” button in the UI
- GitHub OAuth flow (using `@octokit/oauth-app`)
- Local SQLite table `projects` storing:
  - `id` (UUID)
  - `github_owner`, `github_repo`
  - `github_installation_id` (for future GitHub App support)
  - `created_at`
- Electron main process securely storing GitHub token (via `keytar` or safe storage)
- Preload script exposing `project:create` IPC
- Validation: Cannot create project without valid GitHub repo access

---

#### 📋 **Step-by-Step Implementation**

##### 1. **Add Dependencies**
```bash
npm install @octokit/oauth-app keytar better-sqlite3
npm install --save-dev @types/keytar @types/better-sqlite3
```

##### 2. **Initialize Projects Table in Main Process**
In `apps/desktop/src/main/index.ts`:
```ts
const db = new Database(path.join(app.getPath('userData'), 'aero.db'));
db.exec(`
  CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY,
    github_owner TEXT NOT NULL,
    github_repo TEXT NOT NULL,
    github_installation_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);
```

##### 3. **Implement GitHub OAuth Flow**
Use `@octokit/oauth-app` in main process:
```ts
import { OAuthApp } from "@octokit/oauth-app";

const oauthApp = new OAuthApp({
  clientType: "oauth-app",
  clientId: process.env.GITHUB_CLIENT_ID!,
  clientSecret: process.env.GITHUB_CLIENT_SECRET!,
});

// Trigger from IPC
ipcMain.handle('project:create', async (_event, { owner, repo }) => {
  // 1. Validate repo exists via unauthenticated Octokit call
  // 2. Launch OAuth flow: open external browser
  // 3. On callback, exchange code for token
  // 4. Store token securely with keytar
  // 5. Insert project into DB
});
```

> 🔐 **Security**: Never expose tokens to renderer. Use `keytar.setPassword()` in main process only.

##### 4. **Store GitHub Token Securely**
```ts
import * as keytar from 'keytar';

await keytar.setPassword('Aero Work', `github-token-${projectId}`, token);
```

##### 5. **Expose Project Creation in Preload**
```ts
contextBridge.exposeInMainWorld('aero', {
  project: {
    create: (owner: string, repo: string) => 
      ipcRenderer.invoke('project:create', { owner, repo })
  }
});
```

##### 6. **Build UI Flow (React)**
- Button: “+ New Project”
- Modal: Enter `owner/repo` (e.g., `aero-work/my-app`)
- On submit → trigger `window.aero.project.create(owner, repo)`
- Handle OAuth redirect in `app.on('open-url')` (macOS) or custom protocol (Windows/Linux)

##### 7. **Handle OAuth Redirect**
Register custom protocol in `package.json`:
```json
{
  "build": {
    "protocols": {
      "name": "Aero Work Auth",
      "schemes": ["aerowork"]
    }
  }
}
```
Then in main:
```ts
app.setAsDefaultProtocolClient('aerowork');
```

On redirect (`aerowork://callback?code=...`), parse code and complete token exchange.

---

#### 🔗 **Why This Comes Before Tasks**
- Tasks are **GitHub Issues** → require a repo
- Your PRD states: **“Project creation requires GitHub repository linking”**
- Local cache (`SQLite`) stores **project metadata**, not raw tasks
- All agent execution, MCP configs, and dev servers are **per-project**

---

#### ▶️ **Next Task After This**
- Fetch GitHub Issues for selected project → populate Kanban board
- Implement offline caching of issues in SQLite

Start with **projects**. Everything else depends on it.