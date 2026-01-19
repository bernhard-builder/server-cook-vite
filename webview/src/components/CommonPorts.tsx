import React from 'react';
import { Play, CheckCircle2, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { CommonPort } from '../types';
import { vscode } from '../lib/vscode';

interface CommonPortsProps {
  commonPorts: CommonPort[];
  onStartPort: (port: number) => void;
}

export const CommonPorts: React.FC<CommonPortsProps> = ({ commonPorts, onStartPort }) => {
  const openUrl = (port: number) => {
    vscode.postMessage({ 
      command: 'openUrl', 
      data: { url: `http://localhost:${port}` } 
    });
  };

  if (commonPorts.length === 0) {
    return null;
  }

  return (
    <div className="px-4 pt-0 pb-2">
      <Card className="border border-primary/10 bg-primary/[0.02]">
        <CardHeader className="py-2 px-3">
          <CardTitle className="text-[11px] flex items-center gap-1.5 uppercase tracking-wider opacity-70">
            <span className="text-primary">⚡</span>
            Common Development Ports
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1.5 px-3 pb-3">
          {commonPorts.map((port) => (
            <div
              key={port.port}
              className="flex items-center justify-between p-2 rounded-md border bg-card/50 hover:bg-accent/30 transition-colors gap-2 overflow-hidden"
            >
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <div className="flex items-center gap-1.5 shrink-0">
                  {port.isRunning ? (
                    <CheckCircle2 className="w-3 h-3 text-green-500" />
                  ) : (
                    <div className="w-3 h-3 rounded-full border border-muted-foreground/30" />
                  )}
                  <button 
                    onClick={() => openUrl(port.port)}
                    className="font-mono font-bold text-primary text-[11px] hover:underline flex items-center gap-1 group/port"
                  >
                    :{port.port}
                    <ExternalLink className="w-2.5 h-2.5 opacity-0 group-hover/port:opacity-100 transition-opacity" />
                  </button>
                </div>
                
                <div className="flex flex-col min-w-0 flex-1 hidden xsm:flex">
                  <div className="font-bold text-[10px] truncate leading-tight">{port.name}</div>
                  <div className="text-[9px] text-muted-foreground truncate leading-tight opacity-70">
                    {port.description}
                  </div>
                </div>

                <div className="shrink-0 ml-auto mr-0.5">
                  {port.isRunning ? (
                    <Badge variant="success" className="text-[8px] px-1 h-3.5 uppercase tracking-tighter">Live</Badge>
                  ) : (
                    <Badge variant="outline" className="text-[8px] px-1 h-3.5 uppercase tracking-tighter">Idle</Badge>
                  )}
                </div>
              </div>

              {!port.isRunning && (
                <Button
                  onClick={() => onStartPort(port.port)}
                  variant="default"
                  size="sm"
                  className="shrink-0 h-6 text-[9px] px-2 gap-1 shadow-sm font-black uppercase"
                >
                  <Play className="w-2 h-2 fill-current" />
                  Cook
                </Button>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};
