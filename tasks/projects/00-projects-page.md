# Project Management: Projects Page – Technical Specification

## Module: `Project Management`
### Menu: `Projects`

---

## Overview
This specification defines the implementation of the **Projects Page** (`/projects`) in Aero Work, enabling users to create, view, and manage development projects—each **mandatorily linked to a GitHub repository**, as required by the PRD (Section: *Project Management (GitHub-Linked)*). This page serves as the entry point to Kanban boards powered by GitHub Issues, multi-agent orchestration, and future dev server/MCP features. All project metadata is stored locally in **SQLite via Node.js backend (better-sqlite3)** in the Electron main process, while task data remains synchronized with GitHub.

---

## Features
- ✅ **Mandatory GitHub repository linking** on project creation (no local-only projects)
- 🔐 Seamless **GitHub OAuth authentication** (via Electron + Octokit)
- 💾 Clone selected GitHub repo to user-chosen local directory using `simple-git` (Node.js)
- 📋 View list of linked projects with key metadata
- 🚀 One-click navigation to project-specific **Kanban board** (`/projects/{id}/board`)
- 👥 Support for **personal and organization repositories** (with appropriate permissions)
- 🟢 Real-time **project status indicators** (`Linked`, `Cloning`, `Error`)
- ⏱️ Track **last opened** timestamp for recent projects

> ⚠️ **PRD Compliance**: "Project creation requires GitHub repository linking" — *no exceptions*

---

## Fields (Project Metadata)

### Core Identity
- **GitHub Owner** (`string`, required) — e.g., `aerowork`
- **GitHub Repository Name** (`string`, required) — e.g., `aero-work`
- **GitHub Repository ID** (`integer`, required) — from GitHub API (`repo.id`)
- **Local Path** (`string`, required) — absolute filesystem path
- **Project ID** (`UUID`, generated locally, primary key)

### Status & Metadata
- **Status** (`enum`: `linked` | `cloning` | `error`) — default: `linked`
- **Created At** (`ISO 8601`, required)
- **Last Opened At** (`ISO 8601`, nullable)
- **Is Private** (`boolean`, derived from GitHub API)
- **Default Branch** (`string`, e.g., `main`)

> ❌ No editable "Project Name" — display name is always `{owner}/{repo}`

---

## Filters
The Projects listing supports filtering by:
1. Repository name (fuzzy match)
2. Owner/org name
3. Status (`linked`, `error`)
4. Recent (opened in last 7 days)

---

## GitHub Integration Flow (Project Creation)

### Workflow
1. User clicks **"Create Project"** (right-aligned header button)
2. If no valid GitHub token exists → trigger **OAuth flow** via Electron main process
3. Fetch accessible repos using **Octokit** (`user/repos` + org repos with `issues:read`, `contents:write`)
4. User selects a repository from searchable list (with avatars)
5. User selects local directory via `dialog.showOpenDialog({ properties: ['openDirectory'] })`
   - If directory **exists**:
     - Validate `.git` folder exists
     - Confirm remote `origin` URL matches selected GitHub repo (`https://github.com/{owner}/{repo}.git`)
   - If directory **new/empty**:
     - Clone repo using **`simple-git`** in Electron main process
6. On success:
   - Insert record into `projects` SQLite table
   - Show toast: "✅ Project '{owner}/{repo}' linked"
   - Redirect to `/projects/{projectId}/board`

> ❌ Rejected: "Create new local repo", "Import non-GitHub repo", or "Skip linking"

---

## Tables

### `projects` (SQLite — managed by Node.js via better-sqlite3)

| Column | Type | Description |
|-------|------|-------------|
| `id` | TEXT (UUID) | Primary key |
| `github_owner` | TEXT | GitHub owner/org |
| `github_repo` | TEXT | Repository name |
| `github_repo_id` | INTEGER | Unique GitHub repo ID |
| `local_path` | TEXT | Absolute local path |
| `status` | TEXT | `linked`, `cloning`, `error` |
| `is_private` | INTEGER | 0 or 1 (SQLite boolean) |
| `default_branch` | TEXT | e.g., `main` |
| `created_at` | TEXT | ISO 8601 |
| `last_opened_at` | TEXT | Nullable, ISO 8601 |

> Stored in `apps/electron/src/main/db/projects.ts` using **better-sqlite3**

---

## Backend Code Structure

### Architecture: Electron IPC (Main ↔ Renderer)
Communication between renderer and main process uses Electron's IPC (Inter-Process Communication) via `contextBridge` and `ipcRenderer`/`ipcMain`.

### Main Process (`apps/electron/src/main/`)
- **Database initialization**
  `db/index.ts` — SQLite setup with better-sqlite3
- **Project operations**
  `db/projects.ts` — CRUD operations for projects table
- **Git operations**
  `services/git-service.ts` — Clone, validate using simple-git
- **GitHub service**
  `services/github-service.ts` — Octokit integration for repo fetching
- **IPC handlers**
  `ipc/project-handlers.ts` — Register IPC handlers for project operations

### Preload Script (`apps/electron/src/preload.ts`)
- Exposes safe IPC channels via `contextBridge`:
  ```typescript
  contextBridge.exposeInMainWorld('electronAPI', {
    projects: {
      list: () => ipcRenderer.invoke('projects:list'),
      getById: (id: string) => ipcRenderer.invoke('projects:getById', id),
      create: (data: CreateProjectInput) => ipcRenderer.invoke('projects:create', data),
      updateLastOpened: (id: string) => ipcRenderer.invoke('projects:updateLastOpened', id),
      delete: (id: string) => ipcRenderer.invoke('projects:delete', id),
    },
    github: {
      getRepositories: () => ipcRenderer.invoke('github:getRepositories'),
      authenticate: () => ipcRenderer.invoke('github:authenticate'),
    },
    dialog: {
      selectDirectory: () => ipcRenderer.invoke('dialog:selectDirectory'),
    },
    git: {
      clone: (url: string, path: string) => ipcRenderer.invoke('git:clone', url, path),
      validateRepo: (path: string, expectedRemote: string) => ipcRenderer.invoke('git:validateRepo', path, expectedRemote),
    },
  })
  ```

### Renderer Services (`apps/electron/src/modules/project-management/services/`)
- **project-service.ts** — Calls `window.electronAPI.projects.*`

---

## UI Requirements

### Projects Page (`/projects`)
- Header:
  - Title: **"Projects"**
  - Subtitle: **"Manage your projects and track their progress"**
  - Right-aligned **"Create Project"** button (shadcn/ui `<Button>`)
- Empty state: Illustration + CTA if no projects
- Responsive **grid of Project Cards** (3 per row on desktop)

### Project Card
- GitHub avatar (owner/org)
- Repo name as link: **`owner/repo`**
- Local path (truncated with tooltip)
- Last opened: "Opened 2 hours ago"
- Status badge:
  - `Linked` → green dot
  - `Error` → red dot + tooltip
- Hover: "Open Board" primary button

### Create Project Dialog
- Step 1: "Connect GitHub Account" (if needed)
- Step 2: Searchable repo selector (with loading, error states)
- Step 3: Local path picker (Electron dialog)
- During clone: Progress spinner + "Cloning…" message
- On success: Auto-close + redirect to Kanban board

---

## Validation Rules
- ✅ Must have valid GitHub OAuth token with `repo` scope
- ✅ Selected repo must **not be archived**
- ✅ Local path must be **writable**
- ✅ Existing `.git` dir must have **matching remote origin**
- ✅ Reject if GitHub API returns error (e.g., rate limit, permission)

---

## Bruno Collection

- [ ] Create Bruno collection at:
  ```plaintext
  collections/project-management/
  ```
- [ ] Include requests for testing IPC handlers (manual testing via dev tools):
  - `projects:list`
  - `projects:create` (with payload: `{ githubOwner, githubRepo, localPath }`)
  - `projects:updateLastOpened`
- [ ] Document IPC channels and expected payloads
- [ ] Commit to Git alongside code

---

## Dependencies (Node.js)

### Main Process
```json
{
  "better-sqlite3": "^11.0.0",
  "simple-git": "^3.27.0",
  "@octokit/rest": "^21.0.0",
  "uuid": "^10.0.0"
}
```

### Dev Dependencies
```json
{
  "@types/better-sqlite3": "^7.6.0",
  "@types/uuid": "^10.0.0"
}
```

---

## Notes
- **Offline support**: Projects list loads from SQLite; Kanban syncs when online
- **Security**: GitHub tokens stored in OS keychain via Electron `safeStorage`
- **Performance**: better-sqlite3 is synchronous and fast (~100 req/s), ideal for local desktop apps
- **No external server**: All backend logic runs in Electron main process via IPC
- **Future-ready**: `projectId` will be used for MCP configs, dev servers (v1.3), and SSH remotes
- **Redirect behavior**: After creation → `/projects/{id}/board` (Kanban view)
- **PRD Alignment**: Fully satisfies v1.0.0 requirement: *"Project creation requires GitHub repository linking"*

---
