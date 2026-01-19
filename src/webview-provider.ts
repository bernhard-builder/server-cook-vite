import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { PortScanner } from './scanner';
import { WorkspaceDetector } from './workspace-detector';
import { ProcessInfo, WorkspaceInfo, MessageFromWebview } from './types';

export class OrbitalWebviewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'serverCook.missionControl';
  private _view?: vscode.WebviewView;
  private scanner: PortScanner;
  private workspaceDetector: WorkspaceDetector;

  constructor(private readonly _extensionUri: vscode.Uri) {
    this.scanner = new PortScanner();
    this.workspaceDetector = new WorkspaceDetector();
  }

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ) {
    this._view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._extensionUri]
    };

    const isExplorer = webviewView.viewType === 'serverCook.explorerView';
    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview, isExplorer);

    // Handle messages from the webview
    webviewView.webview.onDidReceiveMessage(async (message: MessageFromWebview) => {
      await this._handleMessage(message);
    });

    // Initial data load
    this._refreshData();
  }

  private async _handleMessage(message: MessageFromWebview) {
    switch (message.command) {
      case 'refresh':
        await this._refreshData();
        break;
      
      case 'detect':
        await this._detectAll();
        break;
      
      case 'killProcess':
        if (message.data && message.data.pid) {
          const success = await this.scanner.killProcess(message.data.pid);
          if (success) {
            // vscode.window.showInformationMessage(`Process ${message.data.pid} killed successfully`);
            await this._refreshData();
          } else {
            vscode.window.showErrorMessage(`Failed to kill process ${message.data.pid}`);
          }
        }
        break;
      
      case 'killZombies':
        await this._killZombies();
        break;
      
      case 'stopAll':
        await this._stopAll();
        break;
      
      case 'clearCache':
        await this._clearCache();
        break;
      
      case 'getVersion':
        this._sendVersion();
        break;
      
      case 'startPort':
        if (message.data && message.data.port) {
          await this._startPort(message.data.port);
        }
        break;

      case 'openDirectory':
        if (message.data && message.data.path) {
          this._openDirectory(message.data.path);
        }
        break;

      case 'openUrl':
        if (message.data && message.data.url) {
          vscode.env.openExternal(vscode.Uri.parse(message.data.url));
        }
        break;
    }
  }

  private _openDirectory(filePath: string) {
    const uri = vscode.Uri.file(filePath);
    vscode.commands.executeCommand('revealFileInOS', uri);
  }

  private async _refreshData() {
    const processes = await this.scanner.scanPorts();
    await this.scanner.detectConflicts(processes);
    
    const workspacePath = this._getWorkspacePath();
    let workspaceInfo: WorkspaceInfo | undefined;
    
    if (workspacePath) {
      workspaceInfo = await this.workspaceDetector.detectWorkspace(workspacePath);
    }

    this._view?.webview.postMessage({
      command: 'updateProcesses',
      data: { processes, workspaceInfo }
    });
  }

  private async _detectAll() {
    const processes = await this.scanner.scanPorts();
    await this.scanner.detectConflicts(processes);
    const zombies = await this.scanner.detectZombies(processes);
    
    const workspacePath = this._getWorkspacePath();
    let workspaceInfo: WorkspaceInfo | undefined;
    
    if (workspacePath) {
      workspaceInfo = await this.workspaceDetector.detectWorkspace(workspacePath);
    }

    this._view?.webview.postMessage({
      command: 'updateProcesses',
      data: { processes, workspaceInfo }
    });

    if (zombies.length > 0) {
      vscode.window.showInformationMessage(`Found ${zombies.length} zombie process(es)`);
    }
  }

  private async _killZombies() {
    const processes = await this.scanner.scanPorts();
    const zombies = await this.scanner.detectZombies(processes);
    
    let killed = 0;
    for (const zombie of zombies) {
      const success = await this.scanner.killProcess(zombie.pid);
      if (success) killed++;
    }
    
    vscode.window.showInformationMessage(`Killed ${killed} zombie process(es)`);
    await this._refreshData();
  }

  private async _stopAll() {
    const processes = await this.scanner.scanPorts();
    
    const confirm = await vscode.window.showWarningMessage(
      `Stop all ${processes.length} processes?`,
      { modal: true },
      'Yes',
      'No'
    );
    
    if (confirm === 'Yes') {
      let killed = 0;
      for (const proc of processes) {
        const success = await this.scanner.killProcess(proc.pid);
        if (success) killed++;
      }
      
      vscode.window.showInformationMessage(`Stopped ${killed} process(es)`);
      await this._refreshData();
    }
  }

  private async _clearCache() {
    const workspacePath = this._getWorkspacePath();
    if (!workspacePath) {
      vscode.window.showErrorMessage('No workspace folder open');
      return;
    }

    const confirm = await vscode.window.showWarningMessage(
      'Clear all cache directories (.turbo, .next, node_modules/.cache, etc.)?',
      { modal: true },
      'Yes',
      'No'
    );
    
    if (confirm === 'Yes') {
      const success = await this.scanner.clearCache(workspacePath);
      if (success) {
        vscode.window.showInformationMessage('Cache cleared successfully');
      } else {
        vscode.window.showErrorMessage('Failed to clear cache');
      }
    }
  }

  private _sendVersion() {
    const packageJsonPath = path.join(this._extensionUri.fsPath, 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
    
    this._view?.webview.postMessage({
      command: 'updateVersion',
      data: { version: packageJson.version }
    });
  }

  private async _startPort(port: number) {
    const workspacePath = this._getWorkspacePath();
    if (!workspacePath) {
      vscode.window.showErrorMessage('No workspace folder open');
      return;
    }

    // Check if package.json exists
    const packageJsonPath = path.join(workspacePath, 'package.json');
    if (!fs.existsSync(packageJsonPath)) {
      vscode.window.showErrorMessage('No package.json found in workspace');
      return;
    }

    // Read package.json to find dev script
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
    const scripts = packageJson.scripts || {};
    
    // Determine which script to run
    let scriptName = 'dev';
    if (!scripts.dev && scripts.start) {
      scriptName = 'start';
    }

    if (!scripts[scriptName]) {
      vscode.window.showErrorMessage(`No "${scriptName}" script found in package.json`);
      return;
    }

    // Detect package manager
    let packageManager = 'npm';
    if (fs.existsSync(path.join(workspacePath, 'pnpm-lock.yaml'))) {
      packageManager = 'pnpm';
    } else if (fs.existsSync(path.join(workspacePath, 'yarn.lock'))) {
      packageManager = 'yarn';
    }

    // Create terminal and run command
    const terminal = vscode.window.createTerminal({
      name: `Server Cook :${port}`,
      cwd: workspacePath
    });
    
    terminal.show();
    
    // Set PORT environment variable and run
    if (this.isWindows) {
      terminal.sendText(`$env:PORT=${port}; ${packageManager} run ${scriptName}`);
    } else {
      terminal.sendText(`PORT=${port} ${packageManager} run ${scriptName}`);
    }

    // vscode.window.showInformationMessage(`Starting development server on port ${port}...`);
    
    // Refresh after a delay to show the new process
    setTimeout(() => {
      this._refreshData();
    }, 3000);
  }

  private get isWindows(): boolean {
    return process.platform === 'win32';
  }

  private _getWorkspacePath(): string | undefined {
    return vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
  }

  private _getHtmlForWebview(webview: vscode.Webview, isExplorer: boolean) {
    const webviewPath = path.join(this._extensionUri.fsPath, 'webview', 'dist');
    
    // In development, point to the dev server
    if (process.env.VITE_DEV_SERVER) {
      return `<!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Server Cook Mission Control</title>
            <script>
              window.SERVER_COOK_CONTEXT = "${isExplorer ? 'explorer' : 'sidebar'}";
            </script>
          </head>
          <body>
            <div id="root"></div>
            <script type="module" src="http://localhost:5173/@vite/client"></script>
            <script type="module" src="http://localhost:5173/src/main.tsx"></script>
          </body>
        </html>`;
    }

    // Production: Load built files
    const scriptUri = webview.asWebviewUri(vscode.Uri.file(path.join(webviewPath, 'index.js')));
    const styleUri = webview.asWebviewUri(vscode.Uri.file(path.join(webviewPath, 'index.css')));

    return `<!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource} 'unsafe-inline'; script-src ${webview.cspSource} 'unsafe-inline';">
          <link href="${styleUri}" rel="stylesheet">
          <title>Server Cook Mission Control</title>
          <script>
            window.SERVER_COOK_CONTEXT = "${isExplorer ? 'explorer' : 'sidebar'}";
          </script>
        </head>
        <body>
          <div id="root"></div>
          <script src="${scriptUri}"></script>
        </body>
      </html>`;
  }
}
