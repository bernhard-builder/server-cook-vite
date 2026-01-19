import React from 'react';
import { X, Skull, AlertTriangle, PackageX, ExternalLink } from 'lucide-react';
import { ProcessInfo } from '../types';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { vscode } from '../lib/vscode';

interface DataTableProps {
  processes: ProcessInfo[];
  onKillProcess: (pid: number) => void;
}

export const DataTable: React.FC<DataTableProps> = ({ processes, onKillProcess }) => {
  const openUrl = (port: number) => {
    vscode.postMessage({ 
      command: 'openUrl', 
      data: { url: `http://localhost:${port}` } 
    });
  };

  const openDirectory = (filePath: string) => {
    vscode.postMessage({ 
      command: 'openDirectory', 
      data: { path: filePath } 
    });
  };

  const getStatusBadge = (status: ProcessInfo['status']) => {
    switch (status) {
      case 'zombie':
        return <Badge variant="destructive" className="gap-1 text-[10px] h-5 px-1.5"><Skull className="w-3 h-3" /> Zombie</Badge>;
      case 'conflict':
        return <Badge variant="warning" className="gap-1 text-[10px] h-5 px-1.5"><AlertTriangle className="w-3 h-3" /> Conflict</Badge>;
      default:
        return <Badge variant="success" className="text-[10px] h-5 px-1.5">Active</Badge>;
    }
  };

  if (processes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <PackageX className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No Processes Found</h3>
        <p className="text-sm text-muted-foreground text-center max-w-md">
          No active processes detected on local ports. Click "Detect All" to scan for running servers.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-3 text-[10px] font-bold uppercase tracking-wider">Status / Action</th>
                <th className="text-left p-3 text-[10px] font-bold uppercase tracking-wider">Port</th>
                <th className="text-left p-3 text-[10px] font-bold uppercase tracking-wider">Process / Location</th>
                <th className="text-left p-3 text-[10px] font-bold uppercase tracking-wider">PID</th>
                <th className="text-left p-3 text-[10px] font-bold uppercase tracking-wider">Protocol</th>
                <th className="text-left p-3 text-[10px] font-bold uppercase tracking-wider">Command</th>
              </tr>
            </thead>
            <tbody>
              {processes.map((process, index) => (
                <tr
                  key={process.pid}
                  className={`border-t hover:bg-muted/30 transition-colors ${
                    index % 2 === 0 ? 'bg-background' : 'bg-muted/10'
                  }`}
                >
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      {getStatusBadge(process.status)}
                      <Button
                        onClick={() => onKillProcess(process.pid)}
                        variant="destructive"
                        size="sm"
                        className="h-6 px-2 text-[9px] font-bold"
                      >
                        <X className="w-3 h-3 mr-1" />
                        Kill
                      </Button>
                    </div>
                  </td>
                  <td className="p-3">
                    <button 
                      onClick={() => openUrl(process.port)}
                      className="font-mono font-bold text-primary hover:underline flex items-center gap-1 group/port"
                    >
                      :{process.port}
                      <ExternalLink className="w-2.5 h-2.5 opacity-0 group-hover/port:opacity-100 transition-opacity" />
                    </button>
                    <div className="text-[10px] text-muted-foreground">{process.address}</div>
                  </td>
                  <td className="p-3">
                    <div className="font-bold text-[11px] mb-1">{process.processName}</div>
                    {process.path && (
                      <div className="flex items-center gap-2">
                        <div className="text-[9px] text-muted-foreground truncate max-w-[200px]" title={process.path}>
                          📁 {process.path}
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-5 px-1 text-[8px] hover:bg-primary/10 text-primary"
                          onClick={() => openDirectory(process.path!)}
                        >
                          Open Dir
                        </Button>
                      </div>
                    )}
                  </td>
                  <td className="p-3 text-[11px]">
                    <code>{process.pid}</code>
                  </td>
                  <td className="p-3">
                    <Badge variant="outline" className="text-[9px] h-4">
                      {process.protocol}
                    </Badge>
                  </td>
                  <td className="p-3">
                    <code className="text-[9px] text-muted-foreground truncate block max-w-md">
                      {process.command}
                    </code>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
