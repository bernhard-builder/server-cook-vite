import React from 'react';
import { ExternalLink, RefreshCw } from 'lucide-react';
import { ProcessInfo, CommonPort } from '../types';
import { Button } from './ui/button';
import { vscode } from '../lib/vscode';

interface ExplorerListProps {
  processes: ProcessInfo[];
  commonPorts: CommonPort[];
  onKillProcess: (pid: number) => void;
  onStartPort: (port: number) => void;
  onRefresh: () => void;
}

export const ExplorerList: React.FC<ExplorerListProps> = ({ 
  processes, 
  commonPorts, 
  onKillProcess, 
  onStartPort,
  onRefresh
}) => {
  const openUrl = (port: number) => {
    vscode.postMessage({ 
      command: 'openUrl', 
      data: { url: `http://localhost:${port}` } 
    });
  };

  // Combine common ports and other active processes
  const allItems = [
    ...commonPorts.map(cp => ({
      port: cp.port,
      name: cp.name,
      isRunning: cp.isRunning,
      pid: processes.find(p => p.port === cp.port)?.pid,
      isCommon: true
    })),
    ...processes
      .filter(p => !commonPorts.some(cp => cp.port === p.port))
      .map(p => ({
        port: p.port,
        name: p.processName,
        isRunning: true,
        pid: p.pid,
        isCommon: false
      }))
  ].sort((a, b) => a.port - b.port);

  return (
    <div className="flex flex-col h-full bg-background select-none">
      <div className="flex items-center justify-between px-3 py-2 border-b bg-muted/30">
        <span className="text-[10px] font-bold uppercase tracking-wider opacity-60">Active Servers</span>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-5 w-5 p-0 hover:bg-primary/10" 
          onClick={onRefresh}
        >
          <RefreshCw className="w-3 h-3 text-primary" />
        </Button>
      </div>
      
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {allItems.length === 0 ? (
          <div className="p-4 text-center">
            <p className="text-[10px] text-muted-foreground italic">No servers detected</p>
          </div>
        ) : (
          <div className="divide-y divide-border/40">
            {allItems.map((item) => (
              <div 
                key={item.port} 
                className="group flex items-center justify-between px-3 py-2 hover:bg-accent/20 transition-colors"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${item.isRunning ? 'bg-green-500 animate-pulse-glow' : 'bg-muted-foreground/20'}`} />
                  
                  <div className="flex flex-col min-w-0">
                    <button 
                      onClick={() => openUrl(item.port)}
                      className="flex items-center gap-1 font-mono text-[11px] font-bold text-primary hover:underline w-fit"
                    >
                      :{item.port}
                      <ExternalLink className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                    <span className="text-[9px] text-muted-foreground truncate leading-none opacity-70">
                      {item.name}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1 ml-2">
                  {item.isRunning ? (
                    <Button
                      onClick={() => item.pid && onKillProcess(item.pid)}
                      variant="destructive"
                      size="sm"
                      className="h-6 w-12 text-[9px] font-bold uppercase tracking-tighter px-0 shadow-sm"
                    >
                      Kill
                    </Button>
                  ) : (
                    <Button
                      onClick={() => onStartPort(item.port)}
                      variant="default"
                      size="sm"
                      className="h-6 w-12 text-[9px] font-black uppercase tracking-tighter px-0 shadow-sm bg-orange-500 hover:bg-orange-600"
                    >
                      Cook
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
