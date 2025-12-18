import { Platform } from "react-native";
import * as Haptics from "expo-haptics";
import { Audio } from "expo-av";
import { SoundToneId } from "./types";

const LOOP_DURATION_MS = 2 * 60 * 1000;

let activeSound: Audio.Sound | null = null;
let activeLoopTimeout: ReturnType<typeof setTimeout> | null = null;
let webOscillators: OscillatorNode[] = [];
let webLoopInterval: ReturnType<typeof setInterval> | null = null;

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

function generateWavBase64(toneId: SoundToneId): string {
  const config = TONE_CONFIGS[toneId];
  if (!config || config.frequencies.length === 0) return "";
  
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
        case "sawtooth":
          wave = ((phase % (2 * Math.PI)) / Math.PI - 1) * 0.3;
          break;
        default:
          wave = Math.sin(phase) * 0.5;
      }
      
      samples[sampleIndex++] = Math.floor(wave * envelope * 32767 * config.volume);
    }
  }
  
  const dataSize = numSamples * 2;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);
  
  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };
  
  writeString(0, "RIFF");
  view.setUint32(4, 36 + dataSize, true);
  writeString(8, "WAVE");
  writeString(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(36, "data");
  view.setUint32(40, dataSize, true);
  
  for (let i = 0; i < numSamples; i++) {
    view.setInt16(44 + i * 2, samples[i], true);
  }
  
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

const wavCache = new Map<SoundToneId, string>();

function getWavDataUri(toneId: SoundToneId): string | null {
  if (toneId === "vibrate_only") return null;
  
  if (wavCache.has(toneId)) {
    return wavCache.get(toneId)!;
  }
  
  const base64 = generateWavBase64(toneId);
  if (!base64) return null;
  
  const dataUri = `data:audio/wav;base64,${base64}`;
  wavCache.set(toneId, dataUri);
  return dataUri;
}

function getToneDuration(toneId: SoundToneId): number {
  const config = TONE_CONFIGS[toneId];
  if (!config) return 1000;
  return config.durations.reduce((a, b) => a + b, 0) * 1000;
}

async function playWebToneOnce(toneId: SoundToneId): Promise<void> {
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
    
    webOscillators.push(osc);

    startTime += config.durations[i] * 0.8;
  }
}

async function playWebToneLooping(toneId: SoundToneId): Promise<void> {
  if (toneId === "vibrate_only") return;
  
  stopCompletionSound();
  
  const toneDuration = getToneDuration(toneId);
  const pauseBetween = 1500;
  const interval = toneDuration + pauseBetween;
  
  await playWebToneOnce(toneId);
  
  webLoopInterval = setInterval(() => {
    playWebToneOnce(toneId);
  }, interval);
  
  activeLoopTimeout = setTimeout(() => {
    stopCompletionSound();
  }, LOOP_DURATION_MS);
}

async function playNativeToneOnce(toneId: SoundToneId): Promise<Audio.Sound | null> {
  if (toneId === "vibrate_only") return null;
  
  try {
    const dataUri = getWavDataUri(toneId);
    if (!dataUri) {
      console.log("Could not generate audio for tone:", toneId);
      return null;
    }
    
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
      shouldDuckAndroid: true,
    });
    
    const { sound } = await Audio.Sound.createAsync(
      { uri: dataUri },
      { shouldPlay: true, volume: 1.0, isLooping: false }
    );
    
    return sound;
  } catch (error) {
    console.log("Native audio playback failed:", error);
    return null;
  }
}

async function playNativeToneLooping(toneId: SoundToneId): Promise<void> {
  if (toneId === "vibrate_only") return;
  
  stopCompletionSound();
  
  const toneDuration = getToneDuration(toneId);
  const pauseBetween = 1500;
  
  const playOnce = async () => {
    if (activeSound) {
      try {
        await activeSound.unloadAsync();
      } catch {}
    }
    
    const sound = await playNativeToneOnce(toneId);
    if (sound) {
      activeSound = sound;
      
      sound.setOnPlaybackStatusUpdate((status: { isLoaded: boolean; didJustFinish?: boolean }) => {
        if (status.isLoaded && status.didJustFinish && activeLoopTimeout) {
          setTimeout(() => {
            if (activeLoopTimeout) {
              playOnce();
            }
          }, pauseBetween);
        }
      });
    }
  };
  
  await playOnce();
  
  activeLoopTimeout = setTimeout(() => {
    stopCompletionSound();
  }, LOOP_DURATION_MS);
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

export function stopCompletionSound(): void {
  if (activeLoopTimeout) {
    clearTimeout(activeLoopTimeout);
    activeLoopTimeout = null;
  }
  
  if (webLoopInterval) {
    clearInterval(webLoopInterval);
    webLoopInterval = null;
  }
  
  for (const osc of webOscillators) {
    try {
      osc.stop();
      osc.disconnect();
    } catch {}
  }
  webOscillators = [];
  
  if (activeSound) {
    try {
      activeSound.stopAsync();
      activeSound.unloadAsync();
    } catch {}
    activeSound = null;
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
      await playWebToneLooping(toneId);
    } else {
      await playNativeToneLooping(toneId);
      if (hapticsEnabled) {
        await playNativeHapticFeedback(toneId, hapticsEnabled);
      }
    }
  } catch (error) {
    console.log("Failed to play sound:", error);
  }
}

export async function previewSound(toneId: SoundToneId, hapticsEnabled: boolean = true): Promise<void> {
  stopCompletionSound();
  
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
    await playWebToneOnce(toneId);
  } else {
    const sound = await playNativeToneOnce(toneId);
    if (sound) {
      sound.setOnPlaybackStatusUpdate((status: { isLoaded: boolean; didJustFinish?: boolean }) => {
        if (status.isLoaded && status.didJustFinish) {
          sound.unloadAsync();
        }
      });
    }
    
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

export async function preloadSounds(): Promise<void> {
  const toneIds: SoundToneId[] = [
    "chime", "bell", "xylophone", "whistle", "celebration",
    "gentle", "playful", "magic", "drumroll", "fanfare"
  ];
  
  for (const toneId of toneIds) {
    getWavDataUri(toneId);
  }
}
