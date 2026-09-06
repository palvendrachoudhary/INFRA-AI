import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, X } from 'lucide-react';

export function LiveVoiceAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const wsRef = useRef<WebSocket | null>(null);
  const inputAudioCtxRef = useRef<AudioContext | null>(null);
  const outputAudioCtxRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  
  const nextStartTimeRef = useRef<number>(0);

  // Helper to convert float32 to 16-bit PCM base64
  const pcmToBase64 = (channelData: Float32Array) => {
    const buffer = new ArrayBuffer(channelData.length * 2);
    const view = new DataView(buffer);
    for (let i = 0; i < channelData.length; i++) {
      let s = Math.max(-1, Math.min(1, channelData[i]));
      view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
    }
    let binary = '';
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };

  const playAudioChunk = (audioCtx: AudioContext, base64Audio: string) => {
    try {
      const binaryString = atob(base64Audio);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const pcm16 = new Int16Array(bytes.buffer);
      const audioBuffer = audioCtx.createBuffer(1, pcm16.length, 24000);
      const channelData = audioBuffer.getChannelData(0);
      for (let i = 0; i < pcm16.length; i++) {
        channelData[i] = pcm16[i] / 32768;
      }

      const source = audioCtx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioCtx.destination);

      const currentTime = audioCtx.currentTime;
      if (nextStartTimeRef.current < currentTime) {
        nextStartTimeRef.current = currentTime;
      }
      source.start(nextStartTimeRef.current);
      nextStartTimeRef.current += audioBuffer.duration;
      
      setIsSpeaking(true);
      source.onended = () => {
        if (audioCtx.currentTime >= nextStartTimeRef.current) {
          setIsSpeaking(false);
        }
      };
    } catch (e) {
      console.error("Audio playback error", e);
    }
  };

  const startLiveSession = async () => {
    try {
      setError(null);
      
      // We need window.location.host for WS
      const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${wsProtocol}//${window.location.host}/live`;
      
      wsRef.current = new WebSocket(wsUrl);
      
      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      inputAudioCtxRef.current = inputCtx;
      outputAudioCtxRef.current = outputCtx;
      nextStartTimeRef.current = outputCtx.currentTime;

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      const source = inputCtx.createMediaStreamSource(stream);
      const processor = inputCtx.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;
      
      source.connect(processor);
      processor.connect(inputCtx.destination);

      processor.onaudioprocess = (e) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          const base64 = pcmToBase64(e.inputBuffer.getChannelData(0));
          wsRef.current.send(JSON.stringify({ audio: base64 }));
        }
      };

      wsRef.current.onopen = () => {
        setIsConnected(true);
      };

      wsRef.current.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.audio && outputAudioCtxRef.current) {
          playAudioChunk(outputAudioCtxRef.current, msg.audio);
        }
        if (msg.interrupted) {
          nextStartTimeRef.current = outputCtx.currentTime; // clear queue conceptually
          setIsSpeaking(false);
        }
      };
      
      wsRef.current.onclose = () => {
        stopSession();
      };
      
    } catch (err: any) {
      console.error("Live session error:", err);
      setError(err.message || "Failed to access microphone or connect to AI");
      stopSession();
    }
  };

  const stopSession = () => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (inputAudioCtxRef.current) {
      inputAudioCtxRef.current.close();
      inputAudioCtxRef.current = null;
    }
    if (outputAudioCtxRef.current) {
      outputAudioCtxRef.current.close();
      outputAudioCtxRef.current = null;
    }
    setIsConnected(false);
    setIsSpeaking(false);
  };

  useEffect(() => {
    return () => stopSession();
  }, []);

  return (
    <>
      <button 
        onClick={() => { setIsOpen(true); startLiveSession(); }}
        className="fixed bottom-6 right-6 p-4 bg-orange-500 text-white rounded-full shadow-xl hover:bg-orange-600 transition-colors z-40"
        title="Live Voice Assistant"
      >
        <Volume2 className="w-6 h-6" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1e1e1e] rounded-xl shadow-2xl p-6 w-full max-w-sm border border-slate-200 dark:border-white/10 relative">
            <button 
              onClick={() => { setIsOpen(false); stopSession(); }}
              className="absolute top-4 right-4 p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="text-center">
              <div className="w-20 h-20 mx-auto rounded-full bg-orange-100 dark:bg-orange-500/20 flex items-center justify-center mb-4 relative">
                {isSpeaking ? (
                  <Volume2 className="w-10 h-10 text-orange-500 animate-pulse" />
                ) : isConnected ? (
                  <Mic className="w-10 h-10 text-orange-500 animate-pulse" />
                ) : (
                  <MicOff className="w-10 h-10 text-slate-400" />
                )}
                {isSpeaking && (
                  <div className="absolute inset-0 rounded-full border-4 border-orange-500 animate-ping opacity-50"></div>
                )}
              </div>
              
              <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Civic Voice Assistant</h3>
              
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                {error ? <span className="text-red-500">{error}</span> : 
                 isConnected ? (isSpeaking ? "AI is speaking..." : "Listening... you can speak now.") : 
                 "Connecting to AI..."}
              </p>
              
              <button 
                onClick={() => { setIsOpen(false); stopSession(); }}
                className="w-full py-3 px-4 bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 rounded-lg font-medium hover:bg-slate-200 dark:hover:bg-white/10 transition-colors"
              >
                End Call
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
