import React, { useState, useEffect, useRef } from 'react';

interface SpeechRecognitionProps {
  onTranscript: (transcript: string) => void;
  isListening: boolean;
}

const SpeechRecognition: React.FC<SpeechRecognitionProps> = ({ onTranscript, isListening }) => {
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('Ootan...');
  const [finalTranscript, setFinalTranscript] = useState<string>('');
  const recognitionRef = useRef<any>(null);
  const isProcessingRef = useRef<boolean>(false);

  const stopRecognition = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (err) {
        console.error('Kõnetuvastuse peatamise viga:', err);
      }
    }
  };

  const startRecognition = () => {
    if (isProcessingRef.current) {
      console.log('Kõnetuvastus on juba käimas või käivitumas');
      return;
    }

    if (!recognitionRef.current) {
      console.error('Kõnetuvastus pole initsialiseeritud');
      return;
    }

    isProcessingRef.current = true;
    setTimeout(() => {
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.error('Kõnetuvastuse käivitamise viga:', err);
        setError(`Kõnetuvastuse käivitamise viga: ${err instanceof Error ? err.message : 'Tundmatu viga'}`);
        setStatus('Viga');
        isProcessingRef.current = false;
      }
    }, 100);
  };

  useEffect(() => {
    if (!('webkitSpeechRecognition' in window)) {
      setError('Vabandust, teie brauser ei toeta kõnetuvastust.');
      return;
    }

    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'et-EE';
    recognition.maxAlternatives = 3;

    recognition.onstart = () => {
      console.log('Kõnetuvastus algas');
      setStatus('Kuulan...');
      isProcessingRef.current = false;
    };

    recognition.onend = () => {
      console.log('Kõnetuvastus lõppes');
      setStatus('Valmis');
      isProcessingRef.current = false;
      
      if (isListening) {
        startRecognition();
      }
    };

    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscriptDetected = false;
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal && !finalTranscriptDetected) {
          const mostConfidentResult = Array.from(result).reduce((prev: any, current: any) => {
            return (prev.confidence > current.confidence) ? prev : current;
          });
          
          const newTranscript = (mostConfidentResult as any).transcript;
          setFinalTranscript(prev => prev + ' ' + newTranscript);
          onTranscript(newTranscript.trim());
          finalTranscriptDetected = true;
          stopRecognition();
        } else if (!result.isFinal) {
          interimTranscript += result[0].transcript;
        }
      }
      
      if (interimTranscript) {
        console.log('Vahetu tulemus:', interimTranscript);
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Kõnetuvastuse viga:', event.error);
      setError(`Kõnetuvastuse viga: ${event.error}`);
      setStatus('Viga');
      isProcessingRef.current = false;
    };

    recognitionRef.current = recognition;

    return () => {
      stopRecognition();
    };
  }, []);

  useEffect(() => {
    if (isListening && !isProcessingRef.current) {
      startRecognition();
    } else if (!isListening) {
      stopRecognition();
    }
  }, [isListening]);

  return (
    <div>
      {error && (
        <div style={{ color: 'red', marginTop: '10px', marginBottom: '10px' }}>
          {error}
        </div>
      )}
      <div style={{ 
        marginTop: '10px',
        padding: '10px',
        backgroundColor: isListening ? '#e8f5e9' : '#f5f5f5',
        borderRadius: '5px',
        textAlign: 'center'
      }}>
        {status}
      </div>
    </div>
  );
};

export default SpeechRecognition; 