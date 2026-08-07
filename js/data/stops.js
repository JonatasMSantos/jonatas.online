// Paradas do tour pelo quarto, em coordenadas locais do quarto (piso em y = 0).
// cam: posição da câmera; look: ponto focal; roll em graus; dwell: fração do
// span da parada em platô (câmera parada, copy legível).

export const ROOM_STOPS = [
  { id: 'fullstack', cam: [0.0, 1.55, -0.15], look: [2.35, 1.08, 0.30], roll: -1.6, dwell: 0.62 },
  { id: 'ai',        cam: [1.15, 1.42, 1.05], look: [2.42, 1.12, 0.70], roll: 1.4,  dwell: 0.62 },
  { id: 'infra',     cam: [-0.75, 1.5, 0.30], look: [-2.5, 1.15, 1.45], roll: -1.8, dwell: 0.62 },
  { id: 'arch',      cam: [0.30, 1.55, -0.4], look: [0.9, 1.15, 1.95],  roll: 1.6,  dwell: 0.62 },
  { id: 'iot',       cam: [-1.15, 1.38, -0.35], look: [-2.6, 0.98, -0.62], roll: -1.4, dwell: 0.62 },
  { id: 'music',     cam: [-0.3, 1.25, -0.5], look: [-1.62, 0.72, -1.66], roll: 1.8, dwell: 0.66 },
];

// Pose de saída: a câmera recua até a janela e olha de volta para o quarto.
export const ROOM_EXIT = { cam: [0.55, 1.62, -1.25], look: [0.6, 0.85, 1.4] };
