import React, { useState, useRef, useEffect } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Download,
  Volume2,
  VolumeX,
  FastForward,
  Rewind,
  Copy,
  Check,
  Music,
  Share2,
} from 'lucide-react';
import { GeneratedSpeech } from '../types';
import { downloadMp3FromBase64, downloadWavFromBase64, formatTime, formatFileSize } from '../utils/audio';
import { AudioVisualizer } from './AudioVisualizer';

interface AudioPlayerProps {
  speech: GeneratedSpeech | null;
  onReplayRequest?: () => void;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({ speech }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  // When speech changes, construct audio object url
  useEffect(() => {
    if (!speech) {
      setAudioUrl(null);
      setIsPlaying(false);
      setCurrentTime(0);
      setDuration(0);
      return;
    }

    // Prefer MP3 for browser playback, fallback to WAV
    const base64Data = speech.mp3Base64 || speech.wavBase64;
    const mime = speech.mp3Base64 ? 'audio/mp3' : 'audio/wav';

    try {
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: mime });
      const url = URL.createObjectURL(blob);

      setAudioUrl(url);
      setCurrentTime(0);
      setDuration(speech.duration || 0);

      // Auto play when freshly generated
      setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.play().then(() => {
            setIsPlaying(true);
          }).catch(() => {
            // Browser autoplay restrictions may need user interaction
            setIsPlaying(false);
          });
        }
      }, 100);

      return () => {
        URL.revokeObjectURL(url);
      };
    } catch (e) {
      console.error('Error creating audio blob url:', e);
    }
  }, [speech]);

  const togglePlay = () => {
    if (!audioRef.current || !audioUrl) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      if (!duration && audioRef.current.duration) {
        setDuration(audioRef.current.duration);
      }
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const handleSkip = (seconds: number) => {
    if (audioRef.current) {
      const newTime = Math.max(0, Math.min(audioRef.current.currentTime + seconds, duration));
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleRateChange = (rate: number) => {
    setPlaybackRate(rate);
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    setVolume(vol);
    setIsMuted(vol === 0);
    if (audioRef.current) {
      audioRef.current.volume = vol;
      audioRef.current.muted = vol === 0;
    }
  };

  const handleCopyText = () => {
    if (speech?.text) {
      navigator.clipboard.writeText(speech.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadMp3 = () => {
    if (speech?.mp3Base64) {
      downloadMp3FromBase64(speech.mp3Base64, `speech-${speech.voice.toLowerCase()}`);
    }
  };

  const handleDownloadWav = () => {
    if (speech?.wavBase64) {
      downloadWavFromBase64(speech.wavBase64, `speech-${speech.voice.toLowerCase()}`);
    }
  };

  if (!speech) {
    return (
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-8 text-center flex flex-col items-center justify-center min-h-[220px]">
        <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4">
          <Music className="w-8 h-8 animate-pulse" />
        </div>
        <h3 className="text-lg font-semibold text-slate-200 mb-1">พร้อมสร้างเสียงพูดคุณภาพสูง</h3>
        <p className="text-sm text-slate-400 max-w-md">
          พิมพ์หรือเลือกข้อความทางด้านซ้าย เลือกสไตล์เสียง แล้วกดปุ่ม &ldquo;แปลงเป็นเสียงพูด&rdquo; เพื่อฟังเสียงและดาวน์โหลดเป็นไฟล์ MP3
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-indigo-500/30 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Audio Element */}
      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleEnded}
          onLoadedMetadata={() => {
            if (audioRef.current) {
              setDuration(audioRef.current.duration || speech.duration);
              audioRef.current.playbackRate = playbackRate;
            }
          }}
        />
      )}

      {/* Header Info */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              เสียง: {speech.voiceName || speech.voice}
            </span>
            {speech.styleName && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-500/20 text-purple-300 border border-purple-500/30">
                สไตล์: {speech.styleName}
              </span>
            )}
            <span className="text-xs text-slate-400">
              ความยาว: {speech.duration} วิ ({speech.sampleRate ? `${speech.sampleRate / 1000}kHz` : '24kHz'})
            </span>
          </div>
        </div>

        <button
          onClick={handleCopyText}
          className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 rounded-lg transition-all border border-slate-700/60"
          title="คัดลอกข้อความ"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? 'คัดลอกแล้ว' : 'คัดลอกข้อความ'}
        </button>
      </div>

      {/* Waveform Visualizer */}
      <AudioVisualizer isPlaying={isPlaying} audioElement={audioRef.current} />

      {/* Scrubber Progress Bar */}
      <div className="mt-4 mb-3">
        <input
          type="range"
          min={0}
          max={duration || 1}
          step={0.05}
          value={currentTime}
          onChange={handleSeek}
          className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 hover:accent-indigo-400 transition"
        />
        <div className="flex justify-between text-xs text-slate-400 mt-1 font-mono">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Playback Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 py-2">
        {/* Play/Pause & Skip */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleSkip(-5)}
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-full transition"
            title="ย้อนหลัง 5 วินาที"
          >
            <Rewind className="w-4 h-4" />
          </button>

          <button
            onClick={togglePlay}
            className="w-13 h-13 rounded-full bg-gradient-to-r from-indigo-500 to-sky-500 hover:from-indigo-400 hover:to-sky-400 text-white flex items-center justify-center shadow-lg shadow-indigo-500/25 transition-transform active:scale-95"
            title={isPlaying ? 'หยุดชั่วคราว' : 'เล่นเสียง'}
          >
            {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
          </button>

          <button
            onClick={() => handleSkip(5)}
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-full transition"
            title="ข้ามไปข้างหน้า 5 วินาที"
          >
            <FastForward className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              if (audioRef.current) {
                audioRef.current.currentTime = 0;
                audioRef.current.play();
                setIsPlaying(true);
              }
            }}
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-full transition"
            title="เล่นใหม่ตั้งแต่ต้น"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Speed Selector */}
        <div className="flex items-center gap-1 bg-slate-950/70 p-1 rounded-xl border border-slate-800 text-xs">
          {[0.75, 1, 1.25, 1.5].map((rate) => (
            <button
              key={rate}
              onClick={() => handleRateChange(rate)}
              className={`px-2 py-1 rounded-lg font-medium transition ${
                playbackRate === rate
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {rate}x
            </button>
          ))}
        </div>

        {/* Volume */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleMute}
            className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg transition"
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="w-4 h-4 text-red-400" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            className="w-16 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
          />
        </div>
      </div>

      {/* PRIMARY DOWNLOAD ACTIONS (Focus on MP3 download as requested) */}
      <div className="mt-5 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">บันทึกเป็นไฟล์เสียง:</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Primary MP3 Download button */}
          <button
            onClick={handleDownloadMp3}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-medium text-sm shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all active:scale-95 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>ดาวน์โหลดเป็น MP3</span>
            {speech.mp3Size > 0 && (
              <span className="text-xs px-1.5 py-0.5 rounded bg-black/20 font-mono">
                {formatFileSize(speech.mp3Size)}
              </span>
            )}
          </button>

          {/* Optional WAV Download button */}
          {speech.wavBase64 && (
            <button
              onClick={handleDownloadWav}
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-medium border border-slate-700 transition active:scale-95 cursor-pointer"
              title="ดาวน์โหลดไฟล์ WAV ความละเอียดสูง"
            >
              <Download className="w-3.5 h-3.5 text-slate-400" />
              <span>ดาวน์โหลด WAV</span>
              {speech.wavSize > 0 && (
                <span className="text-[10px] text-slate-400 font-mono">
                  ({formatFileSize(speech.wavSize)})
                </span>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
