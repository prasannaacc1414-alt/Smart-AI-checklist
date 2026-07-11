import React, { useState, useEffect, useRef } from 'react';
import { Plus, Mic, MicOff, Volume2, VolumeX, RefreshCw } from 'lucide-react';

interface QuickAddTaskProps {
  onAddTask: (description: string) => void;
  isAdding: boolean;
  isLoading: boolean;
}

export default function QuickAddTask({ onAddTask, isAdding, isLoading }: QuickAddTaskProps) {
  const [newDesc, setNewDesc] = useState('');
  
  // Voice and Speech states
  const [isDictating, setIsDictating] = useState(false);
  const [isSpeechSupported, setIsSpeechSupported] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(() => {
    return localStorage.getItem('task_audio_enabled') === 'true';
  });
  const recognitionRef = useRef<any>(null);

  // Check Web Speech support
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    setIsSpeechSupported(!!SpeechRecognition);
  }, []);

  // Save preference
  useEffect(() => {
    localStorage.setItem('task_audio_enabled', String(isAudioEnabled));
  }, [isAudioEnabled]);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDesc.trim() || isAdding) return;
    const textToSubmit = newDesc.trim();
    onAddTask(textToSubmit);

    // Audio read back confirmation on adding
    if (isAudioEnabled && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(`Adding task: ${textToSubmit}`);
      utterance.lang = 'en-US';
      utterance.rate = 1.05;
      window.speechSynthesis.speak(utterance);
    }

    setNewDesc('');
  };

  // Dictate voice input (Audio input to text conversion)
  const handleDictate = () => {
    if (!isSpeechSupported) return;

    if (isDictating && recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (err) {
        console.error('Error stopping dictation:', err);
      }
      setIsDictating(false);
      return;
    }

    try {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();

      recognition.continuous = false;
      recognition.lang = 'en-US';
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsDictating(true);
        if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel();
        }
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setNewDesc(transcript);
          
          // Convert text back to audio to confirm
          if (isAudioEnabled && 'speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(`Dictated: ${transcript}`);
            utterance.lang = 'en-US';
            utterance.rate = 1.05;
            window.speechSynthesis.speak(utterance);
          }
        }
      };

      recognition.onerror = (err: any) => {
        console.error('Task Dictation Error:', err);
        setIsDictating(false);
      };

      recognition.onend = () => {
        setIsDictating(false);
        recognitionRef.current = null;
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      console.error('Speech start exception:', e);
      setIsDictating(false);
    }
  };

  // Convert current input text to audio preview
  const handlePreviewAudio = () => {
    if (!newDesc.trim() || !('speechSynthesis' in window)) return;
    
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(newDesc.trim());
    utterance.lang = 'en-US';
    utterance.rate = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div id="quick-add-container" className="p-5 border-b border-slate-100 bg-slate-50/30">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-slate-800 font-display font-semibold text-sm">Quick Add New Task</h3>
        
        {/* Auto voice feedback toggle */}
        <button
          id="task-audio-toggle-btn"
          type="button"
          onClick={() => setIsAudioEnabled(!isAudioEnabled)}
          className={`flex items-center gap-1 px-2 py-0.5 rounded border text-[10px] font-semibold transition-all duration-150 cursor-pointer ${
            isAudioEnabled
              ? 'bg-blue-50 border-blue-250 text-blue-700'
              : 'bg-slate-50 border-slate-200 text-slate-500'
          }`}
          title={isAudioEnabled ? "Auto-read task addition voice is active" : "Auto-read is off"}
        >
          {isAudioEnabled ? <Volume2 size={11} className="animate-pulse text-blue-600" /> : <VolumeX size={11} />}
          <span>Voice Feedback: {isAudioEnabled ? "ON" : "OFF"}</span>
        </button>
      </div>
      
      <form onSubmit={handleAddSubmit} className="flex gap-2.5">
        <div className="relative flex-1 flex items-center">
          <input
            id="task-quick-add-input"
            type="text"
            required
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
            disabled={isAdding || isLoading || isDictating}
            placeholder={
              isDictating
                ? "Dictating task description... Speak now"
                : "Type or dictate a task item..."
            }
            className={`w-full bg-white border pr-20 pl-4 py-3 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all ${
              isDictating
                ? 'border-rose-300 bg-rose-50/10 text-rose-900 focus:ring-rose-500/20'
                : 'border-slate-200/90'
            }`}
          />
          
          {/* Input Audio Actions */}
          <div className="absolute right-2 flex items-center gap-1">
            {/* Convert current text to audio preview */}
            {newDesc.trim() && (
              <button
                id="preview-audio-task-btn"
                type="button"
                onClick={handlePreviewAudio}
                title="Listen to written task text (Text to Audio)"
                className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
              >
                <Volume2 size={14} />
              </button>
            )}
            
            {/* Dictate Button (STT) */}
            {isSpeechSupported && (
              <button
                id="dictate-task-btn"
                type="button"
                onClick={handleDictate}
                title={isDictating ? "Stop recording voice" : "Dictate task with your voice (Audio input)"}
                className={`p-1.5 rounded-lg transition-colors duration-150 cursor-pointer ${
                  isDictating
                    ? 'bg-rose-500 text-white hover:bg-rose-600 animate-pulse'
                    : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                }`}
              >
                {isDictating ? <MicOff size={14} /> : <Mic size={14} />}
              </button>
            )}
          </div>
        </div>
        
        <button
          id="task-quick-add-submit-btn"
          type="submit"
          disabled={!newDesc.trim() || isAdding || isLoading || isDictating}
          className="px-4.5 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-100 disabled:text-slate-400 cursor-pointer disabled:cursor-not-allowed text-white font-medium text-sm rounded-xl flex items-center gap-1.5 transition-colors shadow-sm"
        >
          {isAdding ? (
            <RefreshCw size={15} className="animate-spin" />
          ) : (
            <Plus size={16} />
          )}
          <span>Add</span>
        </button>
      </form>
      {isDictating && (
        <div id="task-dictation-waveform" className="mt-2 flex items-center gap-1 text-[11px] font-semibold text-rose-500 font-mono">
          <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-ping"></span>
          <span>Recording voice input...</span>
        </div>
      )}
    </div>
  );
}
