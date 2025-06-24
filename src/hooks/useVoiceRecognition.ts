import { useState, useEffect, useCallback } from 'react';

// Define the SpeechRecognition API interface
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: (event: SpeechRecognitionEvent) => void;
  onstart: () => void;
  onend: () => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

declare global {
  interface Window {
    SpeechRecognition: {
      new (): SpeechRecognition;
      prototype: SpeechRecognition;
    };
    webkitSpeechRecognition: {
      new (): SpeechRecognition;
      prototype: SpeechRecognition;
    };
  }
}

interface UseVoiceRecognitionReturn {
  isListening: boolean;
  transcript: string;
  startListening: () => void;
  stopListening: () => void;
  isSupported: boolean;
  confidence: number;
  setLanguage: (language: string) => void;
}

export const useVoiceRecognition = (initialLanguage: string = 'en-US'): UseVoiceRecognitionReturn => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [confidence, setConfidence] = useState(0);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  const [language, setLanguage] = useState(initialLanguage);

  const isSupported = typeof window !== 'undefined' && 
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  // Map language codes to SpeechRecognition language codes
  const getRecognitionLanguage = (lang: string): string => {
    const languageMap: Record<string, string> = {
      'en': 'en-US',
      'es': 'es-ES',
      'fr': 'fr-FR',
      'hi': 'hi-IN',
      'te': 'te-IN'
    };
    
    return languageMap[lang] || 'en-US';
  };

  useEffect(() => {
    if (!isSupported) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognitionInstance = new SpeechRecognition();

    recognitionInstance.continuous = true;
    recognitionInstance.interimResults = true;
    recognitionInstance.lang = getRecognitionLanguage(language);

    recognitionInstance.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = '';
      let confidence = 0;

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
          confidence = result[0].confidence;
        }
      }

      if (finalTranscript) {
        setTranscript(finalTranscript);
        setConfidence(confidence);
      }
    };

    recognitionInstance.onstart = () => setIsListening(true);
    recognitionInstance.onend = () => setIsListening(false);
    recognitionInstance.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error, event.message);
      setIsListening(false);
    };

    setRecognition(recognitionInstance);

    return () => {
      if (recognitionInstance) {
        recognitionInstance.stop();
      }
    };
  }, [isSupported, language]);

  const startListening = useCallback(() => {
    if (recognition) {
      setTranscript('');
      recognition.start();
    }
  }, [recognition]);

  const stopListening = useCallback(() => {
    if (recognition) {
      recognition.stop();
    }
  }, [recognition]);

  const updateLanguage = useCallback((newLanguage: string) => {
    setLanguage(newLanguage);
    
    // If we're currently listening, restart recognition with new language
    if (isListening && recognition) {
      recognition.stop();
      
      // Small delay to ensure recognition has stopped before restarting
      setTimeout(() => {
        if (recognition) {
          recognition.lang = getRecognitionLanguage(newLanguage);
          recognition.start();
        }
      }, 300);
    } else if (recognition) {
      recognition.lang = getRecognitionLanguage(newLanguage);
    }
  }, [isListening, recognition]);

  return {
    isListening,
    transcript,
    startListening,
    stopListening,
    isSupported,
    confidence,
    setLanguage: updateLanguage
  };
};

// Export the SpeechRecognition type for use in other files
export type { SpeechRecognition };