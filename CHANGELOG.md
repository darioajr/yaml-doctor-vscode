# Change Log

All notable changes to the "yaml-doctor" extension will be documented in this file.

## [0.1.0] - 2025-08-18

### Added
- 🎉 Initial release of YAML Doctor VS Code Extension
- ✨ YAML file analysis using Docker-based yaml-doctor
- 🔍 Real-time diagnostics integration with VS Code Problems panel
- 📊 HTML report generation and display via webview
- 🏷️ SVG badge generation for quality scores
- ⚙️ Configuration options for Docker image and auto-analysis
- 🎯 Support for Docker Compose, Kubernetes, and GitHub Actions YAML files
- 📝 Context menu integration for YAML files
- 🔄 Workspace-wide analysis capability
- 💡 Auto-analysis on file save (optional)

### Commands
- `YAML Doctor: Analyze Current YAML File` - Analyze the currently open YAML file
- `YAML Doctor: Analyze All YAML Files in Workspace` - Analyze all YAML files in workspace
- `YAML Doctor: Show YAML Doctor Report` - Display generated HTML report
- `YAML Doctor: Generate YAML Doctor Badge` - Generate and open quality badge

### Configuration
- `yamlDoctor.dockerImage` - Docker image to use for analysis (default: darioajr/yaml-doctor:latest)
- `yamlDoctor.autoAnalyze` - Automatically analyze YAML files on save (default: false)
- `yamlDoctor.showDiagnostics` - Show diagnostics in the editor (default: true)

### Requirements
- Docker must be installed and running
- VS Code version 1.103.0 or higher

---

## [Unreleased]

### Planned Features
- Language server integration for better performance
- Custom rule configuration
- Inline quick fixes for common issues
- Integration with Git hooks
- Support for custom yaml-doctor configurations