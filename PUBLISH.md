# 🚀 Publicação da Extensão VS Code

Este documento explica como configurar e usar o pipeline de GitHub Actions para publicar a extensão YAML Doctor no VS Code Marketplace.

## 📋 Pré-requisitos

### 1. 🔑 Personal Access Tokens

Você precisa criar tokens de acesso para os marketplaces:

#### **VS Code Marketplace (Microsoft)**
1. Vá para [Azure DevOps](https://dev.azure.com/)
2. Crie uma organização (se não tiver)
3. Vá em **User Settings** → **Personal Access Tokens**
4. Crie um token com escopo **Marketplace (Manage)**
5. Copie o token (será usado como `VSCE_PAT`)

#### **Open VSX Registry (Eclipse)**
1. Vá para [Open VSX Registry](https://open-vsx.org/)
2. Faça login com GitHub
3. Vá em **Settings** → **Access Tokens**
4. Crie um novo token
5. Copie o token (será usado como `OVSX_PAT`)

### 2. 🔐 GitHub Secrets

Configure os seguintes secrets no seu repositório GitHub:

1. Vá para **Settings** → **Secrets and variables** → **Actions**
2. Adicione os seguintes secrets:

```
VSCE_PAT = seu_token_do_vs_code_marketplace
OVSX_PAT = seu_token_do_open_vsx
```

### 3. 📝 Environment Protection (Opcional)

1. Vá para **Settings** → **Environments**
2. Crie um environment chamado `production`
3. Configure **Protection rules** (aprovação manual, etc.)

## 🎯 Como Publicar

### Método 1: Release via Tag

```bash
# Crie e publique uma tag
git tag v1.0.0
git push origin v1.0.0
```

### Método 2: Workflow Manual

1. Vá para **Actions** → **Publish VS Code Extension**
2. Clique em **Run workflow**
3. Digite a versão (ex: `1.0.0`)
4. Clique em **Run workflow**

## 🔄 Pipeline Steps

O pipeline executa os seguintes passos:

### 1. 🧪 Test
- Instala dependências
- Executa linter
- Compila TypeScript
- Executa testes

### 2. 📦 Package
- Cria arquivo `.vsix`
- Atualiza versão no `package.json`
- Faz upload do artefato

### 3. 🏪 Publish Marketplace
- Publica no VS Code Marketplace oficial
- Usa o token `VSCE_PAT`

### 4. 🌐 Publish Open VSX
- Publica no Open VSX Registry
- Usa o token `OVSX_PAT`
- Para compatibilidade com VS Codium

### 5. 🏷️ Create Release
- Cria release no GitHub
- Anexa arquivo `.vsix`
- Gera notas de release automaticamente

## ⚙️ Configurações do Package.json

Certifique-se que o `package.json` tem:

```json
{
  "publisher": "seu-publisher-id",
  "repository": {
    "type": "git",
    "url": "https://github.com/usuario/repo.git"
  },
  "homepage": "https://github.com/usuario/repo",
  "bugs": {
    "url": "https://github.com/usuario/repo/issues"
  }
}
```

## 🛠️ Comandos Úteis

### Testar Localmente

```bash
# Instalar VSCE
npm install -g @vscode/vsce

# Criar pacote local
vsce package

# Testar instalação local
code --install-extension yaml-doctor-1.0.0.vsix
```

### Publicar Manualmente

```bash
# Publicar no VS Code Marketplace
vsce publish

# Publicar no Open VSX
npx ovsx publish yaml-doctor-1.0.0.vsix
```

## 🔍 Verificar Publicação

Após a publicação bem-sucedida:

1. **VS Code Marketplace**: https://marketplace.visualstudio.com/items?itemName=darioajr.yaml-doctor
2. **Open VSX**: https://open-vsx.org/extension/darioajr/yaml-doctor

## 🐛 Troubleshooting

### Problemas Comuns

**❌ Token Inválido**
```
Error: Failed request: (401) Unauthorized
```
→ Verifique se os tokens estão corretos nos secrets

**❌ Publisher Não Encontrado**
```
Error: Publisher 'xxx' not found
```
→ Registre o publisher no marketplace primeiro

**❌ Versão Já Existe**
```
Error: Extension version already exists
```
→ Incremente a versão no package.json

## 📊 Monitoramento

- **GitHub Actions**: Monitore logs em **Actions**
- **Marketplace**: Veja estatísticas de download
- **Issues**: Monitore feedback dos usuários

## 🎯 Próximos Passos

1. Configure os tokens necessários
2. Teste o pipeline em branch de desenvolvimento
3. Publique primeira versão com tag `v0.1.0`
4. Configure auto-updates e release notes
