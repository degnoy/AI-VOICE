import React from 'react';
import { History, Play, Download, Trash2, Clock, Volume2, FileAudio } from 'lucide-react';
import { GeneratedSpeech } from '../types';
import { downloadMp3FromBase64, formatFileSize, formatTime } from '../utils/audio';

interface HistoryListProps {
  history: GeneratedSpeech[];
  onSelectSpeech: (speech: GeneratedSpeech) => void;
  onClearHistory: () => void;
  onDeleteHistoryItem: (id: string) => void;
  activeSpeechId?: string;
}

export const HistoryList: React.FC<HistoryListProps> = ({
  history,
  onSelectSpeech,
  onClearHistory,
  onDeleteHistoryItem,
  activeSpeechId,
}) => {
  if (history.length === 0) {
    return null;
  }

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 shadow-lg">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-indigo-400" />
          <h3 className="text-sm font-semibold text-slate-200">
            ประวัติการสร้างเสียง ({history.length})
          </h3>
        </div>
        <button
          onClick={onClearHistory}
          className="text-xs text-slate-400 hover:text-red-400 flex items-center gap-1 transition"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>ล้างประวัติ</span>
        </button>
      </div>

      <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
        {history.map((item) => {
          const isActive = item.id === activeSpeechId;
          return (
            <div
              key={item.id}
              className={`p-3 rounded-xl border transition-all ${
                isActive
                  ? 'bg-slate-800/90 border-indigo-500/80 shadow-md'
                  : 'bg-slate-950/50 hover:bg-slate-800/40 border-slate-800/80'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    {item.voiceName || item.voice}
                  </span>
                  {item.styleName && (
                    <span className="text-[11px] px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300">
                      {item.styleName}
                    </span>
                  )}
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {item.duration}s
                  </span>
                  {item.mp3Size > 0 && (
                    <span className="text-[10px] text-slate-400 font-mono">
                      MP3: {formatFileSize(item.mp3Size)}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onSelectSpeech(item)}
                    className="p-1.5 rounded-lg bg-indigo-600/80 hover:bg-indigo-600 text-white transition cursor-pointer"
                    title="เปิดฟังเสียงนี้"
                  >
                    <Play className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() =>
                      downloadMp3FromBase64(item.mp3Base64, `speech-${item.voice.toLowerCase()}`)
                    }
                    className="p-1.5 rounded-lg bg-emerald-600/80 hover:bg-emerald-600 text-white transition cursor-pointer"
                    title="ดาวน์โหลด MP3"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDeleteHistoryItem(item.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition"
                    title="ลบรายการนี้"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                {item.text}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
