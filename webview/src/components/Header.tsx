import React from 'react';
import { RefreshCw, Radar, Skull, Trash2, StopCircle, Sun, Moon, Globe } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';
import { WorkspaceInfo } from '../types';

interface HeaderProps {
  version: string;
  workspaceInfo?: WorkspaceInfo;
  theme: 'light' | 'dark';
  onThemeToggle: () => void;
  onRefresh: () => void;
  onDetect: () => void;
  onKillZombies: () => void;
  onClearCache: () => void;
  onStopAll: () => void;
  zombieCount: number;
  totalProcesses: number;
}

export const Header: React.FC<HeaderProps> = ({
  version,
  workspaceInfo,
  theme,
  onThemeToggle,
  onRefresh,
  onDetect,
  onKillZombies,
  onClearCache,
  onStopAll,
  zombieCount,
  totalProcesses,
}) => {
  return (
    <div className="sticky top-0 z-50 backdrop-blur-md bg-background/80 border-b shadow-sm">
      <div className="p-3 space-y-3">
        {/* Top Row: Title, Workspace Badge, Website, Theme, and Version */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg">
                <span className="text-white text-xs font-bold">🍳</span>
              </div>
              <h1 className="text-lg font-bold tracking-tight">Server Cook</h1>
            </div>
            {workspaceInfo && workspaceInfo.type !== 'standard' && (
              <Badge
                variant={workspaceInfo.type === 'turborepo' ? 'default' : 'secondary'}
                className="font-mono text-[9px] h-5 px-1.5"
              >
                {workspaceInfo.type === 'turborepo' && '🚀 '}
                {workspaceInfo.type.toUpperCase()}
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            <a 
              href="https://bernhardrieder.com" 
              target="_blank" 
              className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-primary transition-colors font-medium"
            >
              <Globe className="w-3 h-3" />
              bernhardrieder.com
            </a>

            <div className="flex items-center gap-1.5 px-2 py-1 bg-muted/50 rounded-full border border-border/50">
              {theme === 'light' ? <Sun className="w-3 h-3 text-orange-500" /> : <Moon className="w-3 h-3 text-gray-400" />}
              <Switch
                checked={theme === 'dark'}
                onCheckedChange={onThemeToggle}
                className="scale-75"
              />
            </div>

            <Badge variant="outline" className="font-mono text-[10px] h-5">
              v{version}
            </Badge>
          </div>
        </div>

        {/* Stats and Action Buttons Row */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-[11px]">
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse-glow" />
              <span className="text-muted-foreground font-medium uppercase tracking-tight">
                {totalProcesses} Active
              </span>
            </div>
            {zombieCount > 0 && (
              <div className="flex items-center gap-1.5 bg-destructive/10 px-2 py-0.5 rounded-full border border-destructive/20">
                <Skull className="w-3 h-3 text-destructive" />
                <span className="text-destructive font-bold uppercase tracking-tight">
                  {zombieCount} Zombies
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <Button onClick={onRefresh} size="sm" variant="outline" className="h-7 px-2.5 text-[10px] font-bold uppercase tracking-tighter gap-1">
              <RefreshCw className="w-3 h-3" />
              Refresh
            </Button>
            <Button onClick={onDetect} size="sm" variant="default" className="h-7 px-2.5 text-[10px] font-bold uppercase tracking-tighter gap-1 shadow-sm">
              <Radar className="w-3 h-3" />
              Detect
            </Button>
            {zombieCount > 0 && (
              <Button onClick={onKillZombies} size="sm" variant="destructive" className="h-7 px-2.5 text-[10px] font-bold uppercase tracking-tighter gap-1 shadow-sm">
                <Skull className="w-3 h-3" />
                Kill Zombies
              </Button>
            )}
            <Button onClick={onClearCache} size="sm" variant="outline" className="h-7 px-2.5 text-[10px] font-bold uppercase tracking-tighter gap-1">
              <Trash2 className="w-3 h-3" />
              Nuke Cache
            </Button>
            <Button onClick={onStopAll} size="sm" variant="destructive" className="h-7 px-2.5 text-[10px] font-bold uppercase tracking-tighter gap-1 shadow-sm">
              <StopCircle className="w-3 h-3" />
              Stop All
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
