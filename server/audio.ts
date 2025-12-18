import type { Request, Response } from "express";

interface ToneConfig {
  frequencies: number[];
  durations: number[];
  type: "sine" | "square" | "triangle";
}

const TONE_CONFIGS: Record<string, ToneConfig> = {
  chime: { frequencies: [523, 659, 784], durations: [0.15, 0.15, 0.3], type: "sine" },
  bell: { frequencies: [440, 554, 659, 880], durations: [0.1, 0.1, 0.1, 0.4], type: "sine" },
  xylophone: { frequencies: [392, 494, 587, 784], durations: [0.1, 0.1, 0.1, 0.3], type: "triangle" },
  whistle: { frequencies: [880, 1047, 1319], durations: [0.2, 0.2, 0.3], type: "sine" },
  celebration: { frequencies: [523, 659, 784, 1047, 784, 1047], durations: [0.1, 0.1, 0.1, 0.15, 0.15, 0.3], type: "sine" },
  gentle: { frequencies: [330, 392, 494], durations: [0.3, 0.3, 0.5], type: "sine" },
  playful: { frequencies: [523, 784, 523, 784, 1047], durations: [0.1, 0.1, 0.1, 0.1, 0.3], type: "square" },
  magic: { frequencies: [392, 494, 587, 784, 988], durations: [0.1, 0.1, 0.1, 0.15, 0.4], type: "sine" },
  drumroll: { frequencies: [220, 220, 220, 220, 330], durations: [0.08, 0.08, 0.08, 0.08, 0.4], type: "square" },
  fanfare: { frequencies: [392, 494, 587, 784, 587, 784, 988], durations: [0.15, 0.1, 0.15, 0.1, 0.1, 0.1, 0.4], type: "sine" },
};

function generateWavBuffer(toneId: string): Buffer {
  const config = TONE_CONFIGS[toneId] || TONE_CONFIGS.chime;
  const sampleRate = 44100;
  const totalDuration = config.durations.reduce((a, b) => a + b, 0);
  const numSamples = Math.floor(sampleRate * totalDuration);
  
  const samples = new Int16Array(numSamples);
  let sampleIndex = 0;
  
  for (let i = 0; i < config.frequencies.length; i++) {
    const freq = config.frequencies[i];
    const duration = config.durations[i];
    const noteSamples = Math.floor(sampleRate * duration);
    
    for (let j = 0; j < noteSamples && sampleIndex < numSamples; j++) {
      const t = j / sampleRate;
      const envelope = Math.min(1, Math.min(t * 20, (duration - t) * 10));
      
      let wave: number;
      const phase = 2 * Math.PI * freq * t;
      
      switch (config.type) {
        case "square":
          wave = Math.sin(phase) > 0 ? 0.3 : -0.3;
          break;
        case "triangle":
          wave = (2 / Math.PI) * Math.asin(Math.sin(phase)) * 0.5;
          break;
        default:
          wave = Math.sin(phase) * 0.5;
      }
      
      samples[sampleIndex++] = Math.floor(wave * envelope * 32767 * 0.7);
    }
  }
  
  const dataSize = numSamples * 2;
  const buffer = Buffer.alloc(44 + dataSize);
  
  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write("WAVE", 8);
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(1, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * 2, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write("data", 36);
  buffer.writeUInt32LE(dataSize, 40);
  
  for (let i = 0; i < numSamples; i++) {
    buffer.writeInt16LE(samples[i], 44 + i * 2);
  }
  
  return buffer;
}

export function handleAudioRequest(req: Request, res: Response) {
  const toneId = req.params.toneId;
  
  if (!TONE_CONFIGS[toneId]) {
    return res.status(404).json({ error: "Tone not found" });
  }
  
  const wavBuffer = generateWavBuffer(toneId);
  
  res.setHeader("Content-Type", "audio/wav");
  res.setHeader("Content-Length", wavBuffer.length);
  res.setHeader("Cache-Control", "public, max-age=31536000");
  res.send(wavBuffer);
}

export function getAvailableTones(_req: Request, res: Response) {
  res.json({
    tones: Object.keys(TONE_CONFIGS),
  });
}
