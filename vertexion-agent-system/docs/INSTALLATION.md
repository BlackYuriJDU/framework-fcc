# Instalação

## Pré-requisitos

- Windows 10/11 com WSL.
- Node.js 20 ou superior no WSL.
- Git.
- Claude Code ou `fcc-claude` funcionando no WSL.
- Projetos acessíveis em `/mnt/c/Users/Arthur Araújo/Downloads` ou caminho configurado.

## Instalação recomendada

No PowerShell, dentro da pasta extraída:

```powershell
Set-ExecutionPolicy -Scope Process Bypass
.\install.ps1
```

Por padrão, a configuração global é instalada **no WSL**, pois esse é o ambiente principal. O script:

1. cria backup de `~/.claude` no WSL;
2. substitui agentes, Skills, regras, `CLAUDE.md` e settings;
3. instala o sistema em `~/.claude/vertexion-agent-system`;
4. cria comandos em `~/.local/bin`;
5. cria atalho no Desktop;
6. configura somente a inicialização do dashboard no login;
7. deixa o scheduler interno responsável pelas rotinas.

Para também instalar a configuração no Claude Code do Windows:

```powershell
.\install.ps1 -InstallWindowsConfig
```

Use apenas se realmente executar Claude Code fora do WSL. Os hooks principais foram desenhados para WSL.

## Primeiro diagnóstico

```bash
export PATH="$HOME/.local/bin:$PATH"
vertexion-doctor
vertexion-discover
vertexion-start
```

## Gerar plano sem aplicar projetos

```bash
vertexion-plan
```

## Desinstalação

```powershell
.\uninstall.ps1
```

O backup anterior é preservado. A restauração automática deve ser escolhida conscientemente.
