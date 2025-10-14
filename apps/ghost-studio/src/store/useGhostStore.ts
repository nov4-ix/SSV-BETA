import { create } from 'zustand';

export interface MusicGeneration {
  id: string;
  prompt: string;
  style: string;
  duration: number;
  status: 'generating' | 'completed' | 'failed';
  audioUrl?: string;
  createdAt: string;
}

export interface VoiceClone {
  id: string;
  name: string;
  audioFile?: File;
  status: 'uploading' | 'processing' | 'ready' | 'failed';
  createdAt: string;
}

export interface TextToSpeech {
  id: string;
  text: string;
  voice: string;
  status: 'generating' | 'completed' | 'failed';
  audioUrl?: string;
  createdAt: string;
}

interface GhostState {
  // Music Generation
  musicGenerations: MusicGeneration[];
  currentMusicPrompt: string;
  currentMusicStyle: string;
  
  // Voice Cloning
  voiceClones: VoiceClone[];
  currentVoiceFile: File | null;
  
  // Text to Speech
  textToSpeechGenerations: TextToSpeech[];
  currentText: string;
  currentVoice: string;
  
  // UI State
  activeTab: 'covers' | 'music' | 'voice' | 'tts' | 'daw';
  isGenerating: boolean;
  
  // Actions
  setActiveTab: (tab: 'covers' | 'music' | 'voice' | 'tts' | 'daw') => void;
  setCurrentMusicPrompt: (prompt: string) => void;
  setCurrentMusicStyle: (style: string) => void;
  generateMusic: () => Promise<void>;
  setCurrentVoiceFile: (file: File | null) => void;
  createVoiceClone: (name: string) => Promise<void>;
  setCurrentText: (text: string) => void;
  setCurrentVoice: (voice: string) => void;
  generateTextToSpeech: () => Promise<void>;
  exportToSanctuary: (generationId: string) => void;
  exportToNova: (generationId: string) => void;
}

export const useGhostStore = create<GhostState>((set, get) => ({
  // Initial state
  musicGenerations: [],
  currentMusicPrompt: '',
  currentMusicStyle: 'electronic',
  
  voiceClones: [],
  currentVoiceFile: null,
  
  textToSpeechGenerations: [],
  currentText: '',
  currentVoice: 'default',
  
  activeTab: 'covers',
  isGenerating: false,
  
  // Actions
  setActiveTab: (tab) => set({ activeTab: tab }),
  
  setCurrentMusicPrompt: (prompt) => set({ currentMusicPrompt: prompt }),
  
  setCurrentMusicStyle: (style) => set({ currentMusicStyle: style }),
  
  generateMusic: async () => {
    const { currentMusicPrompt, currentMusicStyle } = get();
    
    if (!currentMusicPrompt.trim()) return;
    
    const generation: MusicGeneration = {
      id: Date.now().toString(),
      prompt: currentMusicPrompt,
      style: currentMusicStyle,
      duration: 30,
      status: 'generating',
      createdAt: new Date().toISOString()
    };
    
    set((state) => ({
      musicGenerations: [generation, ...state.musicGenerations],
      isGenerating: true
    }));
    
    try {
      // Llamada real al backend
      const response = await fetch('https://68ecf6352bc0b35bdc2f1ae5--son1k.netlify.app/api/suno-generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: currentMusicPrompt,
          style: currentMusicStyle,
          title: `Ghost Studio - ${currentMusicStyle}`,
          customMode: false,
          instrumental: false,
          lyrics: '',
          gender: 'mixed'
        }),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success && data.data.songs && data.data.songs.length > 0) {
        const song = data.data.songs[0];
        set((state) => ({
          musicGenerations: state.musicGenerations.map((g) =>
            g.id === generation.id
              ? { 
                  ...g, 
                  status: 'completed', 
                  audioUrl: song.stream_audio_url || song.audio_url,
                  duration: song.duration || 30
                }
              : g
          ),
          isGenerating: false
        }));
      } else {
        throw new Error('No se generaron canciones');
      }
    } catch (error) {
      console.error('Error generating music:', error);
      set((state) => ({
        musicGenerations: state.musicGenerations.map((g) =>
          g.id === generation.id
            ? { ...g, status: 'failed' }
            : g
        ),
        isGenerating: false
      }));
    }
  },
  
  setCurrentVoiceFile: (file) => set({ currentVoiceFile: file }),
  
  createVoiceClone: async (name) => {
    const { currentVoiceFile } = get();
    
    if (!currentVoiceFile) return;
    
    const clone: VoiceClone = {
      id: Date.now().toString(),
      name,
      audioFile: currentVoiceFile,
      status: 'uploading',
      createdAt: new Date().toISOString()
    };
    
    set((state) => ({
      voiceClones: [clone, ...state.voiceClones],
      isGenerating: true
    }));
    
    // Simulate upload and processing
    setTimeout(() => {
      set((state) => ({
        voiceClones: state.voiceClones.map((c) =>
          c.id === clone.id ? { ...c, status: 'processing' } : c
        )
      }));
    }, 1000);
    
    setTimeout(() => {
      set((state) => ({
        voiceClones: state.voiceClones.map((c) =>
          c.id === clone.id ? { ...c, status: 'ready' } : c
        ),
        isGenerating: false
      }));
    }, 5000);
  },
  
  setCurrentText: (text) => set({ currentText: text }),
  
  setCurrentVoice: (voice) => set({ currentVoice: voice }),
  
  generateTextToSpeech: async () => {
    const { currentText, currentVoice } = get();
    
    if (!currentText.trim()) return;
    
    const generation: TextToSpeech = {
      id: Date.now().toString(),
      text: currentText,
      voice: currentVoice,
      status: 'generating',
      createdAt: new Date().toISOString()
    };
    
    set((state) => ({
      textToSpeechGenerations: [generation, ...state.textToSpeechGenerations],
      isGenerating: true
    }));
    
    // Simulate API call
    setTimeout(() => {
      set((state) => ({
        textToSpeechGenerations: state.textToSpeechGenerations.map((g) =>
          g.id === generation.id
            ? { ...g, status: 'completed', audioUrl: '/api/mock-tts.mp3' }
            : g
        ),
        isGenerating: false
      }));
    }, 2000);
  },
  
  exportToSanctuary: (generationId) => {
    console.log(`Exporting generation ${generationId} to Sanctuary Social`);
    // In a real app, this would trigger an API call
  },
  
  exportToNova: (generationId) => {
    console.log(`Exporting generation ${generationId} to Nova Post Pilot`);
    // In a real app, this would trigger an API call
  }
}));