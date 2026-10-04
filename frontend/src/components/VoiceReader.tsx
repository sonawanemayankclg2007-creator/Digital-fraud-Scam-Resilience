import React, { useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

interface VoiceReaderProps {
  textToRead: string;
  language?: string; // 'en', 'hi', 'gu'
  label?: string;
  className?: string;
}

export const VoiceReader: React.FC<VoiceReaderProps> = ({
  textToRead,
  language = 'en',
  label = 'Read Aloud (Voice)',
  className = ''
}) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const handleSpeak = () => {
    if (!('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported in this browser.');
      return;
    }

    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(textToRead);

    // Set voice language
    if (language === 'hi') {
      utterance.lang = 'hi-IN';
    } else if (language === 'gu') {
      utterance.lang = 'gu-IN';
    } else {
      utterance.lang = 'en-IN';
    }

    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
  };

  return (
    <button
      onClick={handleSpeak}
      type="button"
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 text-xs font-medium transition-all ${className}`}
      title="Accessibility Voice Readout for Senior Citizens and Regional Users"
    >
      {isPlaying ? (
        <>
          <VolumeX size={15} className="text-red-400 animate-pulse" />
          <span>Stop Voice</span>
        </>
      ) : (
        <>
          <Volume2 size={15} className="text-blue-400" />
          <span>{label}</span>
        </>
      )}
    </button>
  );
};
