import { Platform } from "react-native";
import { SoundToneId } from "./types";

const audioContextCache = new Map<string, AudioContext>();

function getAudioContext(): AudioContext | null {
  if (Platform.OS !== "web") return null;
  
  if (!audioContextCache.has("main")) {
    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        audioContextCache.set("main", new AudioContextClass());
      }
    } catch {
      return null;
    }
  }
  return audioContextCache.get("main") || null;
}

interface ToneConfig {
  frequencies: number[];
  durations: number[];
  type: OscillatorType;
  volume: number;
}

const TONE_CONFIGS: Record<SoundToneId, ToneConfig> = {
  chime: {
    frequencies: [523, 659, 784, 1047],
    durations: [0.15, 0.15, 0.15, 0.3],
    type: "sine",
    volume: 0.3,
  },
  bell: {
    frequencies: [440, 554, 659],
    durations: [0.2, 0.2, 0.4],
    type: "sine",
    volume: 0.25,
  },
  xylophone: {
    frequencies: [587, 659, 784, 880, 1047],
    durations: [0.1, 0.1, 0.1, 0.1, 0.2],
    type: "triangle",
    volume: 0.35,
  },
  whistle: {
    frequencies: [880, 1047, 1175, 1319],
    durations: [0.08, 0.08, 0.08, 0.2],
    type: "sine",
    volume: 0.2,
  },
  celebration: {
    frequencies: [523, 659, 784, 659, 784, 1047],
    durations: [0.1, 0.1, 0.1, 0.1, 0.1, 0.3],
    type: "square",
    volume: 0.15,
  },
  gentle: {
    frequencies: [392, 440, 494],
    durations: [0.3, 0.3, 0.5],
    type: "sine",
    volume: 0.2,
  },
  playful: {
    frequencies: [523, 784, 523, 784, 1047],
    durations: [0.08, 0.08, 0.08, 0.08, 0.2],
    type: "square",
    volume: 0.12,
  },
  magic: {
    frequencies: [440, 554, 659, 880, 1175, 1397],
    durations: [0.1, 0.1, 0.1, 0.1, 0.1, 0.3],
    type: "sine",
    volume: 0.25,
  },
  drumroll: {
    frequencies: [147, 165, 185, 196, 220, 247, 262],
    durations: [0.05, 0.05, 0.05, 0.05, 0.05, 0.05, 0.2],
    type: "triangle",
    volume: 0.3,
  },
  fanfare: {
    frequencies: [392, 392, 523, 523, 659, 784],
    durations: [0.15, 0.15, 0.15, 0.15, 0.2, 0.4],
    type: "sawtooth",
    volume: 0.15,
  },
};

async function playWebTone(toneId: SoundToneId): Promise<void> {
  const ctx = getAudioContext();
  if (!ctx) return;

  if (ctx.state === "suspended") {
    await ctx.resume();
  }

  const config = TONE_CONFIGS[toneId];
  let startTime = ctx.currentTime;

  for (let i = 0; i < config.frequencies.length; i++) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = config.type;
    osc.frequency.value = config.frequencies[i];

    gain.gain.setValueAtTime(config.volume, startTime);
    gain.gain.exponentialRampToValueAtTime(0.01, startTime + config.durations[i]);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + config.durations[i]);

    startTime += config.durations[i] * 0.8;
  }
}

async function playNativeTone(_toneId: SoundToneId): Promise<void> {
  console.log("Native tone playback - using web audio on all platforms for now");
}

export async function playCompletionSound(toneId: SoundToneId): Promise<void> {
  try {
    await playWebTone(toneId);
  } catch (error) {
    console.log("Failed to play sound:", error);
  }
}

export async function previewSound(toneId: SoundToneId): Promise<void> {
  await playCompletionSound(toneId);
}
