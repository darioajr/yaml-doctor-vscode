import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

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

	async analyzeFile(uri: vscode.Uri): Promise<void> {
		try {
			this.outputChannel.appendLine(`Analyzing file: ${uri.fsPath}`);
			
			const workspaceFolder = vscode.workspace.getWorkspaceFolder(uri);
			if (!workspaceFolder) {
				vscode.window.showErrorMessage('File must be in a workspace to analyze');
				return;
			}

			const config = vscode.workspace.getConfiguration('yamlDoctor');
			const dockerImage = config.get<string>('dockerImage', 'darioajr/yaml-doctor:latest');
			
			const workspacePath = workspaceFolder.uri.fsPath;
			const relativePath = path.relative(workspacePath, uri.fsPath);
			
			// Run yaml-doctor in Docker
			const command = `docker run --rm -v "${workspacePath}":/work ${dockerImage} --path /work --no-serve --output-json`;
			
			this.outputChannel.appendLine(`Running command: ${command}`);
			
			const { stdout } = await execAsync(command);
			
			// Parse the JSON report
			const reportPath = path.join(workspacePath, 'yaml-doctor-report.json');
			if (fs.existsSync(reportPath)) {
				const reportContent = fs.readFileSync(reportPath, 'utf8');
				const report: YamlDoctorReport = JSON.parse(reportContent);
				
				this.updateDiagnostics(uri, report, relativePath);
				
				vscode.window.showInformationMessage(
					`YAML Doctor analysis complete. Score: ${report.score}/100`
				);
			}
			
		} catch (error) {
			this.outputChannel.appendLine(`Error: ${error}`);
			vscode.window.showErrorMessage(`YAML Doctor analysis failed: ${error}`);
		}
	}

	async analyzeWorkspace(): Promise<void> {
		const workspaceFolders = vscode.workspace.workspaceFolders;
		if (!workspaceFolders) {
			vscode.window.showErrorMessage('No workspace folder found');
			return;
		}

		try {
			const config = vscode.workspace.getConfiguration('yamlDoctor');
			const dockerImage = config.get<string>('dockerImage', 'darioajr/yaml-doctor:latest');
			
			const workspacePath = workspaceFolders[0].uri.fsPath;
			
			// Run yaml-doctor in Docker for entire workspace
			const command = `docker run --rm -v "${workspacePath}":/work ${dockerImage} --path /work --no-serve --output-json`;
			
			this.outputChannel.appendLine(`Running workspace analysis: ${command}`);
			
			await vscode.window.withProgress({
				location: vscode.ProgressLocation.Notification,
				title: "Analyzing YAML files with YAML Doctor...",
				cancellable: false
			}, async (progress) => {
				const { stdout } = await execAsync(command);
				
				// Parse the JSON report
				const reportPath = path.join(workspacePath, 'yaml-doctor-report.json');
				if (fs.existsSync(reportPath)) {
					const reportContent = fs.readFileSync(reportPath, 'utf8');
					const report: YamlDoctorReport = JSON.parse(reportContent);
					
					// Update diagnostics for all files
					for (const fileReport of report.files) {
						const fileUri = vscode.Uri.file(path.join(workspacePath, fileReport.file));
						this.updateDiagnostics(fileUri, report, fileReport.file);
					}
					
					vscode.window.showInformationMessage(
						`YAML Doctor workspace analysis complete. Overall score: ${report.score}/100`
					);
				}
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
			await provider.analyzeFile(uri);
		} else {
			vscode.window.showErrorMessage('No YAML file selected');
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
