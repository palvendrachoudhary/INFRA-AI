import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Sparkles, Globe, Copy, Check, Radio } from 'lucide-react';

interface VoiceNotePlayerProps {
  transcript: string;
  regionalTranscript?: string;
  language?: string;
  category?: string;
  durationSec?: number;
  location?: string;
  compact?: boolean;
}

export const VoiceNotePlayer: React.FC<VoiceNotePlayerProps> = ({
  transcript,
  regionalTranscript,
  language = "Hindi / Regional",
  category = "Civic Incident",
  durationSec = 14,
  location,
  compact = false,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [speed, setSpeed] = useState<number>(1.0);
  const [isMuted, setIsMuted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeLang, setActiveLang] = useState<'english' | 'regional'>('english');
  const [audioBarHeights, setAudioBarHeights] = useState<number[]>(() => 
    Array.from({ length: 24 }, (_, i) => 25 + Math.sin(i * 0.7) * 20 + ((i * 17) % 35))
  );

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const timerRef = useRef<any>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);

  const effectiveDuration = durationSec || 12;
  const currentText = activeLang === 'regional' && regionalTranscript ? regionalTranscript : transcript;

  // Load voices on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const loadVoices = () => {
        window.speechSynthesis.getVoices();
      };
      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
    return () => {
      stopAudio();
    };
  }, []);

  // Update animated equalizer bars when playing
  useEffect(() => {
    let animInterval: any = null;
    if (isPlaying) {
      animInterval = setInterval(() => {
        setAudioBarHeights(() =>
          Array.from({ length: 24 }, () => Math.floor(Math.random() * 65) + 20)
        );
      }, 100);
    } else {
      setAudioBarHeights(
        Array.from({ length: 24 }, (_, i) => 25 + Math.sin(i * 0.7) * 20 + ((i * 17) % 35))
      );
    }
    return () => clearInterval(animInterval);
  }, [isPlaying]);

  // Audio tone generation for guaranteed acoustic feedback in iframe environments
  const startSynthSound = () => {
    if (isMuted) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtx();
      }
      if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }

      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      // Subtle warm communications dispatch radio background hum
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(220, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(330, ctx.currentTime + 0.3);

      gain.gain.setValueAtTime(0.015, ctx.currentTime);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();

      oscillatorRef.current = osc;
      gainRef.current = gain;
    } catch (e) {
      // Non-blocking fallback
    }
  };

  const stopSynthSound = () => {
    try {
      if (oscillatorRef.current) {
        oscillatorRef.current.stop();
        oscillatorRef.current.disconnect();
        oscillatorRef.current = null;
      }
      if (gainRef.current) {
        gainRef.current.disconnect();
        gainRef.current = null;
      }
    } catch (e) {
      // Non-blocking
    }
  };

  const stopAudio = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    stopSynthSound();
    clearInterval(timerRef.current);
    setIsPlaying(false);
  };

  const playAudio = (targetTime = currentTime) => {
    if (typeof window === 'undefined') return;

    stopAudio();

    if (!('speechSynthesis' in window)) {
      // Fallback timer simulation if SpeechSynthesis not supported
      setIsPlaying(true);
      startSynthSound();
      timerRef.current = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= effectiveDuration) {
            stopAudio();
            return 0;
          }
          return prev + 1;
        });
      }, 1000 / speed);
      return;
    }

    try {
      window.speechSynthesis.cancel();
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
      const textToSpeak = currentText;
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.rate = speed;
      utterance.pitch = 1.0;

      // Select natural Indian or Hindi voice if available
      const voices = window.speechSynthesis.getVoices();
      if (activeLang === 'regional') {
        const regionalVoice = voices.find(v => v.lang.startsWith('hi') || v.lang.startsWith('mr') || v.lang.startsWith('ta') || v.lang.startsWith('te'));
        if (regionalVoice) utterance.voice = regionalVoice;
      } else {
        const inVoice = voices.find(v => v.lang.includes('en-IN') || v.lang.includes('en-GB') || v.lang.startsWith('en'));
        if (inVoice) utterance.voice = inVoice;
      }

      utterance.onstart = () => {
        setIsPlaying(true);
        startSynthSound();
        const startTimestamp = Date.now() - (targetTime * 1000 / speed);
        timerRef.current = setInterval(() => {
          const elapsed = (Date.now() - startTimestamp) / 1000 * speed;
          if (elapsed >= effectiveDuration) {
            setCurrentTime(effectiveDuration);
          } else {
            setCurrentTime(Math.min(effectiveDuration, Math.round(elapsed)));
          }
        }, 300);
      };

      utterance.onend = () => {
        stopAudio();
        setCurrentTime(0);
      };

      utterance.onerror = (e) => {
        console.warn("Speech playback notice:", e);
        stopAudio();
      };

      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.error("Audio playback error:", err);
      stopAudio();
    }
  };

  const togglePlay = () => {
    if (isPlaying) {
      stopAudio();
    } else {
      playAudio(currentTime >= effectiveDuration ? 0 : currentTime);
    }
  };

  const handleRestart = () => {
    stopAudio();
    setCurrentTime(0);
    playAudio(0);
  };

  const handleSpeedToggle = () => {
    const nextSpeed = speed === 1.0 ? 1.25 : speed === 1.25 ? 1.5 : 1.0;
    setSpeed(nextSpeed);
    if (isPlaying) {
      stopAudio();
      setTimeout(() => playAudio(currentTime), 50);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(currentText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    const newTime = Math.round(ratio * effectiveDuration);
    setCurrentTime(newTime);
    if (isPlaying) {
      playAudio(newTime);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="w-full space-y-3">
      {/* Audio Player Bar */}
      <div 
        className={`w-full rounded-xl p-3.5 border transition-all relative overflow-hidden select-none ${
          isPlaying 
            ? 'bg-[#091118] border-neon-green/50 shadow-[0_0_25px_rgba(0,255,135,0.15)]' 
            : 'bg-[#0a0d14]/90 border-white/10 hover:border-neon-cyan/40 hover:bg-[#0c101a]'
        }`}
      >
        {/* Subtle glowing ambient gradient behind waveform */}
        <div 
          className={`absolute inset-0 pointer-events-none transition-opacity duration-500 ${
            isPlaying ? 'opacity-100' : 'opacity-0'
          }`}
          style={{
            background: 'radial-gradient(ellipse at 50% 50%, rgba(0, 255, 135, 0.08), transparent 70%)'
          }}
        />

        {/* Top Header Controls: Badge & Frequency status */}
        <div className="flex items-center justify-between gap-2 mb-2.5 relative z-10">
          <div className="flex items-center gap-2">
            <span className={`flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${
              isPlaying 
                ? 'bg-neon-green/20 text-neon-green border-neon-green/40 animate-pulse' 
                : 'bg-white/5 text-slate-300 border-white/10'
            }`}>
              <Radio className={`w-3 h-3 ${isPlaying ? 'text-neon-green animate-spin' : 'text-slate-400'}`} />
              {isPlaying ? 'PLAYING AI VOICE DISPATCH' : 'CITIZEN VOICE RECORDING'}
            </span>

            {regionalTranscript && (
              <span className="text-[9px] font-mono text-neon-cyan/90 bg-neon-cyan/10 border border-neon-cyan/25 px-1.5 py-0.5 rounded hidden sm:inline-flex items-center gap-1">
                <Globe className="w-2.5 h-2.5" />
                {language}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 text-[11px] font-mono font-semibold">
            <span className={isPlaying ? 'text-neon-green font-bold' : 'text-slate-400'}>
              {formatTime(currentTime)}
            </span>
            <span className="text-slate-600">/</span>
            <span className="text-slate-400">{formatTime(effectiveDuration)}</span>
          </div>
        </div>

        {/* Dynamic Waveform Visualizer */}
        <div 
          onClick={handleSeek}
          className="relative w-full h-11 bg-black/60 rounded-lg p-2 flex items-center justify-between gap-1 cursor-pointer border border-white/10 hover:border-white/20 transition-colors group overflow-hidden"
          title="Click to seek"
        >
          {/* Waveform Bars */}
          <div className="flex items-center justify-between w-full h-full gap-[3px] z-10">
            {audioBarHeights.map((h, i) => {
              const barProgressRatio = i / 24;
              const currentProgressRatio = currentTime / effectiveDuration;
              const isPassed = barProgressRatio <= currentProgressRatio;

              return (
                <div
                  key={i}
                  className={`flex-1 rounded-full transition-all duration-150 ${
                    isPlaying
                      ? isPassed
                        ? 'bg-gradient-to-t from-neon-green to-neon-cyan shadow-[0_0_8px_#00FF87]'
                        : 'bg-slate-700/60'
                      : isPassed
                      ? 'bg-neon-cyan/80'
                      : 'bg-slate-700/40 group-hover:bg-slate-600/50'
                  }`}
                  style={{
                    height: `${isPlaying ? h : Math.max(18, (h * 0.8))}%`,
                  }}
                />
              );
            })}
          </div>

          {/* Progress Overlay bar */}
          <div 
            className="absolute left-0 top-0 bottom-0 bg-neon-green/10 pointer-events-none transition-all duration-200"
            style={{ width: `${(currentTime / effectiveDuration) * 100}%` }}
          />
        </div>

        {/* Controls Row: Play, Replay, Speed, Mute */}
        <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-white/5 relative z-10">
          <div className="flex items-center gap-2">
            {/* Play/Pause Button */}
            <button
              onClick={togglePlay}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold font-mono uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
                isPlaying
                  ? 'bg-neon-green text-black hover:bg-neon-green/90 shadow-[0_0_15px_rgba(0,255,135,0.4)] scale-105'
                  : 'bg-neon-cyan/20 hover:bg-neon-cyan/30 text-neon-cyan border border-neon-cyan/40 shadow-[0_0_12px_rgba(0,229,255,0.2)]'
              }`}
            >
              {isPlaying ? (
                <>
                  <Pause className="w-3.5 h-3.5 fill-current" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Listen Voice</span>
                </>
              )}
            </button>

            {/* Replay */}
            <button
              onClick={handleRestart}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer border border-transparent hover:border-white/10"
              title="Restart from beginning"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            {/* Speed Toggle */}
            <button
              onClick={handleSpeedToggle}
              className="px-2 py-1 rounded bg-white/5 hover:bg-white/10 text-[10px] font-mono text-slate-300 hover:text-white border border-white/10 transition-colors cursor-pointer"
              title="Playback speed"
            >
              {speed}x
            </button>
          </div>

          <div className="flex items-center gap-2">
            {/* Regional vs English Toggle */}
            {regionalTranscript && (
              <button
                onClick={() => {
                  stopAudio();
                  setActiveLang(prev => prev === 'english' ? 'regional' : 'english');
                }}
                className="px-2.5 py-1 rounded-md text-[10px] font-mono flex items-center gap-1.5 transition-all cursor-pointer border bg-white/5 hover:bg-white/10 text-slate-200 border-white/15"
                title="Toggle Regional / English Audio & Transcript"
              >
                <Globe className="w-3 h-3 text-cyan-glow" />
                <span>{activeLang === 'english' ? 'Switch to Hindi/Local' : 'Switch to English'}</span>
              </button>
            )}

            {/* Mute Synth Sound */}
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title={isMuted ? "Unmute sound" : "Mute background tone"}
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Transcript Text Container */}
      <div className="relative p-3.5 bg-[#0e1017] rounded-xl border border-white/10 hover:border-white/20 transition-all">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-neon-green" />
            {activeLang === 'regional' ? `Native Audio Transcript (${language})` : 'AI Grounded English Transcript'}
          </span>

          <button
            onClick={handleCopy}
            className="px-2 py-0.5 rounded text-[10px] font-mono text-slate-400 hover:text-white hover:bg-white/10 flex items-center gap-1 transition-colors cursor-pointer"
            title="Copy transcript"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-neon-green" />
                <span className="text-neon-green">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>

        <p className="text-sm font-medium text-slate-100 leading-relaxed select-text italic">
          "{currentText}"
        </p>

        {activeLang === 'regional' && (
          <p className="text-xs text-slate-400 mt-2 pt-2 border-t border-white/5 font-sans">
            <strong className="text-slate-300">English Translation:</strong> {transcript}
          </p>
        )}
      </div>
    </div>
  );
};
