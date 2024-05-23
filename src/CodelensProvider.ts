import * as vscode from 'vscode';

/**
 * CodelensProvider
 */
export class CodelensProvider implements vscode.CodeLensProvider {

	private codeLenses: vscode.CodeLens[] = [];
	private _onDidChangeCodeLenses: vscode.EventEmitter<void> = new vscode.EventEmitter<void>();
	public readonly onDidChangeCodeLenses: vscode.Event<void> = this._onDidChangeCodeLenses.event;

	constructor() {
		// this.regex = /^(SELECT.*FROM.*)$/gm;
		// this.regex = /^(SELECT.*?)\\n\\n/gsm;
		// this.regex = /^(SELECT.+FROM.+)(\n^$|$(?!\n))/gmsU;
		// this.regex = /(.+)/g;

		vscode.workspace.onDidChangeConfiguration((_) => {
			this._onDidChangeCodeLenses.fire();
		});
	}

	public provideCodeLenses(document: vscode.TextDocument, token: vscode.CancellationToken): vscode.CodeLens[] | Thenable<vscode.CodeLens[]> {
		this.codeLenses = [];
		if (vscode.workspace.getConfiguration("codelens-sample").get("enableCodeLens", true)) {
			this.createQueryCodeLenses(document);
			this.createSfCommandCodeLenses(document);
			this.createTestCodeLensees(document);
		}
		return this.codeLenses;
	}

	private createQueryCodeLenses(document: vscode.TextDocument) {
		this.createCodeLenses(document, /^(SELECT.*FROM.*)$/gm, 'Query', 'codelens-sample.codelensAction');
	}

	private createSfCommandCodeLenses(document: vscode.TextDocument) {
		this.createCodeLenses(document, /^((sf|sfdx) .*)$/gm, 'Execute', 'codelens-sample.codelensSfCommand');
	}

	private createTestCodeLensees(document: vscode.TextDocument) {
		const text = document.getText();
		if (text.startsWith('@IsTest')) {
			const lineText = document.lineAt(1).text;
			const className = this.getClassName(lineText);
			let lensCommand = {
				title: 'RunTest',
				command: 'codelens-sample.codelensRunTest',
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
			const line = document.lineAt(document.positionAt(matches.index).line);
			const indexOf = line.text.indexOf(matches[0]);
			const position = new vscode.Position(line.lineNumber, indexOf);
			const range = document.getWordRangeAtPosition(position, new RegExp(regex));
			if (range) {
				let lensCommand = {
					title: commandTitle,
					command: command,
					arguments: [range.start.line]
				};
				this.addCodeLens(range, lensCommand);
			}
		}
	}

	private addCodeLens(range: vscode.Range, command: vscode.Command) {
		let codeLens = new vscode.CodeLens(range, command);
		this.codeLenses.push(codeLens);
	}
}
