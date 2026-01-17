# Git API

Local Git repository operations using simple-git.

## Channels

### `git:clone`

Clone a GitHub repository to a local directory.

**Parameters:**
```typescript
owner: string;      // GitHub owner/org (e.g., 'aerowork')
repo: string;       // Repository name (e.g., 'aero-work')
targetPath: string; // Absolute path for clone destination
```

**Response:**
```typescript
ApiResponse<GitOperationResult>
```

**Example:**
```typescript
const response = await window.electronAPI.git.clone(
  'aerowork',
  'aero-work',
  '/Users/dev/projects/aero-work'
);

if (response.data?.success) {
  console.log('Cloned successfully');
} else {
  console.error('Clone failed:', response.data?.error);
}
```

**Behavior:**
- If target directory doesn't exist: Creates and clones
- If target is empty: Clones into it
- If target contains the same repo: Returns success (already exists)
- If target contains different repo: Returns error

**Possible Errors:**
| Error Code | Description |
|------------|-------------|
| `PARENT_DIR_NOT_FOUND` | Parent directory doesn't exist |
| `PARENT_DIR_NOT_WRITABLE` | No write permission |
| `TARGET_NOT_EMPTY` | Directory exists and not empty |
| `DIFFERENT_REPO_EXISTS` | Different Git repo exists at path |

---

### `git:validateRemote`

Validate that a local repository's remote origin matches the expected GitHub repository.

**Parameters:**
```typescript
dirPath: string;        // Local repository path
expectedOwner: string;  // Expected GitHub owner
expectedRepo: string;   // Expected repository name
```

**Response:**
```typescript
ApiResponse<GitOperationResult>
```

**Example:**
```typescript
const response = await window.electronAPI.git.validateRemote(
  '/Users/dev/projects/aero-work',
  'aerowork',
  'aero-work'
);

if (response.data?.success) {
  console.log('Remote matches expected repository');
} else {
  console.error('Mismatch:', response.data?.message);
}
```

**Possible Errors:**
| Error Code | Description |
|------------|-------------|
| `NOT_GIT_REPO` | Directory is not a Git repository |
| `NO_REMOTE_ORIGIN` | No remote named 'origin' configured |
| `REMOTE_MISMATCH` | Remote URL doesn't match expected repo |

---

### `git:isRepository`

Check if a directory is a Git repository.

**Parameters:**
```typescript
dirPath: string  // Directory path to check
```

**Response:**
```typescript
ApiResponse<boolean>
```

**Example:**
```typescript
const response = await window.electronAPI.git.isRepository('/Users/dev/projects/foo');
if (response.data) {
  console.log('Is a Git repository');
}
```

---

### `git:getCurrentBranch`

Get the current branch name of a repository.

**Parameters:**
```typescript
dirPath: string  // Repository path
```

**Response:**
```typescript
ApiResponse<string | null>
```

**Example:**
```typescript
const response = await window.electronAPI.git.getCurrentBranch('/Users/dev/projects/aero-work');
console.log('Current branch:', response.data); // e.g., 'main'
```

---

### `git:getStatus`

Get the status of a Git repository.

**Parameters:**
```typescript
dirPath: string  // Repository path
```

**Response:**
```typescript
ApiResponse<{
  isClean: boolean;       // No uncommitted changes
  current: string | null; // Current branch name
  tracking: string | null; // Tracking remote branch
  ahead: number;          // Commits ahead of remote
  behind: number;         // Commits behind remote
} | null>
```

**Example:**
```typescript
const response = await window.electronAPI.git.getStatus('/Users/dev/projects/aero-work');
if (response.data) {
  const { isClean, current, ahead, behind } = response.data;
  console.log(`Branch: ${current}, Clean: ${isClean}`);
  if (ahead > 0) console.log(`${ahead} commits to push`);
  if (behind > 0) console.log(`${behind} commits to pull`);
}
```

---

### `git:pull`

Pull latest changes from remote.

**Parameters:**
```typescript
dirPath: string  // Repository path
```

**Response:**
```typescript
ApiResponse<GitOperationResult>
```

**Example:**
```typescript
const response = await window.electronAPI.git.pull('/Users/dev/projects/aero-work');
if (response.data?.success) {
  console.log('Pulled latest changes');
}
```

---

### `git:directoryExists`

Check if a directory exists.

**Parameters:**
```typescript
dirPath: string  // Path to check
```

**Response:**
```typescript
ApiResponse<boolean>
```

**Example:**
```typescript
const response = await window.electronAPI.git.directoryExists('/Users/dev/projects');
```

---

### `git:isDirectoryWritable`

Check if a directory is writable.

**Parameters:**
```typescript
dirPath: string  // Directory path
```

**Response:**
```typescript
ApiResponse<boolean>
```

**Example:**
```typescript
const response = await window.electronAPI.git.isDirectoryWritable('/Users/dev/projects');
if (!response.data) {
  console.error('No write permission to directory');
}
```

---

### `git:isDirectoryEmpty`

Check if a directory is empty.

**Parameters:**
```typescript
dirPath: string  // Directory path
```

**Response:**
```typescript
ApiResponse<boolean>
```

**Example:**
```typescript
const response = await window.electronAPI.git.isDirectoryEmpty('/Users/dev/new-project');
if (response.data) {
  // Safe to clone into this directory
}
```

---

## Type Definitions

### GitOperationResult

```typescript
interface GitOperationResult {
  success: boolean;
  message: string;
  error?: string;  // Error code for programmatic handling
}
```

## URL Normalization

The Git service normalizes URLs for comparison:
- Removes trailing `.git`
- Converts SSH format (`git@github.com:owner/repo`) to HTTPS
- Case-insensitive comparison

**Example:**
```
git@github.com:AeroWork/App.git  →  https://github.com/aerowork/app
https://github.com/AeroWork/App  →  https://github.com/aerowork/app
```
