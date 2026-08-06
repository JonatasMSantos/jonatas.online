# jonatas.online

Portfólio 3D de Jônatas Santos, Desenvolvedor Fullstack Sênior (Java e JavaScript).

Uma única cena WebGL contínua: o busto 3D com as skills orbitando, um mergulho vertical
pela escuridão e a entrada pela janela de um quarto construído inteiramente em código,
onde cada objeto conta uma parte da trajetória. Scroll dirige a câmera; tudo é
função pura da posição, então o caminho é reversível.

## Stack

- HTML, CSS e JavaScript puros, sem build e sem framework
- Three.js 0.180.0 via importmap CDN (meshopt para o busto, pós-processamento com bloom, vinheta e grain)
- i18n PT-BR e EN com persistência em localStorage
- Deploy: Docker + nginx (Railway)

## Rodar localmente

```bash
npx http-server -p 8080 -c-1
# http://localhost:8080          site
# http://localhost:8080/?debug   overlay de fps, draw calls e progresso
```

## Estrutura

```
index.html            página única com todas as seções
css/                  base, ui (nav, preloader, painéis), sections (projetos, contato)
js/                   scroll, springs, i18n, preloader, cursor, reveal
js/scene/             renderer + post chain, backdrop, hero, câmera em trilho
js/scene/room/        quarto procedural: casca, mesa, rack, estante, bancada, violão
js/data/              todo o copy (pt/en), paradas do tour, skills dos anéis
assets/               busto otimizado (meshopt) e screenshots em WebP
deploy/               Dockerfile + nginx.conf (porta via $PORT, MIME de .glb)
tools/optimize.sh     pipeline de otimização dos assets (rodar uma vez)
```

## Deploy no Railway

O `railway.json` aponta para `deploy/Dockerfile`. O nginx escuta em `$PORT`,
serve `assets/` com cache imutável e `index.html` com no-cache.
