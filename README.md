# jonatas.online

Portfólio de Jônatas Santos, Desenvolvedor Fullstack Sênior (Java e JavaScript).

Um desktop de macOS com o papel de parede clássico do Windows XP. Ao abrir, um crachá
cai pendurado na tela; os atalhos abrem janelas arrastáveis com os projetos, o busto 3D,
as skills caindo letra por letra e a experiência num terminal.

A versão anterior (cena 3D com scroll) está na tag `v1`.

## Stack

- Vite + React (JS) + Tailwind v4 + shadcn
- Componentes do [React Bits](https://reactbits.dev) via registry `@react-bits` do shadcn:
  Lanyard (crachá), CardSwap (projetos), ModelViewer (busto), FallingText (skills),
  Dock, Folder, TextType (terminal) e ClickSpark (cliques no papel de parede)
- i18n PT-BR e EN com persistência em localStorage
- Deploy: Docker (build do Vite) + nginx no Railway

## Rodar localmente

```bash
npm install
npm run dev
```

## Adicionar componentes do React Bits

```bash
npx shadcn@latest add @react-bits/NomeDoComponente-JS-CSS
```

O MCP do shadcn está em `.mcp.json` (`npx shadcn@latest mcp init --client claude`).

## Estrutura

```
src/App.jsx                 desktop: gerenciador de janelas, atalhos, Dock
src/components/             componentes do React Bits (instalados pelo shadcn)
src/components/desktop/     barra de menus, janela, ícone de app, crachá
src/apps/                   conteúdo de cada janela + registry (ícones, tamanhos)
src/data/content.js         todo o copy (pt/en), projetos, skills, links
src/lib/badge.js            gera frente, verso e alça do crachá em canvas
src/lib/i18n.jsx            contexto de idioma
src/styles/desktop.css      estilos do desktop e dos apps
public/                     papel de parede, foto, logos, screenshots, busto .glb
assets-src/                 originais pesados (não vão para o build)
deploy/                     Dockerfile multi-stage + nginx.conf
```

## Deploy no Railway

O `railway.json` aponta para `deploy/Dockerfile`, que roda o build do Vite e serve o
`dist/` com nginx em `$PORT`. Bundles em `/assets/` têm cache imutável e o
`index.html` vai sem cache.
