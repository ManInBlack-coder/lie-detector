import React, { useState, useEffect } from 'react';

// Lisa WebkitSpeechRecognition tüübid
interface SpeechRecognitionEvent {
  results: {
    [key: number]: {
      [key: number]: {
        transcript: string;
      };
    };
  };
}

interface WebkitSpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: { error: string }) => void;
  onend: () => void;
  start: () => void;
  stop: () => void;
}

interface IWindow extends Window {
  webkitSpeechRecognition: {
    prototype: WebkitSpeechRecognition;
    new(): WebkitSpeechRecognition;
  };
}

declare const window: IWindow;

interface SpeechRecognitionProps {
  onTranscript: (transcript: string) => void;
  isListening: boolean;
}

const SpeechRecognition: React.FC<SpeechRecognitionProps> = ({ onTranscript, isListening }) => {
  const [recognition, setRecognition] = useState<WebkitSpeechRecognition | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isRecognitionActive, setIsRecognitionActive] = useState(false);

  useEffect(() => {
    // Kontrollime, kas brauser toetab kõnetuvastust
    if ('webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = 'et-EE';

      recognitionInstance.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result) => result.transcript)
          .join('');
        
        onTranscript(transcript);
      };

      recognitionInstance.onerror = (event: any) => {
        console.error('Kõnetuvastuse viga:', event.error);
        setIsRecognitionActive(false);
        
        switch (event.error) {
          case 'not-allowed':
            setError('Mikrofoni luba puudub. Palun lubage mikrofoni kasutamine.');
            break;
          case 'language-not-supported':
            setError('Eesti keele tugi pole saadaval. Proovime inglise keelega.');
            recognitionInstance.lang = 'en-US';
            break;
          case 'no-speech':
            setError('Häält ei tuvastatud. Palun proovige uuesti.');
            break;
          case 'aborted':
            // Proovime automaatselt taaskäivitada
            if (isListening && !isRecognitionActive) {
              setTimeout(() => {
                try {
                  recognitionInstance.start();
                  setIsRecognitionActive(true);
                } catch (e) {
                  console.error('Taaskäivitamine ebaõnnestus:', e);
                }
              }, 1000);
            }
            break;
          default:
            setError('Kõnetuvastuse viga. Palun proovige uuesti.');
        }
      };

      recognitionInstance.onend = () => {
        setIsRecognitionActive(false);
        // Kui ikka veel kuulame ja pole aktiivne, siis taaskäivitame
        if (isListening && !isRecognitionActive) {
          try {
            recognitionInstance.start();
            setIsRecognitionActive(true);
          } catch (e) {
            console.error('Taaskäivitamine ebaõnnestus:', e);
          }
        }
      };

      setRecognition(recognitionInstance);
    } else {
      setError('Teie brauser ei toeta kõnetuvastust');
    }
  }, [onTranscript, isListening]);

  useEffect(() => {
    if (recognition) {
      try {
        if (isListening && !isRecognitionActive) {
          recognition.start();
          setIsRecognitionActive(true);
        } else if (!isListening && isRecognitionActive) {
          recognition.stop();
          setIsRecognitionActive(false);
        }
      } catch (error) {
        console.error('Kõnetuvastuse käivitamine/peatamine ebaõnnestus:', error);
        setIsRecognitionActive(false);
      }
    }
  }, [isListening, recognition, isRecognitionActive]);

  return (
    <div>
      {error && (
        <div style={{ color: 'red', marginTop: '10px' }}>
          {error}
        </div>
      )}
    </div>
  );
};

export default SpeechRecognition; 