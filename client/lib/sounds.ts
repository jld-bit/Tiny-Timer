import { Platform } from "react-native";
import * as Haptics from "expo-haptics";
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
  hapticCount: number;
  hapticStyle: "light" | "medium" | "heavy";
}

const TONE_CONFIGS: Record<SoundToneId, ToneConfig> = {
  vibrate_only: {
    frequencies: [],
    durations: [],
    type: "sine",
    volume: 0,
    hapticCount: 3,
    hapticStyle: "medium",
  },
  chime: {
    frequencies: [523, 659, 784, 1047],
    durations: [0.15, 0.15, 0.15, 0.3],
    type: "sine",
    volume: 0.3,
    hapticCount: 4,
    hapticStyle: "medium",
  },
  bell: {
    frequencies: [440, 554, 659],
    durations: [0.2, 0.2, 0.4],
    type: "sine",
    volume: 0.25,
    hapticCount: 3,
    hapticStyle: "heavy",
  },
  xylophone: {
    frequencies: [587, 659, 784, 880, 1047],
    durations: [0.1, 0.1, 0.1, 0.1, 0.2],
    type: "triangle",
    volume: 0.35,
    hapticCount: 5,
    hapticStyle: "light",
  },
  whistle: {
    frequencies: [880, 1047, 1175, 1319],
    durations: [0.08, 0.08, 0.08, 0.2],
    type: "sine",
    volume: 0.2,
    hapticCount: 4,
    hapticStyle: "light",
  },
  celebration: {
    frequencies: [523, 659, 784, 659, 784, 1047],
    durations: [0.1, 0.1, 0.1, 0.1, 0.1, 0.3],
    type: "square",
    volume: 0.15,
    hapticCount: 6,
    hapticStyle: "medium",
  },
  gentle: {
    frequencies: [392, 440, 494],
    durations: [0.3, 0.3, 0.5],
    type: "sine",
    volume: 0.2,
    hapticCount: 2,
    hapticStyle: "light",
  },
  playful: {
    frequencies: [523, 784, 523, 784, 1047],
    durations: [0.08, 0.08, 0.08, 0.08, 0.2],
    type: "square",
    volume: 0.12,
    hapticCount: 5,
    hapticStyle: "light",
  },
  magic: {
    frequencies: [440, 554, 659, 880, 1175, 1397],
    durations: [0.1, 0.1, 0.1, 0.1, 0.1, 0.3],
    type: "sine",
    volume: 0.25,
    hapticCount: 6,
    hapticStyle: "medium",
  },
  drumroll: {
    frequencies: [147, 165, 185, 196, 220, 247, 262],
    durations: [0.05, 0.05, 0.05, 0.05, 0.05, 0.05, 0.2],
    type: "triangle",
    volume: 0.3,
    hapticCount: 7,
    hapticStyle: "heavy",
  },
  fanfare: {
    frequencies: [392, 392, 523, 523, 659, 784],
    durations: [0.15, 0.15, 0.15, 0.15, 0.2, 0.4],
    type: "sawtooth",
    volume: 0.15,
    hapticCount: 6,
    hapticStyle: "heavy",
  },
};

function generateWavDataUri(frequencies: number[], durations: number[], volume: number): string {
  const sampleRate = 44100;
  let totalSamples = 0;
  for (const d of durations) {
    totalSamples += Math.floor(sampleRate * d);
  }
  
  const samples = new Float32Array(totalSamples);
  let offset = 0;
  
  for (let i = 0; i < frequencies.length; i++) {
    const freq = frequencies[i];
    const duration = durations[i];
    const numSamples = Math.floor(sampleRate * duration);
    
    for (let j = 0; j < numSamples; j++) {
      const t = j / sampleRate;
      const envelope = Math.exp(-3 * t / duration);
      samples[offset + j] = Math.sin(2 * Math.PI * freq * t) * volume * envelope;
    }
    offset += numSamples;
  }
  
  const buffer = new ArrayBuffer(44 + totalSamples * 2);
  const view = new DataView(buffer);
  
  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };
  
  writeString(0, 'RIFF');
  view.setUint32(4, 36 + totalSamples * 2, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(36, 'data');
  view.setUint32(40, totalSamples * 2, true);
  
  for (let i = 0; i < totalSamples; i++) {
    const sample = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(44 + i * 2, sample * 0x7FFF, true);
  }
  
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  
  return 'data:audio/wav;base64,' + btoa(binary);
}

const audioCache = new Map<SoundToneId, string>();

function getOrCreateAudioUri(toneId: SoundToneId): string | null {
  if (toneId === "vibrate_only") return null;
  
  if (audioCache.has(toneId)) {
    return audioCache.get(toneId)!;
  }
  
  const config = TONE_CONFIGS[toneId];
  if (config.frequencies.length === 0) return null;
  
  const uri = generateWavDataUri(config.frequencies, config.durations, config.volume);
  audioCache.set(toneId, uri);
  return uri;
}

async function playWebTone(toneId: SoundToneId): Promise<void> {
  if (toneId === "vibrate_only") return;
  
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

async function playNativeTone(toneId: SoundToneId): Promise<void> {
  if (toneId === "vibrate_only") return;
  
  try {
    const Speech = await import("expo-speech");
    
    const messages: Record<SoundToneId, string> = {
      vibrate_only: "",
      chime: "Timer done!",
      bell: "Ding ding! Time is up!",
      xylophone: "Time is up!",
      whistle: "Whee! Timer finished!",
      celebration: "Yay! Great job!",
      gentle: "Your timer is complete.",
      playful: "Woohoo! All done!",
      magic: "Poof! Timer complete!",
      drumroll: "And... time!",
      fanfare: "Ta-da! Well done!",
    };
    
    const message = messages[toneId] || "Timer complete!";
    Speech.speak(message, {
      language: "en-US",
      pitch: 1.1,
      rate: 0.9,
    });
  } catch (error) {
    console.log("Native audio playback failed:", error);
  }
}

async function playNativeHapticFeedback(toneId: SoundToneId, hapticsEnabled: boolean): Promise<void> {
  if (Platform.OS === "web" || !hapticsEnabled) return;
  
  const config = TONE_CONFIGS[toneId];
  const hapticStyle = config.hapticStyle === "light" 
    ? Haptics.ImpactFeedbackStyle.Light 
    : config.hapticStyle === "heavy" 
      ? Haptics.ImpactFeedbackStyle.Heavy 
      : Haptics.ImpactFeedbackStyle.Medium;
  
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    for (let i = 0; i < config.hapticCount; i++) {
      await new Promise(resolve => setTimeout(resolve, 100));
      await Haptics.impactAsync(hapticStyle);
    }
  } catch (error) {
    console.log("Haptic feedback not available");
  }
}

export interface PlaySoundOptions {
  hapticsEnabled?: boolean;
}

export async function playCompletionSound(toneId: SoundToneId, options: PlaySoundOptions = {}): Promise<void> {
  const { hapticsEnabled = true } = options;
  
  try {
    if (toneId === "vibrate_only") {
      if (hapticsEnabled) {
        await playNativeHapticFeedback(toneId, true);
      }
      return;
    }
    
    if (Platform.OS === "web") {
      await playWebTone(toneId);
    } else {
      await playNativeTone(toneId);
      if (hapticsEnabled) {
        await playNativeHapticFeedback(toneId, hapticsEnabled);
      }
    }
  } catch (error) {
    console.log("Failed to play sound:", error);
  }
}

export async function previewSound(toneId: SoundToneId, hapticsEnabled: boolean = true): Promise<void> {
  if (toneId === "vibrate_only") {
    if (hapticsEnabled && Platform.OS !== "web") {
      try {
        for (let i = 0; i < 3; i++) {
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          await new Promise(resolve => setTimeout(resolve, 80));
        }
      } catch {
        console.log("Haptic preview not available");
      }
    }
    return;
  }
  
  if (Platform.OS === "web") {
    await playWebTone(toneId);
  } else {
    await playNativeTone(toneId);
    if (hapticsEnabled) {
      try {
        const config = TONE_CONFIGS[toneId];
        const hapticStyle = config.hapticStyle === "light" 
          ? Haptics.ImpactFeedbackStyle.Light 
          : config.hapticStyle === "heavy" 
            ? Haptics.ImpactFeedbackStyle.Heavy 
            : Haptics.ImpactFeedbackStyle.Medium;
        
        for (let i = 0; i < Math.min(config.hapticCount, 3); i++) {
          await Haptics.impactAsync(hapticStyle);
          await new Promise(resolve => setTimeout(resolve, 80));
        }
      } catch {
        console.log("Haptic preview not available");
      }
    }
  }
}
