import * as fs from 'fs';
import * as path from 'path';
import { WorkspaceInfo } from './types';

export class WorkspaceDetector {
  async detectWorkspace(workspacePath: string): Promise<WorkspaceInfo> {
    const info: WorkspaceInfo = {
      type: 'standard',
      hasWorkspaces: false,
      hasTurboConfig: false
    };

    try {
      // Check for turbo.json
      const turboJsonPath = path.join(workspacePath, 'turbo.json');
      if (fs.existsSync(turboJsonPath)) {
        info.hasTurboConfig = true;
        info.type = 'turborepo';
      }

      // Check for package.json with workspaces
      const packageJsonPath = path.join(workspacePath, 'package.json');
      if (fs.existsSync(packageJsonPath)) {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
        
        if (packageJson.workspaces) {
          info.hasWorkspaces = true;
          if (info.type === 'standard') {
            info.type = 'monorepo';
          }
        }
      }

      // Check for pnpm-workspace.yaml
      const pnpmWorkspacePath = path.join(workspacePath, 'pnpm-workspace.yaml');
      if (fs.existsSync(pnpmWorkspacePath)) {
        info.hasWorkspaces = true;
        info.packageManager = 'pnpm';
        if (info.type === 'standard') {
          info.type = 'monorepo';
        }
      }

      // Check for lerna.json
      const lernaJsonPath = path.join(workspacePath, 'lerna.json');
      if (fs.existsSync(lernaJsonPath)) {
        info.hasWorkspaces = true;
        if (info.type === 'standard') {
          info.type = 'monorepo';
        }
      }

      // Detect package manager from lock files
      if (!info.packageManager) {
        if (fs.existsSync(path.join(workspacePath, 'pnpm-lock.yaml'))) {
          info.packageManager = 'pnpm';
        } else if (fs.existsSync(path.join(workspacePath, 'yarn.lock'))) {
          info.packageManager = 'yarn';
        } else if (fs.existsSync(path.join(workspacePath, 'package-lock.json'))) {
          info.packageManager = 'npm';
        }
      }
    } catch (error) {
      console.error('Error detecting workspace:', error);
    }

    return info;
  }
}
