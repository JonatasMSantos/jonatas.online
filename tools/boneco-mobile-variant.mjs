// Variante mobile do boneco: remove tangentes, re-solda, re-simplifica e
// re-quantiza. A compressão meshopt final é aplicada via CLI depois.
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { weld, simplify, quantize, prune, dedup } from '@gltf-transform/functions';
import { MeshoptDecoder, MeshoptEncoder, MeshoptSimplifier } from 'meshoptimizer';

const [IN, OUT, RATIO = '0.08', ERROR = '0.15'] = process.argv.slice(2);

await MeshoptDecoder.ready;
await MeshoptEncoder.ready;
await MeshoptSimplifier.ready;

const io = new NodeIO()
  .registerExtensions(ALL_EXTENSIONS)
  .registerDependencies({ 'meshopt.decoder': MeshoptDecoder, 'meshopt.encoder': MeshoptEncoder });

const doc = await io.read(IN);

for (const mesh of doc.getRoot().listMeshes()) {
  for (const prim of mesh.listPrimitives()) {
    const t = prim.getAttribute('TANGENT');
    if (t) {
      prim.setAttribute('TANGENT', null);
      t.dispose();
    }
  }
}

await doc.transform(
  dedup(),
  weld(),
  simplify({ simplifier: MeshoptSimplifier, ratio: parseFloat(RATIO), error: parseFloat(ERROR) }),
  quantize({ quantizePosition: 12, quantizeNormal: 8, quantizeTexcoord: 10 }),
  prune()
);

await io.write(OUT, doc);

for (const mesh of doc.getRoot().listMeshes()) {
  for (const prim of mesh.listPrimitives()) {
    const pos = prim.getAttribute('POSITION');
    const idx = prim.getIndices();
    console.log('verts:', pos.getCount(), 'tris:', idx ? idx.getCount() / 3 : 'n/a');
  }
}
