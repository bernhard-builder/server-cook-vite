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

export interface CommonPort {
  port: number;
  name: string;
  description: string;
  isRunning: boolean;
}
