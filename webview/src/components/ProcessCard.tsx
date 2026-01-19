import React from 'react';
import { X, Terminal, Folder, Skull, AlertTriangle, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardFooter } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ProcessInfo } from '../types';
import { vscode } from '../lib/vscode';

interface ProcessCardProps {
  process: ProcessInfo;
  onKill: (pid: number) => void;
}

export const ProcessCard: React.FC<ProcessCardProps> = ({ process, onKill }) => {
  const openUrl = () => {
    vscode.postMessage({ 
      command: 'openUrl', 
      data: { url: `http://localhost:${process.port}` } 
    });
  };

  const openDirectory = () => {
    if (process.path) {
      vscode.postMessage({ 
        command: 'openDirectory', 
        data: { path: process.path } 
      });
    }
  };

  const getStatusColor = () => {
    switch (process.status) {
      case 'zombie':
        return 'bg-red-500';
      case 'conflict':
        return 'bg-orange-500';
      default:
        return 'bg-green-500';
    }
  };

  const getStatusBadge = () => {
    switch (process.status) {
      case 'zombie':
        return <Badge variant="destructive" className="gap-0.5 text-[8px] h-3.5 px-1"><Skull className="w-2 h-2" /> Zombie</Badge>;
      case 'conflict':
        return <Badge variant="warning" className="gap-0.5 text-[8px] h-3.5 px-1"><AlertTriangle className="w-2 h-2" /> Conflict</Badge>;
      default:
        return <Badge variant="success" className="text-[8px] h-3.5 px-1 uppercase tracking-tighter">Active</Badge>;
    }
  };

  return (
    <Card className="group hover:shadow-xl transition-all duration-200 hover:-translate-y-1 overflow-hidden border-muted/30">
      <CardContent className="p-2.5">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <div className={`w-2 h-2 rounded-full ${getStatusColor()} animate-pulse-glow shrink-0`} />
            <div>
              <button 
                onClick={openUrl}
                className="font-mono text-base font-bold text-primary leading-none hover:underline flex items-center gap-1 group/port"
              >
                :{process.port}
                <ExternalLink className="w-3 h-3 opacity-0 group-hover/port:opacity-100 transition-opacity" />
              </button>
              <div className="text-[8px] text-muted-foreground uppercase tracking-tighter mt-0.5">
                {process.protocol} · {process.address}
              </div>
            </div>
          </div>
          {getStatusBadge()}
        </div>

        <div className="space-y-1.5">
          <div className="flex items-baseline justify-between gap-2">
            <div className="text-[11px] font-bold truncate leading-tight">{process.processName}</div>
            <div className="text-[8px] font-mono text-muted-foreground bg-muted/50 px-1 rounded">PID: {process.pid}</div>
          </div>

          {process.path && (
            <div className="flex flex-col gap-1 bg-accent/20 p-1.5 rounded border border-accent/20">
              <div className="flex items-start gap-1 text-[9px]">
                <Folder className="w-2.5 h-2.5 mt-0.5 shrink-0 text-primary/60" />
                <div className="flex-1 min-w-0">
                  <span className="break-all text-muted-foreground/80 leading-tight line-clamp-1" title={process.path}>{process.path}</span>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="h-5 text-[8px] py-0 px-1.5 w-fit gap-1 border-primary/20 hover:bg-primary/10"
                onClick={openDirectory}
              >
                <Folder className="w-2 h-2" />
                Open Directory
              </Button>
            </div>
          )}

          <div className="flex items-start gap-1 text-[9px] text-muted-foreground/60 bg-muted/20 p-1 rounded">
            <Terminal className="w-2.5 h-2.5 mt-0.5 shrink-0 opacity-50" />
            <code className="break-all line-clamp-1">{process.command}</code>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-2 pt-0">
        <Button
          onClick={() => onKill(process.pid)}
          variant="destructive"
          size="sm"
          className="w-full h-6 text-[10px] py-0 group-hover:shadow-md font-bold uppercase tracking-tighter"
        >
          <X className="w-2.5 h-2.5 mr-0.5" />
          Kill
        </Button>
      </CardFooter>
    </Card>
  );
};
