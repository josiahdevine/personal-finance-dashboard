import React, { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  placeholder?: string;
  className?: string;
  isListening?: boolean;
  onListeningChange?: (isListening: boolean) => void;
}

declare global {
  interface Window {
    voiceTyping: {
      initialize: () => Promise<void>;
      startListening: () => void;
      stopListening: () => void;
      onTranscript: (callback: (text: string) => void) => void;
    };
  }
}

export const VoiceInput: React.FC<VoiceInputProps> = ({
  onTranscript,
  placeholder = 'Click the microphone to start speaking...',
  className = '',
  isListening: externalIsListening,
  onListeningChange
}) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [internalIsListening, setInternalIsListening] = useState(false);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const isListening = externalIsListening ?? internalIsListening;

  useEffect(() => {
    // Load the voice typing script
    const script = document.createElement('script');
    script.src = '/voice-typing/voice_typing.pyw'; // Update this path to where you store the compiled script
    script.async = true;
    document.body.appendChild(script);

    script.onload = async () => {
      try {
        await window.voiceTyping.initialize();
        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to initialize voice typing:', error);
      }
    };

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  useEffect(() => {
    if (isInitialized) {
      window.voiceTyping.onTranscript((text) => {
        onTranscript(text);
      });
    }
  }, [isInitialized, onTranscript]);

  const toggleListening = useCallback(() => {
    if (!isInitialized) return;

    if (isListening) {
      window.voiceTyping.stopListening();
    } else {
      window.voiceTyping.startListening();
    }

    const newState = !isListening;
    setInternalIsListening(newState);
    onListeningChange?.(newState);
  }, [isInitialized, isListening, onListeningChange]);

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={toggleListening}
        className={`p-2 rounded-full transition-colors ${
          isListening
            ? 'bg-red-500 text-white'
            : isDark
            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}
        disabled={!isInitialized}
        title={isInitialized ? 'Click to toggle voice input' : 'Initializing voice input...'}
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
          />
        </svg>
      </button>
      {!isInitialized && (
        <div className={`absolute left-0 bottom-full mb-2 text-sm ${
          isDark ? 'text-gray-400' : 'text-gray-500'
        }`}>
          Initializing voice input...
        </div>
      )}
      {isListening && (
        <div className="absolute left-0 bottom-full mb-2 flex items-center space-x-2">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            Listening...
          </span>
        </div>
      )}
    </div>
  );
}; 