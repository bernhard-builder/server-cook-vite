import React from 'react';
import { ProcessInfo } from '../types';
import { ProcessCard } from './ProcessCard';
import { PackageX } from 'lucide-react';

interface CardGridProps {
  processes: ProcessInfo[];
  onKillProcess: (pid: number) => void;
}

export const CardGrid: React.FC<CardGridProps> = ({ processes, onKillProcess }) => {
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
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4">
      {processes.map((process) => (
        <ProcessCard
          key={process.pid}
          process={process}
          onKill={onKillProcess}
        />
      ))}
    </div>
  );
};
