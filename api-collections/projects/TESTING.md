# Testing the Projects API

Since this is an Electron IPC-based API (not HTTP REST), testing is done via the DevTools console.

## Quick Start

1. **Start the app:**
   ```bash
   cd apps/electron
   npm run dev
   ```

2. **Open DevTools:** Press `Cmd+Option+I` (macOS) or `Ctrl+Shift+I` (Windows/Linux)

3. **Go to Console tab**

4. **Run tests** by copying commands from below

---

## Quick Test Commands

### Test Projects API

```javascript
// List all projects
await window.electronAPI.projects.list()

// List with search filter
await window.electronAPI.projects.list({ search: 'aero' })

// Create a test project
await window.electronAPI.projects.create({
  githubOwner: 'test-owner',
  githubRepo: 'test-repo',
  githubRepoId: Date.now(),
  localPath: '/tmp/test-repo',
  isPrivate: false,
  defaultBranch: 'main'
})

// Get project by ID (use ID from create response)
await window.electronAPI.projects.getById('your-project-id')

// Delete project
await window.electronAPI.projects.delete('your-project-id')
```

### Test GitHub API

```javascript
// Check if authenticated
await window.electronAPI.github.isAuthenticated()

// Get auth state with user info
await window.electronAPI.github.getAuthState()

// Store a GitHub token (get from https://github.com/settings/tokens)
await window.electronAPI.github.storeToken('ghp_your_token_here')

// After storing token, fetch repositories
await window.electronAPI.github.getRepositories()

// Get specific repository
await window.electronAPI.github.getRepository('owner', 'repo-name')

// Clear token (logout)
await window.electronAPI.github.clearToken()
```

### Test Git API

```javascript
// Check if a directory exists
await window.electronAPI.git.directoryExists('/Users/you/projects')

// Check if directory is a git repo
await window.electronAPI.git.isRepository('/Users/you/projects/some-repo')

// Get current branch
await window.electronAPI.git.getCurrentBranch('/Users/you/projects/some-repo')

// Get repo status (clean, ahead/behind, etc.)
await window.electronAPI.git.getStatus('/Users/you/projects/some-repo')

// Validate remote matches expected
await window.electronAPI.git.validateRemote('/Users/you/projects/aero-work', 'aerowork', 'aero-work')
```

### Test Dialog API

```javascript
// Open directory picker
await window.electronAPI.dialog.selectDirectory()

// Show info message
await window.electronAPI.dialog.showMessage({
  type: 'info',
  title: 'Test',
  message: 'Hello from API!',
  buttons: ['OK']
})

// Show confirmation dialog
await window.electronAPI.dialog.showMessage({
  type: 'question',
  title: 'Confirm',
  message: 'Do you want to proceed?',
  buttons: ['Yes', 'No'],
  defaultId: 1
})
```

---

## Full Test Suite

Copy and paste the contents of [test-utils.js](./test-utils.js) into the console, then run:

```javascript
// Run all basic tests
runAllTests()

// Or run specific test groups
await ProjectsAPI.test.listProjects()
await GitHubAPI.test.checkAuth()
await DialogAPI.test.selectDirectory()
```

---

## End-to-End Test: Create Project Flow

This tests the complete project creation workflow:

```javascript
// 1. Store GitHub token
await window.electronAPI.github.storeToken('ghp_your_token')

// 2. Verify authentication
const auth = await window.electronAPI.github.getAuthState()
console.log('Logged in as:', auth.data?.user?.login)

// 3. Get list of repositories
const repos = await window.electronAPI.github.getRepositories()
console.log('Available repos:', repos.data?.map(r => r.full_name))

// 4. Select a directory for the project
const dir = await window.electronAPI.dialog.selectDirectory()
console.log('Selected:', dir.data?.filePath)

// 5. Pick a repo from the list (using first one as example)
const selectedRepo = repos.data?.[0]

// 6. Clone the repository
const clone = await window.electronAPI.git.clone(
  selectedRepo.owner.login,
  selectedRepo.name,
  dir.data?.filePath + '/' + selectedRepo.name
)
console.log('Clone result:', clone)

// 7. Create project record
const project = await window.electronAPI.projects.create({
  githubOwner: selectedRepo.owner.login,
  githubRepo: selectedRepo.name,
  githubRepoId: selectedRepo.id,
  localPath: dir.data?.filePath + '/' + selectedRepo.name,
  isPrivate: selectedRepo.private,
  defaultBranch: selectedRepo.default_branch
})
console.log('Project created:', project)

// 8. Verify project was created
const projects = await window.electronAPI.projects.list()
console.log('All projects:', projects)
```

---

## Expected Response Format

All API calls return:

```javascript
{
  success: boolean,  // true if operation succeeded
  data?: T,          // result data (type varies by endpoint)
  error?: string     // error message if success is false
}
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| `window.electronAPI is undefined` | App not started, or preload script error |
| `Not authenticated` | Run `github.storeToken()` first |
| `Token invalid` | Generate new token at github.com/settings/tokens |
| Database errors | Check if app has write permissions to userData |
