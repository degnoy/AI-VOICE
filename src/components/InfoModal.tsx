import React from 'react';
import { X, CheckCircle2, Sparkles, Download, Volume2, Mic } from 'lucide-react';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InfoModal: React.FC<InfoModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
            <Mic className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">วิธีใช้งานและเทคนิคการสังเคราะห์เสียง</h3>
            <p className="text-xs text-slate-400">สร้างเสียงอ่านธรรมชาติระดับสตูดิโอ</p>
          </div>
        </div>

        <div className="space-y-4 text-xs text-slate-300">
          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
            <h4 className="font-semibold text-slate-100 flex items-center gap-2 mb-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>ขั้นตอนง่ายๆ 3 ขั้น</span>
            </h4>
            <ol className="list-decimal list-inside space-y-1 text-slate-400 ml-1">
              <li>พิมพ์หรือวางข้อความที่ต้องการให้อ่าน (หรือกดเลือกจากตัวอย่าง)</li>
              <li>เลือกผู้พูด (หญิง/ชาย) และสไตล์น้ำเสียงที่ต้องการ</li>
              <li>กดปุ่ม &ldquo;แปลงเป็นเสียงพูด (AI Voice)&rdquo; เพื่อสร้างเสียงและดาวน์โหลดเป็น MP3 ได้ทันที</li>
            </ol>
          </div>

          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
            <h4 className="font-semibold text-slate-100 flex items-center gap-2 mb-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>เทคนิคการเขียนข้อความภาษาไทยให้อ่านไพเราะ</span>
            </h4>
            <ul className="space-y-1.5 text-slate-400">
              <li>
                <strong className="text-slate-200">การเว้นวรรค:</strong> เว้นวรรคในจุดที่ต้องการให้ AI หยุดพักหายใจ จะทำให้จังหวะการอ่านเป็นธรรมชาติเหมือนมนุษย์พูด
              </li>
              <li>
                <strong className="text-slate-200">การใส่อารมณ์:</strong> สามารถปรับคำสั่งกำกับอารมณ์ในช่อง &ldquo;คำสั่งกำกับอารมณ์&rdquo; เช่น &ldquo;ตื่นเต้น ดีใจสุดขีด&rdquo; หรือ &ldquo;นุ่มนวล กระซิบผ่อนคลาย&rdquo;
              </li>
              <li>
                <strong className="text-slate-200">คำศัพท์ภาษาอังกฤษ:</strong> AI สามารถอ่านผสมไทย-อังกฤษได้อย่างลื่นไหล
              </li>
            </ul>
          </div>

          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
            <h4 className="font-semibold text-slate-100 flex items-center gap-2 mb-1.5">
              <Download className="w-4 h-4 text-teal-400" />
              <span>การบันทึกและนำไฟล์ไปใช้งาน</span>
            </h4>
            <p className="text-slate-400 leading-relaxed">
              ไฟล์ MP3 ที่สร้างขึ้นเป็นมาตรฐานบิตเรต 192kbps ขนาดกะทัดรัด สามารถนำไปใช้ในวิดีโอ YouTube, TikTok, Reels, สื่อการเรียนการสอน, พอดแคสต์, หรืองานโฆษณาได้ทันที
            </p>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition"
          >
            เข้าใจแล้ว เริ่มสร้างเสียง
          </button>
        </div>
      </div>
    </div>
  );
};
