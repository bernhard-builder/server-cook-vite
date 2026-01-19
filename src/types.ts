export interface ProcessInfo {
  pid: number;
  port: number;
  protocol: string;
  address: string;
  processName: string;
  command: string;
  path?: string;
  isZombie?: boolean;
  status: 'active' | 'zombie' | 'conflict';
}

export interface WorkspaceInfo {
  type: 'monorepo' | 'turborepo' | 'standard';
  hasWorkspaces: boolean;
  hasTurboConfig: boolean;
  packageManager?: 'npm' | 'pnpm' | 'yarn';
}

export interface MessageToWebview {
  command: 'updateProcesses' | 'updateWorkspace' | 'error';
  data?: any;
}

export interface MessageFromWebview {
  command: 'refresh' | 'detect' | 'killProcess' | 'killZombies' | 'stopAll' | 'clearCache' | 'getVersion' | 'startPort' | 'openDirectory' | 'openUrl';
  data?: any;
}
