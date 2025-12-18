import { Platform } from "react-native";
import * as Haptics from "expo-haptics";
import * as FileSystem from "expo-file-system";
import { SoundToneId } from "./types";
import { getApiUrl } from "./query-client";

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

const audioFileCache = new Map<SoundToneId, string>();

async function ensureAudioCached(toneId: SoundToneId): Promise<string | null> {
  if (toneId === "vibrate_only") return null;
  
  if (audioFileCache.has(toneId)) {
    const cachedPath = audioFileCache.get(toneId)!;
    const fileInfo = await FileSystem.getInfoAsync(cachedPath);
    if (fileInfo.exists) {
      return cachedPath;
    }
  }
  
  try {
    const cacheDir = FileSystem.cacheDirectory;
    if (!cacheDir) return null;
    
    const localPath = `${cacheDir}timer_sound_${toneId}.wav`;
    const fileInfo = await FileSystem.getInfoAsync(localPath);
    
    if (fileInfo.exists) {
      audioFileCache.set(toneId, localPath);
      return localPath;
    }
    
    const apiUrl = getApiUrl();
    const downloadUrl = `${apiUrl}/api/audio/${toneId}`;
    
    const downloadResult = await FileSystem.downloadAsync(downloadUrl, localPath);
    
    if (downloadResult.status === 200) {
      audioFileCache.set(toneId, localPath);
      return localPath;
    }
    
    return null;
  } catch (error) {
    console.log("Failed to cache audio file:", error);
    return null;
  }
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
    const audioPath = await ensureAudioCached(toneId);
    if (!audioPath) {
      console.log("Audio file not available, using speech fallback");
      await playSpeechFallback(toneId);
      return;
    }
    
    const ExpoAudio = await import("expo-audio");
    const player = ExpoAudio.createAudioPlayer({ uri: audioPath });
    player.play();
    
    setTimeout(() => {
      try {
        player.release();
      } catch {}
    }, 3000);
  } catch (error) {
    console.log("Native audio playback failed, using speech fallback:", error);
    await playSpeechFallback(toneId);
  }
}

async function playSpeechFallback(toneId: SoundToneId): Promise<void> {
  try {
    const Speech = await import("expo-speech");
    
    const messages: Record<SoundToneId, string> = {
      vibrate_only: "",
      chime: "Timer done!",
      bell: "Ding ding! Time is up!",
      xylophone: "Time is up!",
      whistle: "Timer finished!",
      celebration: "Yay! Great job!",
      gentle: "Your timer is complete.",
      playful: "All done!",
      magic: "Timer complete!",
      drumroll: "And... time!",
      fanfare: "Well done!",
    };
    
    const message = messages[toneId] || "Timer complete!";
    Speech.speak(message, {
      language: "en-US",
      pitch: 1.1,
      rate: 0.9,
    });
  } catch (error) {
    console.log("Speech fallback failed:", error);
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

export async function preloadSounds(): Promise<void> {
  if (Platform.OS === "web") return;
  
  const toneIds: SoundToneId[] = [
    "chime", "bell", "xylophone", "whistle", "celebration",
    "gentle", "playful", "magic", "drumroll", "fanfare"
  ];
  
  for (const toneId of toneIds) {
    try {
      await ensureAudioCached(toneId);
    } catch {
    }
  }
}
