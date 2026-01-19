import * as vscode from 'vscode';
import { OrbitalWebviewProvider } from './webview-provider';

export function activate(context: vscode.ExtensionContext) {
  console.log('Orbital extension is now active');

  // Register the webview provider for Mission Control
  const missionControlProvider = new OrbitalWebviewProvider(context.extensionUri);
  
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      'serverCook.missionControl',
      missionControlProvider
    )
  );

  // Register the same provider for Explorer view (it will adapt via CSS/logic)
  const explorerProvider = new OrbitalWebviewProvider(context.extensionUri);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      'serverCook.explorerView',
      explorerProvider
    )
  );

  // Register the command to open mission control
  context.subscriptions.push(
    vscode.commands.registerCommand('serverCook.openMissionControl', () => {
      vscode.commands.executeCommand('serverCook.missionControl.focus');
    })
  );
}

export function deactivate() {}
