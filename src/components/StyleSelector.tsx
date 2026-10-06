import React from 'react';
import {
  Radio,
  BookOpen,
  Sparkles,
  Mic,
  Heart,
  Film,
  GraduationCap,
  Sliders,
  Check,
} from 'lucide-react';
import { StylePreset } from '../types';

interface StyleSelectorProps {
  styles: StylePreset[];
  selectedStyleId: string;
  customStylePrompt: string;
  onSelectStyle: (styleId: string, defaultPrompt?: string) => void;
  onChangeCustomPrompt: (prompt: string) => void;
}

export const StyleSelector: React.FC<StyleSelectorProps> = ({
  styles,
  selectedStyleId,
  customStylePrompt,
  onSelectStyle,
  onChangeCustomPrompt,
}) => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Radio':
        return <Radio className="w-4 h-4 text-sky-400" />;
      case 'BookOpen':
        return <BookOpen className="w-4 h-4 text-amber-400" />;
      case 'Sparkles':
        return <Sparkles className="w-4 h-4 text-yellow-400" />;
      case 'Mic':
        return <Mic className="w-4 h-4 text-purple-400" />;
      case 'Heart':
        return <Heart className="w-4 h-4 text-rose-400" />;
      case 'Film':
        return <Film className="w-4 h-4 text-red-400" />;
      case 'GraduationCap':
        return <GraduationCap className="w-4 h-4 text-emerald-400" />;
      default:
        return <Sparkles className="w-4 h-4 text-indigo-400" />;
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-slate-200 flex items-center gap-2">
          <Sliders className="w-4 h-4 text-purple-400" />
          <span>2. เลือกสไตล์และอารมณ์เสียง (Style & Emotion)</span>
        </label>
        <span className="text-xs text-slate-400">
          คำสั่งสไตล์จะถูกนำไปควบคุมจังหวะและน้ำเสียง AI
        </span>
      </div>

      {/* Preset Style Pills / Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
        {styles.map((style) => {
          const isSelected = selectedStyleId === style.id;
          return (
            <button
              key={style.id}
              type="button"
              onClick={() => onSelectStyle(style.id, style.prompt)}
              className={`p-2.5 rounded-xl border text-left transition-all relative flex flex-col justify-between group cursor-pointer ${
                isSelected
                  ? 'bg-purple-950/40 border-purple-500 shadow-sm shadow-purple-500/20 ring-1 ring-purple-500'
                  : 'bg-slate-900/60 hover:bg-slate-800/60 border-slate-800/80 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="p-1.5 rounded-lg bg-slate-950/60 border border-slate-800">
                  {getIcon(style.icon)}
                </div>
                {isSelected && (
                  <span className="w-4 h-4 rounded-full bg-purple-500 text-white flex items-center justify-center shrink-0">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </span>
                )}
              </div>

              <div>
                <span className="text-xs font-semibold text-slate-200 block truncate">
                  {style.name}
                </span>
                <span className="text-[10px] text-slate-400 block line-clamp-1 mt-0.5">
                  {style.desc}
                </span>
              </div>
            </button>
          );
        })}

        {/* Custom style button */}
        <button
          type="button"
          onClick={() => onSelectStyle('custom')}
          className={`p-2.5 rounded-xl border text-left transition-all relative flex flex-col justify-between group cursor-pointer ${
            selectedStyleId === 'custom'
              ? 'bg-purple-950/40 border-purple-500 shadow-sm shadow-purple-500/20 ring-1 ring-purple-500'
              : 'bg-slate-900/60 hover:bg-slate-800/60 border-slate-800/80 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <div className="p-1.5 rounded-lg bg-slate-950/60 border border-slate-800">
              <Sliders className="w-4 h-4 text-cyan-400" />
            </div>
            {selectedStyleId === 'custom' && (
              <span className="w-4 h-4 rounded-full bg-purple-500 text-white flex items-center justify-center shrink-0">
                <Check className="w-2.5 h-2.5 stroke-[3]" />
              </span>
            )}
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-200 block">
              กำหนดสไตล์เอง
            </span>
            <span className="text-[10px] text-slate-400 block truncate mt-0.5">
              พิมพ์คำสั่งอารมณ์อิสระ
            </span>
          </div>
        </button>
      </div>

      {/* Style Prompt Editor / Fine-tuning */}
      <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-3">
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
            <span>คำสั่งกำกับอารมณ์ (Style Instruction Prompt):</span>
          </label>
          <span className="text-[11px] text-slate-400">
            {selectedStyleId === 'custom' ? 'โหมดกำหนดเอง' : 'ปรับแก้เพิ่มเติมได้'}
          </span>
        </div>
        <input
          type="text"
          value={customStylePrompt}
          onChange={(e) => onChangeCustomPrompt(e.target.value)}
          placeholder="เช่น 'Warm, gentle storyteller' หรือ 'ตื่นเต้น ดีใจมาก พูดเร็วฉะฉาน'"
          className="w-full bg-slate-950/80 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500 transition"
        />
      </div>
    </div>
  );
};
