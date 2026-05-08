import { useEffect, useRef } from 'react';
import { Asset } from 'expo-asset';

// onnxruntime-react-native yêu cầu native module — không khả dụng trong Expo Go.
// Dùng require() trong try-catch để tránh crash khi chạy trên Expo Go.
let ort = null;
try {
  ort = require('onnxruntime-react-native');
} catch (e) {
  console.warn('[FaceRecognition] ONNX Runtime không khả dụng (cần custom dev build):', e.message);
}

function preprocessFace(pixels) {
  // pixels: Float32Array of RGB values in range 0-255, size 112*112*3
  const data = new Float32Array(3 * 112 * 112);
  for (let i = 0; i < 112 * 112; i++) {
    data[i]                 = (pixels[i * 3]     - 127.5) / 127.5; // R
    data[i + 112 * 112]     = (pixels[i * 3 + 1] - 127.5) / 127.5; // G
    data[i + 2 * 112 * 112] = (pixels[i * 3 + 2] - 127.5) / 127.5; // B
  }
  return new ort.Tensor('float32', data, [1, 3, 112, 112]);
}

function cosineSimilarity(a, b) {
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot   += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

export function useFaceRecognition() {
  const sessionRef = useRef(null);
  const loadingRef = useRef(false);

  useEffect(() => {
    if (!ort || loadingRef.current) return;
    loadingRef.current = true;
    (async () => {
      try {
        console.log('[FaceRecognition] Bắt đầu load model...');
        const t0 = Date.now();
        const [asset] = await Asset.loadAsync(
          require('../assets/buffalo_sc/w600k_mbf.onnx')
        );
        console.log(`[FaceRecognition] Asset resolved: ${asset.localUri} (${Date.now() - t0}ms)`);
        sessionRef.current = await ort.InferenceSession.create(asset.localUri);
        console.log(`[FaceRecognition] Model loaded ✅ (tổng: ${Date.now() - t0}ms)`);
      } catch (e) {
        console.error('[FaceRecognition] Model load failed:', e);
      }
    })();
  }, []);

  const getEmbedding = async (facePixels) => {
    if (!ort) throw new Error('ONNX Runtime không khả dụng – cần custom dev build');
    if (!sessionRef.current) throw new Error('Model chưa load xong');
    console.log(`[FaceRecognition] getEmbedding – input pixels: ${facePixels.length} floats`);
    const t0 = Date.now();
    const tPre = Date.now();
    const input = preprocessFace(facePixels);
    console.log(`[FaceRecognition] preprocess: ${Date.now() - tPre}ms`);
    const tInfer = Date.now();
    const output = await sessionRef.current.run({ input });
    const embedding = output['output'].data;
    console.log(`[FaceRecognition] inference: ${Date.now() - tInfer}ms | total: ${Date.now() - t0}ms | embedding dim: ${embedding.length}`);
    return embedding;
  };

  const compare = async (face1, face2, threshold = 0.3) => {
    console.log('[FaceRecognition] compare – bắt đầu so sánh 2 khuôn mặt...');
    const t0 = Date.now();
    const emb1 = await getEmbedding(face1);
    const t1 = Date.now();
    const emb2 = await getEmbedding(face2);
    const t2 = Date.now();
    const score = cosineSimilarity(emb1, emb2);
    const confidence = score > 0.5 ? 'HIGH' : score > 0.3 ? 'MEDIUM' : 'LOW';
    console.log(
      `[FaceRecognition] compare kết quả:\n` +
      `  emb1: ${t1 - t0}ms | emb2: ${t2 - t1}ms | cosine: ${Date.now() - t2}ms\n` +
      `  tổng: ${Date.now() - t0}ms | score: ${score.toFixed(4)} | threshold: ${threshold}\n` +
      `  is_same_person: ${score > threshold} | confidence: ${confidence}`
    );
    return {
      score:          parseFloat(score.toFixed(4)),
      is_same_person: score > threshold,
      confidence,
    };
  };

  const isReady = () => ort !== null && sessionRef.current !== null;

  return { compare, getEmbedding, isReady };
}
