interface Window {
  webkitSpeechRecognition: {
    new(): SpeechRecognition;
  };
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionError) => void;
  start(): void;
  stop(): void;
}

interface SpeechRecognitionEvent {
  results: {
    item(index: number): SpeechRecognitionResult;
    length: number;
    [index: number]: SpeechRecognitionResult;
  };
}

interface SpeechRecognitionResult {
  [index: number]: SpeechRecognitionAlternative;
  length: number;
}

interface SpeechRecognitionAlternative {
  transcript: string;
}

interface SpeechRecognitionError extends Event {
  error: string;
} 