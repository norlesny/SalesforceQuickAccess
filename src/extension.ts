import * as vscode from 'vscode';
import { CodelensProvider } from './CodelensProvider';

export function activate(context: vscode.ExtensionContext) {

	vscode.workspace.getConfiguration("salesforce-quickaccess").update("enableCodeLens", true, true);
	console.log('Congratulations, your extension "salesforcequickaccess" is now active!');

	
	const codelensProvider = new CodelensProvider();
	vscode.languages.registerCodeLensProvider("*", codelensProvider);

	vscode.commands.registerCommand("salesforce-quickaccess.enableCodeLens", () => {
		vscode.workspace.getConfiguration("salesforce-quickaccess").update("enableCodeLens", true, true);
	});

	vscode.commands.registerCommand("salesforce-quickaccess.disableCodeLens", () => {
		vscode.workspace.getConfiguration("salesforce-quickaccess").update("enableCodeLens", false, true);
	});

	vscode.commands.registerCommand("salesforce-quickaccess.codelensAction", (args: any) => {
		const editor = vscode.window.activeTextEditor;
        if (editor) {
			runCommandInTerminal(`sfdx force:data:soql:query --query "${args}"`);
        }
	});

	vscode.commands.registerCommand("salesforce-quickaccess.codelensSfCommand", (args: any) => {
		const editor = vscode.window.activeTextEditor;
        if (editor) {
			runCommandInTerminal(args);
        }
	});

	vscode.commands.registerCommand("salesforce-quickaccess.codelensRunTest", (args: any) => {
		const editor = vscode.window.activeTextEditor;
        if (editor) {
			runCommandInTerminal(`sf apex run test --synchronous --class-names ${args}`);
        }
	});
}

function runCommandInTerminal(command: string) {
	let t = vscode.window.activeTerminal ?? vscode.window.createTerminal();
	t.show(false);
	t.sendText(command);
}

export function deactivate() {}
