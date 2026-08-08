#!/bin/bash
# Pipeline de assets. Rodar uma vez a partir da raiz do repositório.
# A fonte (jonatas.glb e projetos/) nunca é modificada.
set -euo pipefail

# Modelo: variante desktop (~180k tris, texturas WebP 2k) e mobile (~72k tris, 1k)
npx --yes @gltf-transform/cli optimize jonatas.glb assets/3dmodels/jonatas.min.glb \
  --compress meshopt --simplify true --simplify-ratio 0.3 --simplify-error 0.0003 \
  --texture-compress webp --texture-size 2048

npx --yes @gltf-transform/cli optimize jonatas.glb assets/3dmodels/jonatas.min.1k.glb \
  --compress meshopt --simplify true --simplify-ratio 0.12 --simplify-error 0.0008 \
  --texture-compress webp --texture-size 1024

# Boneco da seção Experiência, desktop: ~300k tris com erro apertado
# (qualidade primeiro), texturas WebP 2k.
npx --yes @gltf-transform/cli optimize boneco-jonatas.glb assets/3dmodels/boneco-jonatas.min.glb \
  --compress meshopt --simplify true --simplify-ratio 0.15 --simplify-error 0.001 \
  --texture-compress webp --texture-size 2048

# Variante mobile do boneco (~1.2MB: ~100k tris, sem tangentes, texturas 512,
# posições 12 bits). O script corta o custo por vértice; requer
#   npm i --no-save @gltf-transform/core @gltf-transform/functions \
#     @gltf-transform/extensions meshoptimizer
# npx --yes @gltf-transform/cli optimize boneco-jonatas.glb /tmp/boneco-m1.glb \
#   --compress meshopt --simplify true --simplify-ratio 0.05 --simplify-error 0.01 \
#   --texture-compress webp --texture-size 512
# node tools/boneco-mobile-variant.mjs /tmp/boneco-m1.glb /tmp/boneco-m2.glb 0.9 0.01
# npx --yes @gltf-transform/cli meshopt /tmp/boneco-m2.glb assets/3dmodels/boneco-jonatas.min.512.glb --level high

# Screenshots: WebP 1600w (medeligne 2000w; player-configs mantém 528w nativo).
# Requer sharp (npm i sharp) ou cwebp. Referência com cwebp:
#   cwebp -q 82 -resize 1600 0 in.png -o out.webp
