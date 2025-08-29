import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import YamlDoctorCore from '@darioajr/yaml-doctor';

interface YamlDoctorReport {
	score: number;
	files: Array<{
		file: string;
		issues: Array<{
			line: number;
			column: number;
			severity: string;
			message: string;
			rule: string;
		}>;
	}>;
}

class YamlDoctorProvider {
	private diagnosticCollection: vscode.DiagnosticCollection;
	private outputChannel: vscode.OutputChannel;

	constructor() {
		this.diagnosticCollection = vscode.languages.createDiagnosticCollection('yaml-doctor');
		this.outputChannel = vscode.window.createOutputChannel('YAML Doctor');
	}

	async analyzeTarget(uri: vscode.Uri): Promise<void> {
		try {
			const stats = fs.statSync(uri.fsPath);
			
			if (stats.isDirectory()) {
				await this.analyzeDirectory(uri);
			} else if (stats.isFile()) {
				await this.analyzeFile(uri);
			} else {
				vscode.window.showErrorMessage('Selected item is neither a file nor a directory');
			}
		} catch (error) {
			this.outputChannel.appendLine(`Error: ${error}`);
			vscode.window.showErrorMessage(`YAML Doctor analysis failed: ${error}`);
		}
	}

	async analyzeFile(uri: vscode.Uri): Promise<void> {
		try {
			this.outputChannel.appendLine(`Analyzing file: ${uri.fsPath}`);
			
			const workspaceFolder = vscode.workspace.getWorkspaceFolder(uri);
			if (!workspaceFolder) {
				vscode.window.showErrorMessage('File must be in a workspace to analyze');
				return;
			}

			const workspacePath = workspaceFolder.uri.fsPath;
			const relativePath = path.relative(workspacePath, uri.fsPath);
			this.outputChannel.appendLine(`Analyzing file with @darioajr/yaml-doctor: ${uri.fsPath}`);
			const doctor = new YamlDoctorCore();
			const { result } = await doctor.scanAndReport(workspacePath, { 
				generateJson: false, 
				generateHtml: false, 
				generateBadge: false
			});
			this.updateDiagnostics(uri, {
				score: result.score,
				files: [
					{
						file: relativePath,
						issues: result.files.find(f => path.relative(workspacePath, f.path) === relativePath)?.issues.map(issue => ({
							line: issue.line ?? 0,
							column: 0,
							severity: issue.severity,
							message: issue.message,
							rule: issue.code ?? ''
						})) ?? []
					}
				]
			}, relativePath);
			vscode.window.showInformationMessage(
				`YAML Doctor analysis complete. Score: ${result.score}/100`
			);
			
		} catch (error) {
			this.outputChannel.appendLine(`Error: ${error}`);
			vscode.window.showErrorMessage(`YAML Doctor analysis failed: ${error}`);
		}
	}

	async analyzeDirectory(uri: vscode.Uri): Promise<void> {
		try {
			this.outputChannel.appendLine(`Analyzing directory: ${uri.fsPath}`);
			
			await vscode.window.withProgress({
				location: vscode.ProgressLocation.Notification,
				title: "Analyzing YAML files in directory...",
				cancellable: false
			}, async (progress) => {
				const doctor = new YamlDoctorCore();
				const { result } = await doctor.scanAndReport(uri.fsPath, { 
					generateJson: false, 
					generateHtml: false, 
					generateBadge: false
				});
				
				for (const fileResult of result.files) {
					const relativeFilePath = path.relative(uri.fsPath, fileResult.path);
					const fileUri = vscode.Uri.file(path.join(uri.fsPath, relativeFilePath));
					this.updateDiagnostics(fileUri, {
						score: result.score,
						files: [
							{
								file: relativeFilePath,
								issues: fileResult.issues.map(issue => ({
									line: issue.line ?? 0,
									column: 0,
									severity: issue.severity,
									message: issue.message,
									rule: issue.code ?? ''
								}))
							}
						]
					}, relativeFilePath);
				}
				
				vscode.window.showInformationMessage(
					`YAML Doctor directory analysis complete. Overall score: ${result.score}/100`
				);
			});
			
		} catch (error) {
			this.outputChannel.appendLine(`Error: ${error}`);
			vscode.window.showErrorMessage(`YAML Doctor directory analysis failed: ${error}`);
		}
	}

	async analyzeWorkspace(): Promise<void> {
		const workspaceFolders = vscode.workspace.workspaceFolders;
		if (!workspaceFolders) {
			vscode.window.showErrorMessage('No workspace folder found');
			return;
		}

		try {
			const workspacePath = workspaceFolders[0].uri.fsPath;
			this.outputChannel.appendLine(`Analyzing workspace with @darioajr/yaml-doctor: ${workspacePath}`);
			await vscode.window.withProgress({
				location: vscode.ProgressLocation.Notification,
				title: "Analyzing YAML files with YAML Doctor...",
				cancellable: false
			}, async (progress) => {
				const doctor = new YamlDoctorCore();
				const { result } = await doctor.scanAndReport(workspacePath, { generateJson: false, generateHtml: false, generateBadge: false });
				for (const fileResult of result.files) {
					const relativeFilePath = path.relative(workspacePath, fileResult.path);
					const fileUri = vscode.Uri.file(path.join(workspacePath, relativeFilePath));
					this.updateDiagnostics(fileUri, {
						score: result.score,
						files: [
							{
								file: relativeFilePath,
								issues: fileResult.issues.map(issue => ({
									line: issue.line ?? 0,
									column: 0,
									severity: issue.severity,
									message: issue.message,
									rule: issue.code ?? ''
								}))
							}
						]
					}, relativeFilePath);
				}
				vscode.window.showInformationMessage(
					`YAML Doctor workspace analysis complete. Overall score: ${result.score}/100`
				);
			});
			
		} catch (error) {
			this.outputChannel.appendLine(`Error: ${error}`);
			vscode.window.showErrorMessage(`YAML Doctor workspace analysis failed: ${error}`);
		}
	}

	private updateDiagnostics(uri: vscode.Uri, report: YamlDoctorReport, filePath: string): void {
		const fileReport = report.files.find(f => f.file === filePath);
		if (!fileReport) {
			this.diagnosticCollection.set(uri, []);
			return;
		}

		const diagnostics: vscode.Diagnostic[] = fileReport.issues.map(issue => {
			const range = new vscode.Range(
				Math.max(0, issue.line - 1),
				Math.max(0, issue.column - 1),
				Math.max(0, issue.line - 1),
				Math.max(0, issue.column + 10)
			);

			const severity = this.getSeverity(issue.severity);
			const diagnostic = new vscode.Diagnostic(range, issue.message, severity);
			diagnostic.source = 'yaml-doctor';
			diagnostic.code = issue.rule;

			return diagnostic;
		});

		this.diagnosticCollection.set(uri, diagnostics);
	}

	private getSeverity(severity: string): vscode.DiagnosticSeverity {
		switch (severity.toLowerCase()) {
			case 'error':
				return vscode.DiagnosticSeverity.Error;
			case 'warning':
				return vscode.DiagnosticSeverity.Warning;
			case 'info':
				return vscode.DiagnosticSeverity.Information;
			default:
				return vscode.DiagnosticSeverity.Hint;
		}
	}

	async showReport(): Promise<void> {
		const workspaceFolders = vscode.workspace.workspaceFolders;
		if (!workspaceFolders) {
			vscode.window.showErrorMessage('No workspace folder found');
			return;
		}

		const reportPath = path.join(workspaceFolders[0].uri.fsPath, 'yaml-doctor-report.html');
		if (fs.existsSync(reportPath)) {
			const panel = vscode.window.createWebviewPanel(
				'yamlDoctorReport',
				'YAML Doctor Report',
				vscode.ViewColumn.One,
				{
					enableScripts: true,
					localResourceRoots: [workspaceFolders[0].uri]
				}
			);

			const htmlContent = fs.readFileSync(reportPath, 'utf8');
			panel.webview.html = htmlContent;
		} else {
			vscode.window.showErrorMessage('No YAML Doctor report found. Run analysis first.');
		}
	}

	async generateBadge(): Promise<void> {
		const workspaceFolders = vscode.workspace.workspaceFolders;
		if (!workspaceFolders) {
			vscode.window.showErrorMessage('No workspace folder found');
			return;
		}

		const badgePath = path.join(workspaceFolders[0].uri.fsPath, 'yaml-doctor-badge.svg');
		if (fs.existsSync(badgePath)) {
			vscode.window.showInformationMessage(`YAML Doctor badge generated: ${badgePath}`);
			// Open the badge file
			const uri = vscode.Uri.file(badgePath);
			vscode.commands.executeCommand('vscode.open', uri);
		} else {
			vscode.window.showErrorMessage('No YAML Doctor badge found. Run analysis first.');
		}
	}

	dispose(): void {
		this.diagnosticCollection.dispose();
		this.outputChannel.dispose();
	}
}

export function activate(context: vscode.ExtensionContext) {
	console.log('YAML Doctor extension is now active!');

	const provider = new YamlDoctorProvider();

	// Register commands
	const analyzeFileCommand = vscode.commands.registerCommand('yaml-doctor.analyzeFile', async (uri?: vscode.Uri) => {
		if (!uri && vscode.window.activeTextEditor) {
			uri = vscode.window.activeTextEditor.document.uri;
		}
		if (uri) {
			await provider.analyzeTarget(uri);
		} else {
			vscode.window.showErrorMessage('No YAML file or directory selected');
		}
	});

	const analyzeWorkspaceCommand = vscode.commands.registerCommand('yaml-doctor.analyzeWorkspace', async () => {
		await provider.analyzeWorkspace();
	});

	const showReportCommand = vscode.commands.registerCommand('yaml-doctor.showReport', async () => {
		await provider.showReport();
	});

	const generateBadgeCommand = vscode.commands.registerCommand('yaml-doctor.generateBadge', async () => {
		await provider.generateBadge();
	});

	// Auto-analyze on save if enabled
	const onSaveListener = vscode.workspace.onDidSaveTextDocument(async (document) => {
		const config = vscode.workspace.getConfiguration('yamlDoctor');
		const autoAnalyze = config.get<boolean>('autoAnalyze', false);
		
		if (autoAnalyze && (document.languageId === 'yaml' || document.fileName.endsWith('.yml') || document.fileName.endsWith('.yaml'))) {
			await provider.analyzeFile(document.uri);
		}
	});

	context.subscriptions.push(
		analyzeFileCommand,
		analyzeWorkspaceCommand,
		showReportCommand,
		generateBadgeCommand,
		onSaveListener,
		provider
	);
}

export function deactivate() {}
