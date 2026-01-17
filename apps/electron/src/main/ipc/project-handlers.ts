/**
 * IPC handlers for project operations
 */
import { ipcMain, IpcMainInvokeEvent } from 'electron';
import {
  listProjects,
  getProjectById,
  createProject,
  updateProjectStatus,
  updateLastOpened,
  deleteProject,
  projectExistsByGitHubRepoId,
  getProjectByGitHubRepoId,
} from '../db/projects';
import type {
  CreateProjectInput,
  ProjectFilter,
  ProjectStatus,
  ApiResponse,
  Project,
} from '../../types/project';

/**
 * Register all project-related IPC handlers
 */
export function registerProjectHandlers(): void {
  /**
   * List all projects with optional filtering
   */
  ipcMain.handle(
    'projects:list',
    async (_event: IpcMainInvokeEvent, filter?: ProjectFilter): Promise<ApiResponse<Project[]>> => {
      try {
        const projects = listProjects(filter);
        return { success: true, data: projects };
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return { success: false, error: message };
      }
    }
  );

  /**
   * Get a single project by ID
   */
  ipcMain.handle(
    'projects:getById',
    async (_event: IpcMainInvokeEvent, id: string): Promise<ApiResponse<Project | null>> => {
      try {
        const project = getProjectById(id);
        return { success: true, data: project };
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return { success: false, error: message };
      }
    }
  );

  /**
   * Get a project by GitHub repository ID
   */
  ipcMain.handle(
    'projects:getByGitHubRepoId',
    async (_event: IpcMainInvokeEvent, githubRepoId: number): Promise<ApiResponse<Project | null>> => {
      try {
        const project = getProjectByGitHubRepoId(githubRepoId);
        return { success: true, data: project };
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return { success: false, error: message };
      }
    }
  );

  /**
   * Create a new project
   */
  ipcMain.handle(
    'projects:create',
    async (_event: IpcMainInvokeEvent, input: CreateProjectInput): Promise<ApiResponse<Project>> => {
      try {
        console.log('IPC: Creating project with input:', input);

        // Only check for existing GitHub repo if we're actually linking to GitHub
        if (input.githubRepoId && input.githubRepoId > 0 && projectExistsByGitHubRepoId(input.githubRepoId)) {
          console.log('IPC: GitHub repo already exists');
          return {
            success: false,
            error: 'A project already exists for this GitHub repository',
          };
        }

        console.log('IPC: Calling createProject function');
        const project = createProject(input);
        console.log('IPC: Project created successfully:', project);

        return { success: true, data: project };
      } catch (error) {
        console.error('IPC: Error creating project:', error);
        const message = error instanceof Error ? error.message : 'Unknown error';
        return { success: false, error: message };
      }
    }
  );

  /**
   * Update project status
   */
  ipcMain.handle(
    'projects:updateStatus',
    async (
      _event: IpcMainInvokeEvent,
      id: string,
      status: ProjectStatus
    ): Promise<ApiResponse<Project | null>> => {
      try {
        const project = updateProjectStatus(id, status);
        if (!project) {
          return { success: false, error: 'Project not found' };
        }
        return { success: true, data: project };
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return { success: false, error: message };
      }
    }
  );

  /**
   * Update last opened timestamp
   */
  ipcMain.handle(
    'projects:updateLastOpened',
    async (_event: IpcMainInvokeEvent, id: string): Promise<ApiResponse<Project | null>> => {
      try {
        const project = updateLastOpened(id);
        if (!project) {
          return { success: false, error: 'Project not found' };
        }
        return { success: true, data: project };
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return { success: false, error: message };
      }
    }
  );

  /**
   * Delete a project
   */
  ipcMain.handle(
    'projects:delete',
    async (_event: IpcMainInvokeEvent, id: string): Promise<ApiResponse<boolean>> => {
      try {
        const deleted = deleteProject(id);
        if (!deleted) {
          return { success: false, error: 'Project not found' };
        }
        return { success: true, data: true };
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return { success: false, error: message };
      }
    }
  );

  /**
   * Check if a project exists for a GitHub repo
   */
  ipcMain.handle(
    'projects:existsByGitHubRepoId',
    async (_event: IpcMainInvokeEvent, githubRepoId: number): Promise<ApiResponse<boolean>> => {
      try {
        const exists = projectExistsByGitHubRepoId(githubRepoId);
        return { success: true, data: exists };
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return { success: false, error: message };
      }
    }
  );
}
