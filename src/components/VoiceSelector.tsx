import React, { useState } from 'react';
import { User, Volume2, Sparkles, Check } from 'lucide-react';
import { VoiceOption } from '../types';

interface VoiceSelectorProps {
  voices: VoiceOption[];
  selectedVoiceId: string;
  onSelectVoice: (voiceId: string) => void;
  onPreviewSample?: (voice: VoiceOption) => void;
}

export const VoiceSelector: React.FC<VoiceSelectorProps> = ({
  voices,
  selectedVoiceId,
  onSelectVoice,
}) => {
  const [filterGender, setFilterGender] = useState<'all' | 'female' | 'male'>('all');

  const filteredVoices = voices.filter((v) => {
    if (filterGender === 'all') return true;
    return v.gender === filterGender;
  });

  return (
    <div className="space-y-3">
      {/* Header and Filter */}
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-slate-200 flex items-center gap-2">
          <User className="w-4 h-4 text-indigo-400" />
          <span>1. เลือกผู้พูด (Voice Persona)</span>
        </label>

        {/* Gender Filter Tabs */}
        <div className="flex items-center gap-1 bg-slate-900/80 p-0.5 rounded-lg border border-slate-800 text-xs">
          <button
            type="button"
            onClick={() => setFilterGender('all')}
            className={`px-2.5 py-1 rounded-md transition ${
              filterGender === 'all'
                ? 'bg-indigo-600 text-white font-medium shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            ทั้งหมด
          </button>
          <button
            type="button"
            onClick={() => setFilterGender('female')}
            className={`px-2.5 py-1 rounded-md transition ${
              filterGender === 'female'
                ? 'bg-indigo-600 text-white font-medium shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            เสียงหญิง
          </button>
          <button
            type="button"
            onClick={() => setFilterGender('male')}
            className={`px-2.5 py-1 rounded-md transition ${
              filterGender === 'male'
                ? 'bg-indigo-600 text-white font-medium shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            เสียงชาย
          </button>
        </div>
      </div>

      {/* Grid of Voices */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
        {filteredVoices.map((voice) => {
          const isSelected = voice.id === selectedVoiceId;
          return (
            <button
              key={voice.id}
              type="button"
              onClick={() => onSelectVoice(voice.id)}
              className={`text-left p-3 rounded-xl border transition-all relative overflow-hidden group cursor-pointer ${
                isSelected
                  ? 'bg-slate-800/95 border-indigo-500 shadow-md shadow-indigo-500/10 ring-1 ring-indigo-500'
                  : 'bg-slate-900/60 hover:bg-slate-800/60 border-slate-800/90 hover:border-slate-700'
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Voice Avatar Icon */}
                <div
                  className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${voice.avatarColor} flex items-center justify-center text-white font-bold text-sm shadow-md shrink-0`}
                >
                  {voice.name.charAt(0)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <span className="font-semibold text-sm text-slate-100 truncate">
                      {voice.name}
                    </span>
                    {isSelected && (
                      <span className="w-5 h-5 rounded-full bg-indigo-500 text-white flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-indigo-300 font-medium mb-1 truncate">
                    {voice.tone}
                  </p>

                  <p className="text-[11px] text-slate-400 line-clamp-1">
                    {voice.recommendFor}
                  </p>
                </div>
              </div>

              {/* Badge */}
              {voice.badge && (
                <div className="mt-2 pt-1.5 border-t border-slate-800/60 flex items-center justify-between">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-950/70 text-slate-300 border border-slate-800">
                    {voice.badge}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {voice.category}
                  </span>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
