# GitHub API

GitHub OAuth authentication and repository operations via Octokit.

## Authentication Flow

1. Call `github:openOAuthUrl` to open browser for user authorization
2. User authorizes the app, GitHub redirects to `aerowork://oauth/callback?code=...`
3. Exchange code for token (server-side or via GitHub App)
4. Call `github:storeToken` to securely store the access token
5. All subsequent API calls use the stored token

## Channels

### `github:storeToken`

Store a GitHub access token securely using Electron's safeStorage.

**Parameters:**
```typescript
token: string  // GitHub access token
```

**Response:**
```typescript
ApiResponse<boolean>
```

**Example:**
```typescript
const response = await window.electronAPI.github.storeToken('ghp_xxxxxxxxxxxx');
if (response.success) {
  console.log('Token stored securely');
}
```

**Security Note:** Token is encrypted using OS-level encryption (Keychain on macOS, Credential Manager on Windows).

---

### `github:getToken`

Retrieve the stored GitHub token (for internal use).

**Parameters:** None

**Response:**
```typescript
ApiResponse<string | null>
```

**Example:**
```typescript
const response = await window.electronAPI.github.getToken();
// Returns null if no token stored
```

---

### `github:clearToken`

Remove the stored GitHub token (logout).

**Parameters:** None

**Response:**
```typescript
ApiResponse<boolean>
```

**Example:**
```typescript
await window.electronAPI.github.clearToken();
console.log('User logged out');
```

---

### `github:isAuthenticated`

Check if user has a valid GitHub authentication.

**Parameters:** None

**Response:**
```typescript
ApiResponse<boolean>
```

**Example:**
```typescript
const response = await window.electronAPI.github.isAuthenticated();
if (response.data) {
  console.log('User is authenticated');
} else {
  console.log('User needs to authenticate');
}
```

**Note:** This validates the token by making an API call to GitHub, not just checking token existence.

---

### `github:getAuthState`

Get detailed authentication state including user info.

**Parameters:** None

**Response:**
```typescript
ApiResponse<{
  isAuthenticated: boolean;
  user?: {
    login: string;       // GitHub username
    avatar_url: string;  // Profile image URL
    name: string | null; // Display name
  };
}>
```

**Example:**
```typescript
const response = await window.electronAPI.github.getAuthState();
if (response.data?.isAuthenticated) {
  console.log('Logged in as:', response.data.user?.login);
}
```

---

### `github:openOAuthUrl`

Open GitHub OAuth authorization page in the default browser.

**Parameters:**
```typescript
clientId: string;           // GitHub OAuth App client ID
scopes?: string[];          // OAuth scopes (default: ['repo'])
```

**Response:**
```typescript
ApiResponse<void>
```

**Example:**
```typescript
await window.electronAPI.github.openOAuthUrl(
  'your-github-client-id',
  ['repo', 'read:org']
);
// Browser opens to GitHub authorization page
```

**Redirect:** After authorization, GitHub redirects to `aerowork://oauth/callback?code=...`

---

### `github:getRepositories`

Fetch all repositories accessible to the authenticated user.

**Parameters:** None

**Response:**
```typescript
ApiResponse<GitHubRepository[]>
```

**Example:**
```typescript
const response = await window.electronAPI.github.getRepositories();
if (response.success) {
  response.data?.forEach(repo => {
    console.log(`${repo.full_name} (${repo.private ? 'private' : 'public'})`);
  });
}
```

**Note:** Returns owned repos, collaborator repos, and organization repos. Archived repos are excluded.

---

### `github:getRepository`

Fetch a specific repository by owner and name.

**Parameters:**
```typescript
owner: string;  // e.g., 'aerowork'
repo: string;   // e.g., 'aero-work'
```

**Response:**
```typescript
ApiResponse<GitHubRepository | null>
```

**Example:**
```typescript
const response = await window.electronAPI.github.getRepository('aerowork', 'aero-work');
if (response.data) {
  console.log('Default branch:', response.data.default_branch);
}
```

**Returns null if:**
- Repository doesn't exist
- User doesn't have access
- Repository is archived

---

### `github:validateScopes`

Validate that the stored token has required OAuth scopes.

**Parameters:**
```typescript
requiredScopes?: string[]  // Default: ['repo']
```

**Response:**
```typescript
ApiResponse<{
  valid: boolean;
  missingScopes: string[];
}>
```

**Example:**
```typescript
const response = await window.electronAPI.github.validateScopes(['repo', 'read:org']);
if (!response.data?.valid) {
  console.log('Missing scopes:', response.data?.missingScopes);
  // Re-authenticate with additional scopes
}
```

---

## Type Definitions

### GitHubRepository

```typescript
interface GitHubRepository {
  id: number;                // GitHub's unique repo ID
  name: string;              // Repository name (e.g., 'aero-work')
  full_name: string;         // Full name (e.g., 'aerowork/aero-work')
  owner: {
    login: string;           // Owner username/org
    avatar_url: string;      // Owner avatar URL
    type: 'User' | 'Organization';
  };
  private: boolean;          // Visibility
  default_branch: string;    // e.g., 'main'
  clone_url: string;         // HTTPS clone URL
  html_url: string;          // Web URL
  description: string | null;
  archived: boolean;
  permissions?: {
    admin: boolean;
    push: boolean;
    pull: boolean;
  };
}
```

### GitHubAuthState

```typescript
interface GitHubAuthState {
  isAuthenticated: boolean;
  token?: string;
  user?: {
    login: string;
    avatar_url: string;
    name: string | null;
  };
}
```

## Required OAuth Scopes

| Scope | Description | Required For |
|-------|-------------|--------------|
| `repo` | Full repository access | Cloning, reading issues |
| `read:org` | Read organization data | Accessing org repos (optional) |
