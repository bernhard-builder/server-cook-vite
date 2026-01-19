import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { DataTable } from './components/DataTable';
import { CommonPorts } from './components/CommonPorts';
import { ExplorerList } from './components/ExplorerList';
import { ProcessInfo, WorkspaceInfo, CommonPort } from './types';
import { vscode } from './lib/vscode';

function App() {
  const [processes, setProcesses] = useState<ProcessInfo[]>([]);
  const [workspaceInfo, setWorkspaceInfo] = useState<WorkspaceInfo | undefined>();
  const [version, setVersion] = useState('0.5.6');
  const [commonPorts, setCommonPorts] = useState<CommonPort[]>([]);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  useEffect(() => {
    // Apply theme class to root
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    // Request initial data
    vscode.postMessage({ command: 'refresh' });
    vscode.postMessage({ command: 'getVersion' });

    // Listen for messages from the extension
    const handleMessage = (event: MessageEvent) => {
      const message = event.data;
      
      switch (message.command) {
        case 'updateProcesses':
          if (message.data) {
            setProcesses(message.data.processes || []);
            if (message.data.workspaceInfo) {
              setWorkspaceInfo(message.data.workspaceInfo);
            }
          }
          break;
        
        case 'updateVersion':
          if (message.data?.version) {
            setVersion(message.data.version);
          }
          break;
        
        case 'error':
          console.error('Error from extension:', message.data);
          break;
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Update common ports status when processes change
  useEffect(() => {
    const ports = [
      { port: 3000, name: 'Next.js Dev', description: 'Primary Next.js development server' },
      { port: 3001, name: 'Next.js Alt', description: 'Alternative Next.js development port' },
    ];

    const updatedPorts = ports.map(p => ({
      ...p,
      isRunning: processes.some(proc => proc.port === p.port)
    }));

    setCommonPorts(updatedPorts);
  }, [processes]);

  const handleRefresh = () => {
    vscode.postMessage({ command: 'refresh' });
  };

  const handleDetect = () => {
    vscode.postMessage({ command: 'detect' });
  };

  const handleKillProcess = (pid: number) => {
    vscode.postMessage({ command: 'killProcess', data: { pid } });
  };

  const handleKillZombies = () => {
    vscode.postMessage({ command: 'killZombies' });
  };

  const handleClearCache = () => {
    vscode.postMessage({ command: 'clearCache' });
  };

  const handleStopAll = () => {
    vscode.postMessage({ command: 'stopAll' });
  };

  const handleStartPort = (port: number) => {
    vscode.postMessage({ command: 'startPort', data: { port } });
  };

  const zombieCount = processes.filter(p => p.status === 'zombie').length;

  if (vscode.context === 'explorer') {
    return (
      <div className="h-screen overflow-hidden flex flex-col bg-background">
        <ExplorerList 
          processes={processes}
          commonPorts={commonPorts}
          onKillProcess={handleKillProcess}
          onStartPort={handleStartPort}
          onRefresh={handleRefresh}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <Header
        version={version}
        workspaceInfo={workspaceInfo}
        theme={theme}
        onThemeToggle={() => setTheme(prev => prev === 'light' ? 'dark' : 'light')}
        onRefresh={handleRefresh}
        onDetect={handleDetect}
        onKillZombies={handleKillZombies}
        onClearCache={handleClearCache}
        onStopAll={handleStopAll}
        zombieCount={zombieCount}
        totalProcesses={processes.length}
      />
      
      <main className="pb-8">
        <CommonPorts commonPorts={commonPorts} onStartPort={handleStartPort} />
        <DataTable processes={processes} onKillProcess={handleKillProcess} />
      </main>
    </div>
  );
}

export default App;
