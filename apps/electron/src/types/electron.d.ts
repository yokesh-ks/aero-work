/**
 * TypeScript declarations for the Electron API exposed via preload
 */
import type { ElectronAPI } from '../preload';

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

export {};
