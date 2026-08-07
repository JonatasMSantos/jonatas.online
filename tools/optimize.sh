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

# Boneto da seção Experiência: a fonte não está no repo; o min distribuído foi
# re-otimizado a partir do min anterior (a simplificação converge em ~203k tris
# por causa das costuras de UV do scan, independente do erro).
# npx --yes @gltf-transform/cli optimize boneto-jonatas.glb assets/3dmodels/boneto-jonatas.min.glb \
#   --compress meshopt --simplify true --simplify-ratio 0.1 --simplify-error 0.05 \
#   --texture-compress webp --texture-size 1024

# Screenshots: WebP 1600w (medeligne 2000w; player-configs mantém 528w nativo).
# Requer sharp (npm i sharp) ou cwebp. Referência com cwebp:
#   cwebp -q 82 -resize 1600 0 in.png -o out.webp
