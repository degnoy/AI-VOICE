export interface VoiceOption {
  id: string;
  name: string;
  gender: 'female' | 'male';
  tone: string;
  category: string;
  recommendFor: string;
  badge?: string;
  avatarColor: string;
}

export interface StylePreset {
  id: string;
  name: string;
  prompt: string;
  icon: string;
  desc: string;
}

export interface GeneratedSpeech {
  id: string;
  text: string;
  voice: string;
  voiceName: string;
  style: string;
  styleName: string;
  model: string;
  duration: number;
  sampleRate: number;
  mp3Base64: string;
  wavBase64: string;
  mp3Size: number;
  wavSize: number;
  createdAt: string;
}

export interface SampleText {
  id: string;
  title: string;
  category: string;
  text: string;
  recommendedVoice: string;
  recommendedStyle: string;
}
