import React from 'react';
import { Sparkles, Mic, FileAudio, Info, HelpCircle } from 'lucide-react';

interface HeaderProps {
  onShowInfoModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onShowInfoModal }) => {
  return (
    <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
            <Mic className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-base sm:text-lg tracking-tight text-white flex items-center gap-2">
                <span>AI Voice Studio</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-indigo-300 border border-indigo-500/30">
                  แปลงข้อความเป็นเสียง
                </span>
              </h1>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              สังเคราะห์เสียง AI ภาษาไทยและนานาชาติ เลือกสไตล์เสียง ฟังตัวอย่าง และบันทึกเป็น MP3 ได้ทันที
            </p>
          </div>
        </div>

        {/* Feature Badges & Info */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden md:flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg text-xs text-slate-300">
            <FileAudio className="w-3.5 h-3.5 text-emerald-400" />
            <span>MP3 High Quality 192kbps</span>
          </div>

          <div className="hidden lg:flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg text-xs text-slate-300">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Gemini 3.8 Neural Speech</span>
          </div>

          <button
            onClick={onShowInfoModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium border border-slate-700 transition cursor-pointer"
            title="วิธีใช้งานและคำแนะนำ"
          >
            <HelpCircle className="w-4 h-4 text-indigo-400" />
            <span className="hidden sm:inline">วิธีใช้งาน</span>
          </button>
        </div>
      </div>
    </header>
  );
};
