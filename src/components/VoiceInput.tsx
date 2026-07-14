import React, { useState, useEffect, useRef } from 'react';
import { Send, Mic, MicOff, AlertCircle, Sparkles, User, Bot, Loader2, Volume2, VolumeX, Key } from 'lucide-react';
import { ChatMessage } from '../types';
import KeyGuidanceModal from './KeyGuidanceModal';
import FormattedChatText from './FormattedChatText';

interface VoiceInputProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  isLoading: boolean;
  errorMsg: string | null;
  userGeminiApiKey: string;
  onSaveGeminiApiKey: (key: string) => void;
}

export default function VoiceInput({ 
  messages, 
  onSendMessage, 
  isLoading, 
  errorMsg,
  userGeminiApiKey,
  onSaveGeminiApiKey
}: VoiceInputProps) {
  const [text, setText] = useState('');
  const [localInputKey, setLocalInputKey] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeechSupported, setIsSpeechSupported] = useState(false);
  const [isGuidanceOpen, setIsGuidanceOpen] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(() => {
    return localStorage.getItem('ai_audio_enabled') === 'true';
  });
  const [currentlySpeakingId, setCurrentlySpeakingId] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Check Web Speech API Support
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    setIsSpeechSupported(!!SpeechRecognition);
  }, []);

  // Save audio preference
  useEffect(() => {
    localStorage.setItem('ai_audio_enabled', String(isAudioEnabled));
    if (!isAudioEnabled) {
      handleStopSpeaking();
    }
  }, [isAudioEnabled]);

  // Auto Scroll Chat to Bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Read out loud last message if it's from AI and audio is enabled
  useEffect(() => {
    if (messages.length > 0 && isAudioEnabled) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg.role === 'model' && !lastMsg.error) {
        handleSpeak(lastMsg.text, lastMsg.id);
      }
    }
  }, [messages]);

  // Clean up synthesis on unmount
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || isLoading) return;
    onSendMessage(text.trim());
    setText('');
  };

  const handleActivateKey = () => {
    if (localInputKey.trim()) {
      onSaveGeminiApiKey(localInputKey.trim());
    }
  };

  // Text to Speech Speak controller
  const handleSpeak = (messageText: string, msgId: string) => {
    if (!('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();

    if (currentlySpeakingId === msgId) {
      setCurrentlySpeakingId(null);
      return;
    }

    // Clean markdown / checklist markers before speaking (keep words, drop syntax)
    const cleanText = messageText
      .replace(/[*#_`~]/g, '')
      .replace(/\[([^\]]*)\]/g, '$1')
      .replace(/^\s*[-•]\s+/gm, '')
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'en-US';
    utterance.rate = 1.05;
    utterance.pitch = 1.0;

    utterance.onend = () => {
      setCurrentlySpeakingId(null);
    };

    utterance.onerror = () => {
      setCurrentlySpeakingId(null);
    };

    setCurrentlySpeakingId(msgId);
    window.speechSynthesis.speak(utterance);
  };

  const handleStopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setCurrentlySpeakingId(null);
  };

  // Web Speech Recognition Controller
  const handleVoiceInput = () => {
    if (!isSpeechSupported) return;

    if (isListening && recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (err) {
        console.error('Error stopping recognition:', err);
      }
      setIsListening(false);
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
        setIsListening(true);
        handleStopSpeaking();
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setText(transcript);
          // Optional quick read-back
          if (isAudioEnabled) {
            const dictationUtterance = new SpeechSynthesisUtterance(`Captured: ${transcript}`);
            dictationUtterance.lang = 'en-US';
            dictationUtterance.rate = 1.1;
            window.speechSynthesis.speak(dictationUtterance);
          }
        }
      };

      recognition.onerror = (err: any) => {
        console.error('Speech Recognition Error:', err);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
        recognitionRef.current = null;
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      console.error('Speech start exception:', e);
      setIsListening(false);
    }
  };

  return (
    <div id="smart-interaction-panel" className="bg-white rounded-2xl border border-slate-200/80 shadow-sm flex flex-col h-[520px] overflow-hidden">
      {/* Header Banner */}
      <div id="chat-header" className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
            <Sparkles size={16} className="animate-pulse" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-slate-800 text-sm">AI Assistant Workspace</h3>
            <p className="text-[11px] text-slate-500 font-mono">Powered by Gemini 3.5 Flash</p>
          </div>
        </div>
        
        {/* Audio Option controls toggler */}
        <div className="flex items-center gap-3">
          <button
            id="workspace-audio-toggle-btn"
            type="button"
            onClick={() => setIsAudioEnabled(!isAudioEnabled)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-semibold transition-all duration-200 cursor-pointer ${
              isAudioEnabled
                ? 'bg-blue-50 border-blue-200 text-blue-700 font-medium'
                : 'bg-slate-100 border-slate-200 text-slate-500 hover:text-slate-700'
            }`}
            title={isAudioEnabled ? "Auto-read is active. Click to mute" : "Auto-read is muted. Click to activate TTS"}
          >
            {isAudioEnabled ? (
              <>
                <Volume2 size={13} className="text-blue-600 animate-bounce" />
                <span>Audio Active</span>
              </>
            ) : (
              <>
                <VolumeX size={13} />
                <span>Audio Muted</span>
              </>
            )}
          </button>
          
          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full animate-pulse ${userGeminiApiKey ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider font-mono">
              {userGeminiApiKey ? 'Active' : 'Awaiting Key'}
            </span>
          </div>
        </div>
      </div>

      {/* Chat Conversation Stream */}
      <div id="chat-messages-scroll" className="flex-1 overflow-y-auto p-5 space-y-4 scrollbar-thin bg-slate-50/30">
        {!userGeminiApiKey ? (
          <div id="ai-key-setup-card" className="h-full flex flex-col items-center justify-center text-center p-6 max-w-sm mx-auto animate-in fade-in duration-300">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 mb-4 border border-blue-100/40 relative">
              <Sparkles size={22} className="animate-pulse" />
              <Key size={12} className="absolute -bottom-1 -right-1 bg-amber-500 text-white rounded-md p-1 w-5 h-5 border-2 border-white" />
            </div>
            <h4 className="font-display font-bold text-slate-800 text-base mb-1.5">Unlock AI Assistant</h4>
            <p className="text-xs text-slate-500 leading-relaxed mb-5">
              Connect your own <strong>Gemini API Key</strong> to use voice checklist scheduling, automatic task categorizing, and natural language analytics. It is 100% free and stored securely on your browser.
            </p>
            
            <div className="w-full space-y-3">
              <div className="relative">
                <input
                  type="password"
                  placeholder="Paste your Gemini API key here..."
                  value={localInputKey}
                  onChange={(e) => setLocalInputKey(e.target.value)}
                  className="w-full bg-white border border-slate-200 px-4 py-2.5 rounded-xl text-xs font-mono text-center focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm"
                />
              </div>
              <button
                type="button"
                onClick={handleActivateKey}
                disabled={!localInputKey.trim()}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-100 disabled:text-slate-400 text-white font-semibold text-xs rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Sparkles size={13} />
                <span>Activate AI Assistant</span>
              </button>
              
              <p className="text-[10px] text-slate-400">
                Don't have a key?{' '}
                <button
                  type="button"
                  onClick={() => setIsGuidanceOpen(true)}
                  className="text-blue-600 hover:underline font-semibold cursor-pointer text-left"
                >
                  Get guidance to get the key →
                </button>
              </p>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div id="chat-empty-state" className="h-full flex flex-col items-center justify-center text-center p-6">
            <div className="w-12 h-12 rounded-2xl bg-blue-50/60 flex items-center justify-center text-blue-500 mb-3 border border-blue-100/30">
              <Bot size={22} />
            </div>
            <h4 className="font-semibold text-slate-700 text-sm mb-1">How can I help you?</h4>
            <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
              Ask custom questions about your schedule or click a quick action pill above to filter and inspect your tasks.
            </p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              id={`chat-msg-${msg.id}`}
              className={`flex gap-3 max-w-[85%] ${
                msg.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
              }`}
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs shrink-0 ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : msg.error
                    ? 'bg-rose-50 border border-rose-100 text-rose-600'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {msg.role === 'user' ? <User size={13} /> : <Bot size={13} />}
              </div>
              <div
                className={`p-3.5 rounded-2xl text-sm leading-relaxed relative group ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white rounded-tr-none shadow-sm'
                    : msg.error
                    ? 'bg-rose-50 border border-rose-150 text-rose-800 rounded-tl-none font-medium'
                    : 'bg-white border border-slate-150 text-slate-800 rounded-tl-none shadow-sm'
                }`}
              >
                {msg.role === 'model' && !msg.error ? (
                  <FormattedChatText text={msg.text} />
                ) : (
                  <div className="whitespace-pre-wrap break-words">{msg.text}</div>
                )}
                
                {/* Individual Speak Button for manual triggering */}
                <div className="flex items-center justify-between gap-4 mt-2 pt-1 border-t border-slate-100/10">
                  <span
                    className={`block text-[10px] ${
                      msg.role === 'user' ? 'text-blue-100' : 'text-slate-400'
                    }`}
                  >
                    {msg.timestamp}
                  </span>
                  {!msg.error && (
                    <button
                      id={`speak-msg-btn-${msg.id}`}
                      type="button"
                      onClick={() => handleSpeak(msg.text, msg.id)}
                      className={`p-1 rounded hover:bg-slate-100/10 cursor-pointer transition-colors ${
                        currentlySpeakingId === msg.id
                          ? 'text-amber-500 animate-pulse'
                          : msg.role === 'user'
                          ? 'text-blue-200 hover:text-white'
                          : 'text-slate-400 hover:text-blue-600'
                      }`}
                      title="Read aloud"
                    >
                      <Volume2 size={13} className={currentlySpeakingId === msg.id ? 'scale-110' : ''} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}

        {/* Loading Indicator */}
        {isLoading && (
          <div id="ai-loading-bubble" className="flex gap-3 max-w-[80%] mr-auto items-center">
            <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 shrink-0">
              <Bot size={13} />
            </div>
            <div className="p-3.5 rounded-2xl bg-white border border-slate-150 text-slate-500 rounded-tl-none shadow-sm flex items-center gap-2 text-xs font-medium">
              <Loader2 size={13} className="animate-spin text-blue-500" />
              <span>Analyzing tasks database...</span>
            </div>
          </div>
        )}

        {/* Global Error message / 429 warning */}
        {errorMsg && (
          <div id="ai-global-error" className="flex gap-3 max-w-[85%] mx-auto bg-amber-50 border border-amber-200/70 p-3.5 rounded-xl text-xs text-amber-800 font-medium animate-in slide-in-from-bottom duration-200">
            <AlertCircle size={15} className="shrink-0 text-amber-600 mt-0.5" />
            <div className="space-y-1">
              <p>{errorMsg}</p>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input Tray */}
      {!userGeminiApiKey ? (
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 text-center text-xs text-slate-400 font-medium">
          🔒 Enter your Gemini API key above to activate voice and chat controls.
        </div>
      ) : (
        <form id="chat-input-form" onSubmit={handleSubmit} className="p-4 border-t border-slate-100 bg-white">
          <div className="relative flex items-center">
            <input
              id="chat-text-input"
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              disabled={isLoading}
              placeholder={
                isListening
                  ? "Listening... Speak clearly now."
                  : isSpeechSupported
                  ? "Ask me anything, or click the mic to speak..."
                  : "Ask me anything..."
              }
              className={`w-full bg-slate-50/50 border pl-4 pr-24 py-3.5 rounded-xl text-sm transition-all focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 ${
                isListening
                  ? 'border-rose-300 focus:ring-rose-500/20 text-rose-900 bg-rose-50/10'
                  : 'border-slate-200 focus:border-blue-500'
              }`}
            />
            <div className="absolute right-2.5 flex items-center gap-1.5">
              {isSpeechSupported && (
                <button
                  id="mic-voice-btn"
                  type="button"
                  onClick={handleVoiceInput}
                  disabled={isLoading}
                  title={isListening ? "Stop listening" : "Start voice dictation"}
                  className={`p-2 rounded-lg cursor-pointer transition-colors duration-150 ${
                    isListening
                      ? 'bg-rose-500 text-white hover:bg-rose-600 animate-pulse'
                      : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {isListening ? <MicOff size={17} /> : <Mic size={17} />}
                </button>
              )}
              <button
                id="send-chat-btn"
                type="submit"
                disabled={!text.trim() || isLoading}
                className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed transition-colors"
              >
                <Send size={15} />
              </button>
            </div>
          </div>
          {isListening && (
            <div id="speech-waveform" className="mt-2.5 flex items-center justify-center gap-1 animate-pulse">
              <span className="w-1.5 h-3 bg-rose-400 rounded-full"></span>
              <span className="w-1.5 h-5 bg-rose-500 rounded-full"></span>
              <span className="w-1.5 h-2 bg-rose-400 rounded-full"></span>
            </div>
          )}
        </form>
      )}

      {/* Reusable step-by-step guidance modal */}
      <KeyGuidanceModal isOpen={isGuidanceOpen} onClose={() => setIsGuidanceOpen(false)} />
    </div>
  );
}
