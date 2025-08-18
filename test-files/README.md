# 🧪 Como Testar o YAML Doctor VS Code Extension

## Pré-requisitos

- ✅ **Docker** instalado e rodando
- ✅ **VS Code** com a extensão em desenvolvimento
- ✅ **Modo Watch** ativo (webpack compilando automaticamente)

## 📋 Passo a Passo para Testar

### 1. 🚀 Iniciar Extensão em Modo Debug

1. **Pressione `F5`** ou vá em **Run > Start Debugging**
2. Uma nova janela do VS Code será aberta com a extensão carregada
3. Você verá "[Extension Development Host]" no título da janela

### 2. 🔍 Testar Análise de Arquivo Individual

1. Na janela de desenvolvimento, abra um dos arquivos de teste:
   - `test-files/docker-compose.yml`
   - `test-files/kubernetes.yaml` 
   - `test-files/github-actions.yml`

2. **Teste via Context Menu:**
   - Clique direito no arquivo no explorer
   - Selecione **"Analyze Current YAML File"**

3. **Teste via Command Palette:**
   - `Ctrl+Shift+P` → "YAML Doctor: Analyze Current YAML File"

4. **Verificar resultados:**
   - Veja o Output Channel "YAML Doctor" (`View > Output`)
   - Verifique o painel **Problems** (`View > Problems`)
   - Aguarde mensagem de sucesso/erro

### 3. 🏗️ Testar Análise do Workspace

1. **Command Palette**: `Ctrl+Shift+P`
2. Digite: **"YAML Doctor: Analyze All YAML Files in Workspace"**
3. Aguarde o progresso da análise
4. Verifique os diagnósticos para todos os arquivos YAML

### 4. 📊 Testar Visualização de Relatórios

Após executar análise:

1. **Relatório HTML**: 
   - `Ctrl+Shift+P` → "YAML Doctor: Show YAML Doctor Report"
   - Deve abrir uma webview com o relatório

2. **Badge SVG**:
   - `Ctrl+Shift+P` → "YAML Doctor: Generate YAML Doctor Badge"
   - Deve abrir o arquivo de badge gerado

### 5. ⚙️ Testar Configurações

1. **Abrir Settings**: `Ctrl+,`
2. Buscar por: **"yaml doctor"**
3. Testar mudanças em:
   - `yamlDoctor.dockerImage`
   - `yamlDoctor.autoAnalyze`
   - `yamlDoctor.showDiagnostics`

### 6. 🔄 Testar Auto-análise

1. Ativar: `yamlDoctor.autoAnalyze = true`
2. Editar e salvar um arquivo YAML
3. Verificar se análise roda automaticamente

## Files

- `docker-compose.yml` - Sample Docker Compose file with some issues
- `kubernetes.yaml` - Sample Kubernetes manifest
- `github-actions.yml` - Sample GitHub Actions workflow

## 🐛 Problemas Esperados nos Arquivos de Teste

### `docker-compose.yml`
- ⚠️ Uso de tags `:latest`
- ⚠️ Falta de políticas de restart
- ⚠️ Senha hardcoded

### `kubernetes.yaml`
- ⚠️ Uso de tag `:latest`
- ⚠️ Falta de resource limits
- ⚠️ Falta de health probes

### `github-actions.yml`
- ⚠️ Falta trigger `on`
- ⚠️ Versões de actions não fixadas
- ⚠️ Job sem `runs-on`

## 🔧 Debug e Troubleshooting

### Verificar Logs
1. **Extension Host**: `Help > Toggle Developer Tools`
2. **YAML Doctor Output**: `View > Output > YAML Doctor`
3. **Console do Extension**: Console tab nas Developer Tools

### Problemas Comuns

**🐳 Docker não encontrado:**
```
Error: Docker not found or not running
```
→ Verifique se Docker está instalado e rodando

**📁 Nenhum workspace:**
```
No workspace folder found
```
→ Abra uma pasta como workspace no VS Code

**🔒 Permissões:**
```
Permission denied
```
→ Verifique permissões do Docker e pastas

## 📝 O Que Verificar

- [ ] ✅ Extensão ativa sem erros
- [ ] ✅ Comandos aparecem no Command Palette
- [ ] ✅ Context menus funcionam
- [ ] ✅ Diagnósticos aparecem no Problems panel
- [ ] ✅ Output channel mostra logs
- [ ] ✅ Relatório HTML abre corretamente
- [ ] ✅ Badge SVG é gerado
- [ ] ✅ Configurações funcionam
- [ ] ✅ Auto-análise funciona (se ativada)

## 🎯 Resultado Esperado

Após análise bem-sucedida:
- Arquivos `yaml-doctor-report.html`, `yaml-doctor-report.json` e `yaml-doctor-badge.svg` criados
- Diagnósticos visíveis no painel Problems
- Score exibido na notificação (ex: "Score: 75/100")
4. View the diagnostics in the Problems panel
5. Generate reports and badges

These files intentionally contain some issues to demonstrate the extension's capabilities.
