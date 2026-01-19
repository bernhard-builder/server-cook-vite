import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';
import { ProcessInfo } from './types';

const execAsync = promisify(exec);

export class PortScanner {
  private isWindows = process.platform === 'win32';

  async scanPorts(): Promise<ProcessInfo[]> {
    try {
      if (this.isWindows) {
        return await this.scanWindowsPorts();
      } else {
        return await this.scanUnixPorts();
      }
    } catch (error) {
      console.error('Error scanning ports:', error);
      return [];
    }
  }

  private async scanWindowsPorts(): Promise<ProcessInfo[]> {
    const processes: ProcessInfo[] = [];
    
    try {
      // Get network connections
      const { stdout: netstatOutput } = await execAsync('netstat -ano');
      const lines = netstatOutput.split('\n');

      const portMap = new Map<number, { port: number; protocol: string; address: string }>();

      for (const line of lines) {
        const match = line.match(/^\s*(TCP|UDP)\s+(\S+):(\d+)\s+\S+\s+(\S+)\s+(\d+)/);
        if (match) {
          const [, protocol, address, port, state, pid] = match;
          if (state === 'LISTENING' || protocol === 'UDP') {
            const portNum = parseInt(port);
            const pidNum = parseInt(pid);
            
            if (!portMap.has(pidNum)) {
              portMap.set(pidNum, { port: portNum, protocol, address });
            }
          }
        }
      }

      // Get process details
      for (const [pid, portInfo] of portMap.entries()) {
        try {
          const { stdout: tasklistOutput } = await execAsync(`tasklist /FI "PID eq ${pid}" /FO CSV /NH`);
          const processMatch = tasklistOutput.match(/"([^"]+)"/);
          const processName = processMatch ? processMatch[1] : 'Unknown';

          // Try to get command line
          let command = processName;
          let processPath: string | undefined;
          
          try {
            const { stdout: wmicOutput } = await execAsync(`wmic process where processid=${pid} get commandline,executablepath /format:csv`);
            const wmicLines = wmicOutput.split('\n').filter(l => l.trim() && !l.startsWith('Node'));
            if (wmicLines.length > 0) {
              const parts = wmicLines[0].split(',');
              if (parts.length >= 2) {
                command = parts[1] || processName;
                processPath = parts[2];
              }
            }
          } catch (wmicError) {
            // WMIC failed, continue with basic info
          }

          processes.push({
            pid,
            port: portInfo.port,
            protocol: portInfo.protocol,
            address: portInfo.address,
            processName: this.beautifyProcessName(processName, command),
            command,
            path: processPath,
            status: 'active'
          });
        } catch (error) {
          // Process might have ended
        }
      }
    } catch (error) {
      console.error('Windows port scan error:', error);
    }

    return processes;
  }

  private async scanUnixPorts(): Promise<ProcessInfo[]> {
    const processes: ProcessInfo[] = [];
    
    try {
      // Use lsof to get listening ports
      const { stdout } = await execAsync('lsof -i -P -n | grep LISTEN || true');
      const lines = stdout.split('\n').filter(l => l.trim());

      for (const line of lines) {
        const parts = line.split(/\s+/);
        if (parts.length < 9) continue;

        const processName = parts[0];
        const pid = parseInt(parts[1]);
        const addressPort = parts[8];
        
        const portMatch = addressPort.match(/:(\d+)$/);
        if (!portMatch) continue;
        
        const port = parseInt(portMatch[1]);
        const address = addressPort.split(':')[0] || '*';

        // Get full command
        let command = processName;
        let processPath: string | undefined;
        
        try {
          const { stdout: psOutput } = await execAsync(`ps -p ${pid} -o command=`);
          command = psOutput.trim();
          
          // Try to extract path
          const pathMatch = command.match(/(?:^|\s)(\/[^\s]+)/);
          if (pathMatch) {
            processPath = pathMatch[1];
          }
        } catch (psError) {
          // Process might have ended
        }

        processes.push({
          pid,
          port,
          protocol: 'TCP',
          address,
          processName: this.beautifyProcessName(processName, command),
          command,
          path: processPath,
          status: 'active'
        });
      }
    } catch (error) {
      console.error('Unix port scan error:', error);
    }

    return processes;
  }

  private beautifyProcessName(processName: string, command: string): string {
    const lowerCommand = command.toLowerCase();
    
    // Detect common frameworks
    if (lowerCommand.includes('next dev') || lowerCommand.includes('next-server')) {
      return '⚡ Next.js Dev';
    }
    if (lowerCommand.includes('vite') && !lowerCommand.includes('vitest')) {
      return '⚡ Vite Dev Server';
    }
    if (lowerCommand.includes('webpack')) {
      return '📦 Webpack Dev Server';
    }
    if (lowerCommand.includes('react-scripts')) {
      return '⚛️ React Dev Server';
    }
    if (lowerCommand.includes('ng serve') || lowerCommand.includes('angular')) {
      return '🅰️ Angular Dev Server';
    }
    if (lowerCommand.includes('vue-cli-service')) {
      return '💚 Vue Dev Server';
    }
    if (lowerCommand.includes('nuxt')) {
      return '💚 Nuxt.js Dev';
    }
    if (lowerCommand.includes('gatsby')) {
      return '🟣 Gatsby Dev Server';
    }
    if (lowerCommand.includes('remix')) {
      return '💿 Remix Dev Server';
    }
    if (lowerCommand.includes('flask')) {
      return '🐍 Flask Server';
    }
    if (lowerCommand.includes('django')) {
      return '🐍 Django Server';
    }
    if (lowerCommand.includes('rails')) {
      return '💎 Rails Server';
    }
    if (lowerCommand.includes('docker')) {
      return '🐳 Docker';
    }
    if (lowerCommand.includes('nginx')) {
      return '🌐 Nginx';
    }
    if (lowerCommand.includes('apache') || lowerCommand.includes('httpd')) {
      return '🌐 Apache';
    }
    if (lowerCommand.includes('postgres')) {
      return '🐘 PostgreSQL';
    }
    if (lowerCommand.includes('mysql')) {
      return '🐬 MySQL';
    }
    if (lowerCommand.includes('mongo')) {
      return '🍃 MongoDB';
    }
    if (lowerCommand.includes('redis')) {
      return '📮 Redis';
    }

    return processName;
  }

  async killProcess(pid: number): Promise<boolean> {
    try {
      if (this.isWindows) {
        await execAsync(`taskkill /F /PID ${pid}`);
      } else {
        await execAsync(`kill -9 ${pid}`);
      }
      return true;
    } catch (error) {
      console.error(`Error killing process ${pid}:`, error);
      return false;
    }
  }

  async detectZombies(processes: ProcessInfo[]): Promise<ProcessInfo[]> {
    const zombies: ProcessInfo[] = [];

    for (const proc of processes) {
      if (proc.path) {
        const dir = path.dirname(proc.path);
        
        // Check if the directory still exists
        if (!fs.existsSync(dir)) {
          proc.isZombie = true;
          proc.status = 'zombie';
          zombies.push(proc);
        }
      }
    }

    return zombies;
  }

  async detectConflicts(processes: ProcessInfo[]): Promise<void> {
    const portGroups = new Map<number, ProcessInfo[]>();
    
    for (const proc of processes) {
      if (!portGroups.has(proc.port)) {
        portGroups.set(proc.port, []);
      }
      portGroups.get(proc.port)!.push(proc);
    }

    // Mark conflicts
    for (const [port, procs] of portGroups.entries()) {
      if (procs.length > 1) {
        procs.forEach(p => p.status = 'conflict');
      }
    }
  }

  async clearCache(workspacePath: string): Promise<boolean> {
    const cacheDirs = [
      '.turbo',
      '.next',
      'node_modules/.cache',
      '.parcel-cache',
      'dist',
      'build/.cache'
    ];

    try {
      for (const dir of cacheDirs) {
        const fullPath = path.join(workspacePath, dir);
        if (fs.existsSync(fullPath)) {
          await this.deleteDirectory(fullPath);
        }
      }
      return true;
    } catch (error) {
      console.error('Error clearing cache:', error);
      return false;
    }
  }

  private async deleteDirectory(dirPath: string): Promise<void> {
    if (fs.existsSync(dirPath)) {
      fs.rmSync(dirPath, { recursive: true, force: true });
    }
  }
}
