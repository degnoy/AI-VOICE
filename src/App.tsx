/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  Sparkles,
  Volume2,
  Download,
  RotateCcw,
  Sliders,
  FileAudio,
  Trash2,
  Copy,
  Check,
  AlertCircle,
  Loader2,
  ChevronRight,
  BookOpen,
  Radio,
  Heart,
  Film,
  Zap,
} from 'lucide-react';
import { Header } from './components/Header';
import { VoiceSelector } from './components/VoiceSelector';
import { StyleSelector } from './components/StyleSelector';
import { AudioPlayer } from './components/AudioPlayer';
import { HistoryList } from './components/HistoryList';
import { InfoModal } from './components/InfoModal';
import { AVAILABLE_VOICES, STYLE_PRESETS, SAMPLE_TEXTS } from './data/samples';
import { GeneratedSpeech, SampleText } from './types';

const STORAGE_KEY = 'ai_tts_speech_history_v1';

export default function App() {
  // Input State
  const [text, setText] = useState<string>(
    'ยินดีต้อนรับสู่ระบบแปลงข้อความเป็นเสียง AI คุณสามารถพิมพ์ข้อความภาษาไทยหรือภาษาอังกฤษ เลือกผู้พูดและสไตล์เสียงที่ต้องการ แล้วฟังเสียงอ่านสดพร้อมดาวน์โหลดเป็นไฟล์ MP3 ได้ทันทีค่ะ'
  );

  // Settings State
  const [selectedVoiceId, setSelectedVoiceId] = useState<string>('Kore');
  const [selectedStyleId, setSelectedStyleId] = useState<string>('podcast');
  const [customStylePrompt, setCustomStylePrompt] = useState<string>(
    'Friendly, engaging, conversational podcast host speaking naturally as if talking to a close friend'
  );
  const [selectedModel, setSelectedModel] = useState<string>('gemini-3.8-flash-lite-tts');

  // Generation & Audio State
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationStep, setGenerationStep] = useState<string>('');
  const [currentSpeech, setCurrentSpeech] = useState<GeneratedSpeech | null>(null);
  const [history, setHistory] = useState<GeneratedSpeech[]>([]);
  const [error, setError] = useState<string | null>(null);

  // UI Modals & Helpers
  const [showInfoModal, setShowInfoModal] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  // Load history from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setHistory(parsed.slice(0, 15));
          if (parsed.length > 0 && !currentSpeech) {
            setCurrentSpeech(parsed[0]);
          }
        }
      }
    } catch (e) {
      console.error('Failed to load history from localStorage', e);
    }
  }, []);

  // Save history to localStorage
  const saveToHistory = (newSpeech: GeneratedSpeech) => {
    setHistory((prev) => {
      const updated = [newSpeech, ...prev.filter((i) => i.id !== newSpeech.id)].slice(0, 15);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (err) {
        console.warn('LocalStorage quota reached, trimmed history', err);
      }
      return updated;
    });
  };

  // Handle Style Selection
  const handleSelectStyle = (styleId: string, defaultPrompt?: string) => {
    setSelectedStyleId(styleId);
    if (defaultPrompt) {
      setCustomStylePrompt(defaultPrompt);
    } else if (styleId === 'custom') {
      if (!customStylePrompt) {
        setCustomStylePrompt('Warm, natural and emotionally expressive voice');
      }
    }
  };

  // Handle Sample Selection
  const handleLoadSample = (sample: SampleText) => {
    setText(sample.text);
    if (sample.recommendedVoice) {
      setSelectedVoiceId(sample.recommendedVoice);
    }
    if (sample.recommendedStyle) {
      const styleObj = STYLE_PRESETS.find((s) => s.id === sample.recommendedStyle);
      if (styleObj) {
        setSelectedStyleId(styleObj.id);
        setCustomStylePrompt(styleObj.prompt);
      }
    }
    setError(null);
  };

  // Main Speech Generation Trigger
  const handleGenerateSpeech = async () => {
    if (!text.trim()) {
      setError('กรุณาพิมพ์หรือวางข้อความที่ต้องการแปลงเป็นเสียง');
      return;
    }

    setError(null);
    setIsGenerating(true);
    setGenerationStep('กำลังสังเคราะห์เสียงด้วยโมเดล Gemini Neural Voice...');

    try {
      const selectedVoice = AVAILABLE_VOICES.find((v) => v.id === selectedVoiceId);
      const selectedStyle = STYLE_PRESETS.find((s) => s.id === selectedStyleId);

      const response = await fetch('/api/tts/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text.trim(),
          voice: selectedVoiceId,
          stylePrompt: customStylePrompt,
          model: selectedModel,
        }),
      });

      setGenerationStep('กำลังประมวลผลและแปลงไฟล์เป็น MP3 คุณภาพสูง (192kbps)...');

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'เกิดข้อผิดพลาดในการสร้างเสียงพูด');
      }

      const newSpeech: GeneratedSpeech = {
        id: `speech-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        text: data.text,
        voice: data.voice,
        voiceName: selectedVoice?.name || data.voice,
        style: selectedStyleId,
        styleName: selectedStyle?.name || 'กำหนดเอง',
        model: data.model,
        duration: data.duration,
        sampleRate: data.sampleRate,
        mp3Base64: data.mp3Base64,
        wavBase64: data.wavBase64,
        mp3Size: data.mp3Size,
        wavSize: data.wavSize,
        createdAt: data.timestamp || new Date().toISOString(),
      };

      setCurrentSpeech(newSpeech);
      saveToHistory(newSpeech);
    } catch (err: any) {
      console.error('Error generating speech:', err);
      setError(err?.message || 'ไม่สามารถสร้างเสียงพูดได้ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsGenerating(false);
      setGenerationStep('');
    }
  };

  const handleClearHistory = () => {
    if (confirm('คุณต้องการลบประวัติการสร้างเสียงทั้งหมดใช่หรือไม่?')) {
      setHistory([]);
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleDeleteHistoryItem = (id: string) => {
    setHistory((prev) => {
      const filtered = prev.filter((item) => item.id !== id);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
      } catch (e) {
        console.error(e);
      }
      return filtered;
    });
    if (currentSpeech?.id === id) {
      setCurrentSpeech(null);
    }
  };

  // Insert Pause Helper
  const handleInsertPause = () => {
    setText((prev) => prev + ' ... ');
  };

  // Estimated reading duration: approx 150 words per minute for Thai/English
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const charCount = text.length;
  const estimatedSeconds = Math.max(1, Math.round((charCount / 18) * 10) / 10);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-['Sarabun',sans-serif]">
      {/* Top Header */}
      <Header onShowInfoModal={() => setShowInfoModal(true)} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 flex items-start justify-between gap-3 animate-fade-in shadow-lg">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-sm">การแจ้งเตือน</h4>
                <p className="text-xs text-red-300 mt-0.5">{error}</p>
              </div>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-xs text-red-400 hover:text-white px-2 py-1 rounded bg-red-900/40 hover:bg-red-800/40 transition"
            >
              ปิด
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Input, Controls & Config (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Text Input Section */}
            <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                  <label className="text-sm font-semibold text-slate-100">
                    พิมพ์ข้อความที่ต้องการให้อ่าน
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleInsertPause}
                    className="text-xs text-indigo-400 hover:text-indigo-300 px-2 py-1 rounded bg-indigo-950/50 hover:bg-indigo-900/50 border border-indigo-800/50 transition cursor-pointer"
                    title="แทรกจุดหยุดเว้นวรรคให้เสียงอ่านดูเป็นธรรมชาติ"
                  >
                    + เว้นจังหวะพัก
                  </button>
                  <button
                    type="button"
                    onClick={() => setText('')}
                    className="text-xs text-slate-400 hover:text-red-400 px-2 py-1 rounded hover:bg-slate-800 transition cursor-pointer"
                  >
                    ล้างข้อความ
                  </button>
                </div>
              </div>

              {/* Textarea */}
              <div className="relative">
                <textarea
                  rows={6}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="พิมพ์หรือวางข้อความภาษาไทย หรือภาษาอังกฤษที่นี่... (เช่น ข่าวสาร, นิทาน, รีวิวสินค้า, หรือบทเรียน)"
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl p-4 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition resize-y leading-relaxed"
                />
              </div>

              {/* Text Counters & Stats */}
              <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 mt-2.5 pt-2 border-t border-slate-800/60">
                <div className="flex items-center gap-4">
                  <span>ตัวอักษร: <strong className="text-slate-200">{charCount}</strong></span>
                  <span>คำ: <strong className="text-slate-200">{wordCount}</strong></span>
                  <span>ความยาวโดยประมาณ: <strong className="text-indigo-300">~{estimatedSeconds} วินาที</strong></span>
                </div>
              </div>

              {/* Quick Sample Prompts */}
              <div className="mt-4 pt-3 border-t border-slate-800/60">
                <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-2">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>ตัวอย่างข้อความทดสอบ (คลิกเพื่อโหลด):</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {SAMPLE_TEXTS.map((sample) => (
                    <button
                      key={sample.id}
                      type="button"
                      onClick={() => handleLoadSample(sample)}
                      className="px-2.5 py-1 rounded-lg text-xs bg-slate-800/80 hover:bg-indigo-900/40 hover:border-indigo-700 text-slate-300 hover:text-white border border-slate-700/60 transition cursor-pointer"
                    >
                      {sample.title}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Step 1: Voice Persona Selection */}
            <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-sm">
              <VoiceSelector
                voices={AVAILABLE_VOICES}
                selectedVoiceId={selectedVoiceId}
                onSelectVoice={setSelectedVoiceId}
              />
            </div>

            {/* Step 2: Voice Style & Emotion Selection */}
            <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-sm">
              <StyleSelector
                styles={STYLE_PRESETS}
                selectedStyleId={selectedStyleId}
                customStylePrompt={customStylePrompt}
                onSelectStyle={handleSelectStyle}
                onChangeCustomPrompt={setCustomStylePrompt}
              />
            </div>

            {/* AI Model Preference Selection */}
            <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400 shrink-0" />
                <div>
                  <span className="font-semibold text-slate-200 block">โมเดล AI เสียงพูด</span>
                  <span className="text-slate-400">เลือกรุ่นประมวลผลเสียงตามความต้องการ</span>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedModel('gemini-3.8-flash-lite-tts')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                    selectedModel === 'gemini-3.8-flash-lite-tts'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Flash-Lite TTS (เร็วมาก)
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedModel('gemini-3.8-flash-tts')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                    selectedModel === 'gemini-3.8-flash-tts'
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Flash TTS (พรีเมียม ดราม่า)
                </button>
              </div>
            </div>

            {/* Generate Action Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleGenerateSpeech}
                disabled={isGenerating || !text.trim()}
                className={`w-full py-4 px-6 rounded-2xl font-bold text-base shadow-xl flex items-center justify-center gap-3 transition-all cursor-pointer ${
                  isGenerating || !text.trim()
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                    : 'bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 hover:from-indigo-400 hover:via-purple-500 hover:to-pink-400 text-white shadow-indigo-500/25 hover:shadow-indigo-500/40 active:scale-[0.99]'
                }`}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>{generationStep || 'กำลังสร้างเสียงพูด AI...'}</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-5 h-5" />
                    <span>แปลงเป็นเสียงพูด &amp; สร้างไฟล์ MP3</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right Column: Audio Output, Player, MP3 Download & History (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Live Audio Player Card */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <FileAudio className="w-4 h-4 text-emerald-400" />
                  <span>เสียงที่สร้างได้ (Audio Output &amp; MP3)</span>
                </h2>
                {currentSpeech && (
                  <span className="text-xs text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2 py-0.5 rounded-full font-medium">
                    พร้อมดาวน์โหลด MP3
                  </span>
                )}
              </div>

              <AudioPlayer speech={currentSpeech} />
            </div>

            {/* Speech History List */}
            <HistoryList
              history={history}
              onSelectSpeech={(speech) => setCurrentSpeech(speech)}
              onClearHistory={handleClearHistory}
              onDeleteHistoryItem={handleDeleteHistoryItem}
              activeSpeechId={currentSpeech?.id}
            />

            {/* Quick Feature Highlights Card */}
            <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 text-xs text-slate-300 space-y-3">
              <h4 className="font-semibold text-slate-100 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>จุดเด่นของระบบ AI Voice Studio</span>
              </h4>
              <ul className="space-y-2 text-slate-400">
                <li className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>บันทึกเป็น MP3 โดยตรง:</strong> เข้ารหัส MP3 192kbps ในตัว ดาวน์โหลดได้ทันที สะดวกสำหรับใส่คลิปตัดต่อ</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>หลากหลายอารมณ์:</strong> ปรับสไตล์เป็นข่าวสาร, นิทาน, พอดแคสต์, โฆษณา หรือสมาธิได้สมจริง</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span><strong>รองรับเสียงอ่านภาษาไทย &amp; สากล:</strong> ออกเสียงภาษาไทยอย่างชัดเจน พร้อมปรับวรรณยุกต์และคำทับศัพท์</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      {/* Info & Tips Modal */}
      <InfoModal
        isOpen={showInfoModal}
        onClose={() => setShowInfoModal(false)}
      />
    </div>
  );
}
