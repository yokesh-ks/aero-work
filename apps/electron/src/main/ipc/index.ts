/**
 * IPC Handler Registration
 * Registers all IPC handlers for the main process
 */
import { registerProjectHandlers } from './project-handlers';
import { registerGitHubHandlers } from './github-handlers';
import { registerGitHandlers } from './git-handlers';
import { registerDialogHandlers } from './dialog-handlers';

/**
 * Register all IPC handlers
 * Call this once during app initialization
 */
export function registerAllIpcHandlers(): void {
  registerProjectHandlers();
  registerGitHubHandlers();
  registerGitHandlers();
  registerDialogHandlers();
}

export {
  registerProjectHandlers,
  registerGitHubHandlers,
  registerGitHandlers,
  registerDialogHandlers,
};
