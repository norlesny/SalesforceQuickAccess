// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { CodelensProvider } from './CodelensProvider';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "salesforcequickaccess" is now active!');

	
	const codelensProvider = new CodelensProvider();
	vscode.languages.registerCodeLensProvider("*", codelensProvider);

	vscode.commands.registerCommand("codelens-sample.enableCodeLens", () => {
		vscode.workspace.getConfiguration("codelens-sample").update("enableCodeLens", true, true);
	});

	vscode.commands.registerCommand("codelens-sample.disableCodeLens", () => {
		vscode.workspace.getConfiguration("codelens-sample").update("enableCodeLens", false, true);
	});

	vscode.commands.registerCommand("codelens-sample.codelensAction", (args: any) => {
		const editor = vscode.window.activeTextEditor;
        if (editor) {
            let document = editor.document;
            const documentText = document.getText();
			const line = document.lineAt(args);
			runCommandInTerminal(`sfdx force:data:soql:query --query "${line.text}"`);
        }
	});

	vscode.commands.registerCommand("codelens-sample.codelensSfCommand", (args: any) => {
		const editor = vscode.window.activeTextEditor;
        if (editor) {
            let document = editor.document;
            const documentText = document.getText();
			const line = document.lineAt(args);
			runCommandInTerminal(line.text);
        }
	});

	vscode.commands.registerCommand("codelens-sample.codelensRunTest", (args: any) => {
		// vscode.window.showInformationMessage(`CodeLens action clicked with args=${args}`);
		const editor = vscode.window.activeTextEditor;
        if (editor) {
			console.log('LESNY args: '+args);
			runCommandInTerminal(`sf apex run test --synchronous --class-names ${args}`);
        }
	});

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('salesforcequickaccess.helloWorld', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World first extension');
	});

	context.subscriptions.push(disposable);
}

function runCommandInTerminal(command: string) {
	let t = vscode.window.activeTerminal ?? vscode.window.createTerminal();
	t.show(false);
	t.sendText(command);
}

// This method is called when your extension is deactivated
export function deactivate() {}


/* 
Query:
sfdx force:data:soql:query --query select Id, ContentDocument.Title, ContentDocument.LatestPublishedVersion.VersionData from ContentDocumentLink where LinkedEntityId = '5006u000006pOygAAE'
sfdx force:data:soql:query --query "SELECT Id FROM Case"
*/