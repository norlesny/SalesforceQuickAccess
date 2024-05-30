import * as vscode from 'vscode';

/**
 * CodelensProvider
 */
export class CodelensProvider implements vscode.CodeLensProvider {

	private codeLenses: vscode.CodeLens[] = [];
	private _onDidChangeCodeLenses: vscode.EventEmitter<void> = new vscode.EventEmitter<void>();
	public readonly onDidChangeCodeLenses: vscode.Event<void> = this._onDidChangeCodeLenses.event;

	constructor() {
		vscode.workspace.onDidChangeConfiguration((_) => {
			this._onDidChangeCodeLenses.fire();
		});
	}

	public provideCodeLenses(document: vscode.TextDocument, token: vscode.CancellationToken): vscode.CodeLens[] | Thenable<vscode.CodeLens[]> {
		this.codeLenses = [];

		this.createQueryCodeLenses(document);
		this.createSfCommandCodeLenses(document);
		// this.createTestCodeLensees(document);
		
		return this.codeLenses;
	}

	private createQueryCodeLenses(document: vscode.TextDocument) {
		this.createCodeLenses(document, /^(SELECT[\s\S]*?(?=FROM).*)$/gmi, 'Query', 'salesforce-quickaccess.codelensAction');
	}

	private createSfCommandCodeLenses(document: vscode.TextDocument) {
		this.createCodeLenses(document, /^((sf|sfdx) .*)$/gm, 'Execute', 'salesforce-quickaccess.codelensSfCommand');
	}

	private createTestCodeLensees(document: vscode.TextDocument) {
		const text = document.getText();
		if (text.startsWith('@IsTest')) {
			const lineText = document.lineAt(1).text;
			const className = this.getClassName(lineText);
			let lensCommand = {
				title: 'RunTest',
				command: 'salesforce-quickaccess.codelensRunTest',
				arguments: [className]
			};
			this.addCodeLens(new vscode.Range(1, 0, 1, 0), lensCommand);
		}
	}

	private getClassName(lineText:string) {
		const regex = /class\s+(\w+)\s*\{/;
		const match = lineText.match(regex);
		return (match && match[1]) ? match[1] : null;
	}

	private createCodeLenses(document: vscode.TextDocument, regex: RegExp, commandTitle: string, command: string) {
		const exp = new RegExp(regex);
		const text = document.getText();
		let matches;
		while ((matches = exp.exec(text)) !== null) {
			const position = new vscode.Position(1, 0);
			const line = document.positionAt(matches.index).line;
			const range = new vscode.Range(line, 0, line, 0);
			if (range) {
				let lensCommand = {
					title: commandTitle,
					command: command,
					arguments: [this.removeLineBreaks(matches[0])]
				};
				this.addCodeLens(range, lensCommand);
			}
		}
	}

	private removeLineBreaks(input: string): string {
		return input.replace(/[\r\n]+/g, ' ');
	}

	private addCodeLens(range: vscode.Range, command: vscode.Command) {
		let codeLens = new vscode.CodeLens(range, command);
		this.codeLenses.push(codeLens);
	}
}
