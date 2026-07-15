# Vertexion Agent System 5.0.0 — Complemento do 4.0

Este pacote é um **complemento operacional** do pacote 4.0.0. Ele corrige lacunas estruturais, adiciona scripts de restauração e backup, melhora o Control Center, amplia a experiência visual com **tema claro glassmorphism**, adiciona visualização local de relatórios e ideias, cria base para aprovações programáticas e organiza rotinas de forma mais determinística.

## Principais melhorias

- instalação com opção de **merge**, **clean install** e **dry-run**;
- backup e restauração de configuração **Windows e WSL**;
- scripts `vertexion-backup` e `vertexion-restore`;
- `disableBypassPermissionsMode` ativado nas configurações;
- rotação de logs e retenção configurável;
- UI do Control Center refeita em **tema claro glassmorphism**;
- páginas melhores para **leads**, **ideias**, **relatórios**, **atividade** e **sistema**;
- geração e persistência de **mensagem personalizada** e **roteiro Loom** do melhor lead;
- viewer de relatórios e detalhes de ideia;
- base de **time capsule** mensal e snapshots;
- script de permissões locais (`permission-prompt.mjs`) e documentação da integração;
- fallback seguro para o modo atual quando a integração de permissões não estiver ativa.

## Escopo deste complemento

O 5.0.0 **não sobrescreve automaticamente os seus projetos de produto**. Ele melhora o sistema de agentes, a camada de coordenação e o dashboard local. A aplicação das correções nos produtos (ZapMenu, Toveli, Vertexion, Signalys e Tenvyr) continua acontecendo por fases controladas.
