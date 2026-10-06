import React, { useEffect, useRef } from 'react';

interface AudioVisualizerProps {
  isPlaying: boolean;
  audioElement: HTMLAudioElement | null;
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ isPlaying }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const phaseRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const barCount = 48;
    const barWidth = 4;
    const gap = 3;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      phaseRef.current += 0.08;

      const totalBarsWidth = barCount * (barWidth + gap);
      const startX = (width - totalBarsWidth) / 2;

      for (let i = 0; i < barCount; i++) {
        const x = startX + i * (barWidth + gap);
        let barHeight = 4; // idle height

        if (isPlaying) {
          // Dynamic undulating wave pattern
          const sinVal1 = Math.sin(phaseRef.current + i * 0.35);
          const sinVal2 = Math.cos(phaseRef.current * 0.7 + i * 0.2);
          const factor = Math.abs(sinVal1 * 0.6 + sinVal2 * 0.4);
          barHeight = Math.max(6, factor * (height * 0.85));
        } else {
          // Gentle static gradient wave
          barHeight = Math.max(4, Math.sin(i * 0.2) * 12 + 6);
        }

        const y = (height - barHeight) / 2;

        // Gradient color for bars
        const gradient = ctx.createLinearGradient(0, y, 0, y + barHeight);
        if (isPlaying) {
          gradient.addColorStop(0, '#38bdf8'); // sky-400
          gradient.addColorStop(0.5, '#818cf8'); // indigo-400
          gradient.addColorStop(1, '#c084fc'); // purple-400
        } else {
          gradient.addColorStop(0, '#475569'); // slate-600
          gradient.addColorStop(1, '#334155'); // slate-700
        }

        ctx.fillStyle = gradient;
        ctx.beginPath();
        // Rounded bars
        ctx.roundRect(x, y, barWidth, barHeight, 2);
        ctx.fill();
      }

      animationRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying]);

  return (
    <div className="w-full flex justify-center items-center py-2 bg-slate-900/60 rounded-xl border border-slate-800/80 backdrop-blur-sm shadow-inner">
      <canvas
        ref={canvasRef}
        width={360}
        height={64}
        className="max-w-full h-16"
      />
    </div>
  );
};
