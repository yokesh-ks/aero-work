/**
 * Project database operations using better-sqlite3
 */
import { v4 as uuidv4 } from 'uuid';
import { getDatabase } from './index';
import type {
  Project,
  CreateProjectInput,
  ProjectFilter,
  ProjectStatus,
} from '../../types/project';

/**
 * Convert SQLite row to Project object
 */
function rowToProject(row: Record<string, unknown>): Project {
  return {
    id: row.id as string,
    name: row.name as string | null,
    description: row.description as string | null,
    github_owner: row.github_owner as string,
    github_repo: row.github_repo as string,
    github_repo_id: row.github_repo_id as number,
    local_path: row.local_path as string,
    status: row.status as ProjectStatus,
    is_private: Boolean(row.is_private),
    default_branch: row.default_branch as string,
    created_at: row.created_at as string,
    last_opened_at: row.last_opened_at as string | null,
  };
}

/**
 * Get all projects with optional filtering
 */
export function listProjects(filter?: ProjectFilter): Project[] {
  const db = getDatabase();

  let query = 'SELECT * FROM projects WHERE 1=1';
  const params: Record<string, unknown> = {};

  if (filter?.search) {
    query += ' AND (github_repo LIKE @search OR github_owner LIKE @search)';
    params.search = `%${filter.search}%`;
  }

  if (filter?.owner) {
    query += ' AND github_owner = @owner';
    params.owner = filter.owner;
  }

  if (filter?.status) {
    query += ' AND status = @status';
    params.status = filter.status;
  }

  if (filter?.recentDays) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - filter.recentDays);
    query += ' AND last_opened_at >= @cutoff';
    params.cutoff = cutoffDate.toISOString();
  }

  query += ' ORDER BY last_opened_at DESC NULLS LAST, created_at DESC';

  const stmt = db.prepare(query);
  const rows = stmt.all(params) as Record<string, unknown>[];

  return rows.map(rowToProject);
}

/**
 * Get a single project by ID
 */
export function getProjectById(id: string): Project | null {
  const db = getDatabase();
  const stmt = db.prepare('SELECT * FROM projects WHERE id = ?');
  const row = stmt.get(id) as Record<string, unknown> | undefined;

  return row ? rowToProject(row) : null;
}

/**
 * Get a project by GitHub repository ID
 */
export function getProjectByGitHubRepoId(githubRepoId: number): Project | null {
  const db = getDatabase();
  const stmt = db.prepare('SELECT * FROM projects WHERE github_repo_id = ?');
  const row = stmt.get(githubRepoId) as Record<string, unknown> | undefined;

  return row ? rowToProject(row) : null;
}



/**
 * Update project status
 */
export function updateProjectStatus(id: string, status: ProjectStatus): Project | null {
  const db = getDatabase();
  const stmt = db.prepare('UPDATE projects SET status = ? WHERE id = ?');
  const result = stmt.run(status, id);

  if (result.changes === 0) {
    return null;
  }

  return getProjectById(id);
}

/**
 * Update last opened timestamp
 */
export function updateLastOpened(id: string): Project | null {
  const db = getDatabase();
  const now = new Date().toISOString();
  const stmt = db.prepare('UPDATE projects SET last_opened_at = ? WHERE id = ?');
  const result = stmt.run(now, id);

  if (result.changes === 0) {
    return null;
  }

  return getProjectById(id);
}

/**
 * Create a new project
 */
export function createProject(input: CreateProjectInput): Project {
  console.log('DB: createProject called with input:', input);

  const db = getDatabase();
  console.log('DB: Got database connection');

  const id = uuidv4();
  const now = new Date().toISOString();

  console.log('DB: Generated ID:', id);

  const stmt = db.prepare(`
    INSERT INTO projects (
      id, name, description, github_owner, github_repo, github_repo_id, local_path,
      status, is_private, default_branch, created_at, last_opened_at
    ) VALUES (
      @id, @name, @description, @github_owner, @github_repo, @github_repo_id, @local_path,
      @status, @is_private, @default_branch, @created_at, @last_opened_at
    )
  `);

  const params = {
    id,
    name: input.name || null,
    description: input.description || null,
    github_owner: input.githubOwner || '',
    github_repo: input.githubRepo || '',
    github_repo_id: input.githubRepoId || 0,
    local_path: input.localPath,
    status: 'linked',
    is_private: input.isPrivate ? 1 : 0,
    default_branch: input.defaultBranch || 'main',
    created_at: now,
    last_opened_at: null,
  };

  console.log('DB: Running INSERT with params:', params);

  const result = stmt.run(params);
  console.log('DB: INSERT result:', result);

  console.log('DB: Retrieving created project by ID:', id);
  const project = getProjectById(id);
  console.log('DB: Retrieved project:', project);

  if (!project) {
    throw new Error('Failed to retrieve created project');
  }

  return project;
}

/**
 * Delete a project by ID
 */
export function deleteProject(id: string): boolean {
  const db = getDatabase();
  const stmt = db.prepare('DELETE FROM projects WHERE id = ?');
  const result = stmt.run(id);

  return result.changes > 0;
}

/**
 * Check if a project exists with the given GitHub repo ID
 */
export function projectExistsByGitHubRepoId(githubRepoId: number): boolean {
  const db = getDatabase();
  const stmt = db.prepare('SELECT 1 FROM projects WHERE github_repo_id = ? LIMIT 1');
  const row = stmt.get(githubRepoId);

  return row !== undefined;
}

/**
 * Get project count
 */
export function getProjectCount(): number {
  const db = getDatabase();
  const stmt = db.prepare('SELECT COUNT(*) as count FROM projects');
  const row = stmt.get() as { count: number };

  return row.count;
}
