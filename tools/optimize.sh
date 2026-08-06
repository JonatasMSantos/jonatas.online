#!/bin/bash
# Pipeline de assets. Rodar uma vez a partir da raiz do repositório.
# A fonte (busto-jonatas.glb e projetos/) nunca é modificada.
set -euo pipefail

# Busto: variante desktop (~180k tris, texturas WebP 2k) e mobile (~72k tris, 1k)
npx --yes @gltf-transform/cli optimize busto-jonatas.glb assets/models/busto-jonatas.min.glb \
  --compress meshopt --simplify true --simplify-ratio 0.3 --simplify-error 0.0003 \
  --texture-compress webp --texture-size 2048

npx --yes @gltf-transform/cli optimize busto-jonatas.glb assets/models/busto-jonatas.min.1k.glb \
  --compress meshopt --simplify true --simplify-ratio 0.12 --simplify-error 0.0008 \
  --texture-compress webp --texture-size 1024

# Screenshots: WebP 1600w (medeligne 2000w; player-configs mantém 528w nativo).
# Requer sharp (npm i sharp) ou cwebp. Referência com cwebp:
#   cwebp -q 82 -resize 1600 0 in.png -o out.webp
