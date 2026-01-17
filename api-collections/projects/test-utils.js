/**
 * Projects API Test Utilities
 *
 * Usage: Open Electron DevTools (Cmd+Option+I) and paste this file's contents,
 * or load it via: copy(await fetch('/api-collections/projects/test-utils.js').then(r => r.text()))
 *
 * Then run individual tests:
 *   await ProjectsAPI.test.listProjects()
 *   await GitHubAPI.test.checkAuth()
 *   await GitAPI.test.checkDirectory('/path/to/dir')
 */

// ============================================
// PROJECTS API TESTS
// ============================================
const ProjectsAPI = {
  test: {
    // List all projects
    async listProjects() {
      console.log('📋 Testing projects:list...')
      const result = await window.electronAPI.projects.list()
      console.log('Result:', result)
      return result
    },

    // List with filter
    async listWithFilter(filter) {
      console.log('🔍 Testing projects:list with filter:', filter)
      const result = await window.electronAPI.projects.list(filter)
      console.log('Result:', result)
      return result
    },

    // Get project by ID
    async getById(id) {
      console.log('🔎 Testing projects:getById:', id)
      const result = await window.electronAPI.projects.getById(id)
      console.log('Result:', result)
      return result
    },

    // Create a test project (use with caution)
    async create(input) {
      console.log('➕ Testing projects:create:', input)
      const result = await window.electronAPI.projects.create(input)
      console.log('Result:', result)
      return result
    },

    // Update last opened
    async updateLastOpened(id) {
      console.log('🕐 Testing projects:updateLastOpened:', id)
      const result = await window.electronAPI.projects.updateLastOpened(id)
      console.log('Result:', result)
      return result
    },

    // Delete project
    async delete(id) {
      console.log('🗑️ Testing projects:delete:', id)
      const result = await window.electronAPI.projects.delete(id)
      console.log('Result:', result)
      return result
    },

    // Check if exists by GitHub repo ID
    async existsByRepoId(githubRepoId) {
      console.log('❓ Testing projects:existsByGitHubRepoId:', githubRepoId)
      const result = await window.electronAPI.projects.existsByGitHubRepoId(githubRepoId)
      console.log('Result:', result)
      return result
    },
  },

  // Sample data for testing
  sampleInput: {
    githubOwner: 'test-owner',
    githubRepo: 'test-repo',
    githubRepoId: 123456789,
    localPath: '/tmp/test-repo',
    isPrivate: false,
    defaultBranch: 'main',
  },
}

// ============================================
// GITHUB API TESTS
// ============================================
const GitHubAPI = {
  test: {
    // Check authentication status
    async checkAuth() {
      console.log('🔐 Testing github:isAuthenticated...')
      const result = await window.electronAPI.github.isAuthenticated()
      console.log('Result:', result)
      return result
    },

    // Get auth state with user info
    async getAuthState() {
      console.log('👤 Testing github:getAuthState...')
      const result = await window.electronAPI.github.getAuthState()
      console.log('Result:', result)
      return result
    },

    // Store a token (use your actual token)
    async storeToken(token) {
      console.log('💾 Testing github:storeToken...')
      const result = await window.electronAPI.github.storeToken(token)
      console.log('Result:', result)
      return result
    },

    // Clear stored token
    async clearToken() {
      console.log('🧹 Testing github:clearToken...')
      const result = await window.electronAPI.github.clearToken()
      console.log('Result:', result)
      return result
    },

    // Get all repositories (requires auth)
    async getRepositories() {
      console.log('📚 Testing github:getRepositories...')
      const result = await window.electronAPI.github.getRepositories()
      console.log('Result:', result)
      if (result.success && result.data) {
        console.log(`Found ${result.data.length} repositories`)
      }
      return result
    },

    // Get specific repository
    async getRepository(owner, repo) {
      console.log(`📁 Testing github:getRepository: ${owner}/${repo}...`)
      const result = await window.electronAPI.github.getRepository(owner, repo)
      console.log('Result:', result)
      return result
    },

    // Validate token scopes
    async validateScopes(scopes = ['repo']) {
      console.log('🔍 Testing github:validateScopes:', scopes)
      const result = await window.electronAPI.github.validateScopes(scopes)
      console.log('Result:', result)
      return result
    },
  },
}

// ============================================
// GIT API TESTS
// ============================================
const GitAPI = {
  test: {
    // Check if directory exists
    async checkDirectory(path) {
      console.log('📂 Testing git:directoryExists:', path)
      const result = await window.electronAPI.git.directoryExists(path)
      console.log('Result:', result)
      return result
    },

    // Check if directory is a git repo
    async isRepository(path) {
      console.log('🔍 Testing git:isRepository:', path)
      const result = await window.electronAPI.git.isRepository(path)
      console.log('Result:', result)
      return result
    },

    // Get current branch
    async getCurrentBranch(path) {
      console.log('🌿 Testing git:getCurrentBranch:', path)
      const result = await window.electronAPI.git.getCurrentBranch(path)
      console.log('Result:', result)
      return result
    },

    // Get repository status
    async getStatus(path) {
      console.log('📊 Testing git:getStatus:', path)
      const result = await window.electronAPI.git.getStatus(path)
      console.log('Result:', result)
      return result
    },

    // Validate remote matches expected
    async validateRemote(path, owner, repo) {
      console.log(`🔗 Testing git:validateRemote: ${path} -> ${owner}/${repo}`)
      const result = await window.electronAPI.git.validateRemote(path, owner, repo)
      console.log('Result:', result)
      return result
    },

    // Clone repository (use with caution)
    async clone(owner, repo, targetPath) {
      console.log(`📥 Testing git:clone: ${owner}/${repo} -> ${targetPath}`)
      const result = await window.electronAPI.git.clone(owner, repo, targetPath)
      console.log('Result:', result)
      return result
    },

    // Pull latest changes
    async pull(path) {
      console.log('⬇️ Testing git:pull:', path)
      const result = await window.electronAPI.git.pull(path)
      console.log('Result:', result)
      return result
    },
  },
}

// ============================================
// DIALOG API TESTS
// ============================================
const DialogAPI = {
  test: {
    // Open directory picker
    async selectDirectory() {
      console.log('📁 Testing dialog:selectDirectory...')
      const result = await window.electronAPI.dialog.selectDirectory()
      console.log('Result:', result)
      return result
    },

    // Show info message
    async showInfo(message, detail = '') {
      console.log('ℹ️ Testing dialog:showMessage (info)...')
      const result = await window.electronAPI.dialog.showMessage({
        type: 'info',
        title: 'Test Info',
        message: message,
        detail: detail,
        buttons: ['OK'],
      })
      console.log('Result:', result)
      return result
    },

    // Show confirmation dialog
    async showConfirm(message) {
      console.log('❓ Testing dialog:showMessage (question)...')
      const result = await window.electronAPI.dialog.showMessage({
        type: 'question',
        title: 'Test Confirmation',
        message: message,
        buttons: ['Yes', 'No'],
        defaultId: 1,
        cancelId: 1,
      })
      console.log('Result:', result)
      console.log('User clicked:', result.data?.response === 0 ? 'Yes' : 'No')
      return result
    },

    // Show error dialog
    async showError(title, content) {
      console.log('❌ Testing dialog:showError...')
      const result = await window.electronAPI.dialog.showError(title, content)
      console.log('Result:', result)
      return result
    },
  },
}

// ============================================
// RUN ALL TESTS
// ============================================
async function runAllTests() {
  console.log('🚀 Running all API tests...\n')

  console.log('=== PROJECTS API ===')
  await ProjectsAPI.test.listProjects()

  console.log('\n=== GITHUB API ===')
  await GitHubAPI.test.checkAuth()
  await GitHubAPI.test.getAuthState()

  console.log('\n=== DIALOG API ===')
  await DialogAPI.test.showInfo('API Test', 'All basic tests completed!')

  console.log('\n✅ Basic tests completed!')
  console.log('Run individual tests for more specific operations.')
}

// Quick reference
console.log(`
╔════════════════════════════════════════════════════════════╗
║          PROJECTS API TEST UTILITIES LOADED                ║
╠════════════════════════════════════════════════════════════╣
║                                                            ║
║  PROJECTS:                                                 ║
║    ProjectsAPI.test.listProjects()                         ║
║    ProjectsAPI.test.getById(id)                            ║
║    ProjectsAPI.test.create(input)                          ║
║    ProjectsAPI.test.delete(id)                             ║
║                                                            ║
║  GITHUB:                                                   ║
║    GitHubAPI.test.checkAuth()                              ║
║    GitHubAPI.test.getAuthState()                           ║
║    GitHubAPI.test.storeToken(token)                        ║
║    GitHubAPI.test.getRepositories()                        ║
║    GitHubAPI.test.getRepository(owner, repo)               ║
║                                                            ║
║  GIT:                                                      ║
║    GitAPI.test.checkDirectory(path)                        ║
║    GitAPI.test.isRepository(path)                          ║
║    GitAPI.test.getStatus(path)                             ║
║    GitAPI.test.clone(owner, repo, targetPath)              ║
║                                                            ║
║  DIALOG:                                                   ║
║    DialogAPI.test.selectDirectory()                        ║
║    DialogAPI.test.showInfo(msg, detail)                    ║
║    DialogAPI.test.showConfirm(msg)                         ║
║                                                            ║
║  RUN ALL: runAllTests()                                    ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
`)
