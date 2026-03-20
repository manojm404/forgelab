import fs from 'fs';
import path from 'path';

export interface Manifest {
  teamId: string;
  status: 'planning' | 'implementing' | 'reviewing' | 'completed';
  tasks: {
    id: string;
    agentId: string;
    status: 'pending' | 'in-progress' | 'waiting-for-approval' | 'completed';
    description: string;
  }[];
}

export class ManifestManager {
  private workspacePath: string;

  constructor(workspacePath: string) {
    this.workspacePath = workspacePath;
  }

  getManifestPath(teamId: string): string {
    return path.join(this.workspacePath, 'teams', teamId, 'manifest.json');
  }

  load(teamId: string): Manifest {
    const p = this.getManifestPath(teamId);
    if (!fs.existsSync(p)) return { teamId, status: 'planning', tasks: [] };
    return JSON.parse(fs.readFileSync(p, 'utf8'));
  }

  save(teamId: string, manifest: Manifest) {
    const p = this.getManifestPath(teamId);
    fs.mkdirSync(path.dirname(p), { recursive: true });
    fs.writeFileSync(p, JSON.stringify(manifest, null, 2));
  }
}
