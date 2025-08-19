# YAML Doctor VS Code Extension

A powerful VS Code extension that integrates [YAML Doctor](https://github.com/darioajr/yaml-doctor) to provide comprehensive analysis and diagnostics for your YAML files including Docker Compose, Kubernetes manifests, and GitHub Actions workflows.

## Features

- **Real-time Analysis**: Analyze YAML files with comprehensive linting and best practices checking
- **Multiple File Types**: Support for Docker Compose, Kubernetes, and GitHub Actions YAML files
- **Diagnostics Integration**: See issues directly in the VS Code Problems panel
- **Visual Reports**: Generate and view beautiful HTML reports
- **Score & Badge Generation**: Get quality scores and generate SVG badges for your projects
- **Workspace Analysis**: Analyze all YAML files in your workspace at once
- **Auto-analysis**: Optional automatic analysis on file save

## Requirements

- **Docker**: This extension requires Docker to be installed and running on your system
- The extension uses the `darioajr/yaml-doctor:latest` Docker image

## Extension Commands

This extension contributes the following commands:

- `YAML Doctor: Analyze Current YAML File` - Analyze the currently open YAML file
- `YAML Doctor: Analyze All YAML Files in Workspace` - Analyze all YAML files in the workspace
- `YAML Doctor: Show YAML Doctor Report` - Display the generated HTML report
- `YAML Doctor: Generate YAML Doctor Badge` - Generate and open the quality badge

## Usage

### Analyze a Single File

1. Open a YAML file (`.yml` or `.yaml`)
2. Right-click in the editor or file explorer
3. Select "Analyze Current YAML File" from the context menu
4. Or use the Command Palette (`Ctrl+Shift+P`) and search for "YAML Doctor"

### Analyze Entire Workspace

1. Open the Command Palette (`Ctrl+Shift+P`)
2. Run "YAML Doctor: Analyze All YAML Files in Workspace"
3. Wait for the analysis to complete
4. View results in the Problems panel

### View Reports

After running analysis:
- Use "YAML Doctor: Show YAML Doctor Report" to view the detailed HTML report
- Use "YAML Doctor: Generate YAML Doctor Badge" to see the quality badge

## Extension Settings

This extension contributes the following settings:

- `yamlDoctor.dockerImage`: Docker image to use for analysis (default: `darioajr/yaml-doctor:latest`)
- `yamlDoctor.autoAnalyze`: Automatically analyze YAML files on save (default: `false`)
- `yamlDoctor.showDiagnostics`: Show diagnostics in the editor (default: `true`)

## What Does It Check?

### Common Issues
- Tabs vs spaces
- Trailing whitespace
- Long lines
- Invalid YAML syntax
- Duplicate keys

### Docker Compose Specific
- Missing `services` section
- Missing `image` or `build` directive
- Usage of `:latest` tags (not recommended)
- Missing `restart` policies

### GitHub Actions Specific
- Missing `jobs` and `steps`
- Missing `runs-on` specification
- Unpinned action versions
- Missing trigger events (`on`)

### Kubernetes Specific
- Missing `apiVersion`, `kind`, or `metadata.name`
- Usage of `:latest` tags (not recommended)
- Missing `resources.limits`
- Missing health probes

## Installation

1. Install this extension from the VS Code Marketplace
2. Make sure Docker is installed and running
3. Open a workspace with YAML files
4. Start analyzing!

## Known Issues

- Analysis requires Docker to be running
- First run may take longer as it downloads the Docker image
- Large workspaces may take time to analyze

## Release Notes

### 0.1.3

Initial release of YAML Doctor VS Code Extension:
- Basic YAML file analysis
- Workspace-wide analysis
- HTML report generation
- Diagnostics integration
- Badge generation

---

## Contributing

If you find issues or want to contribute to this extension, please visit our [GitHub repository](https://github.com/darioajr/yaml-doctor).

**Enjoy using YAML Doctor!**
