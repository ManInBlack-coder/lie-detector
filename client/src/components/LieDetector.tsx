import React, { useState, useCallback, useRef, useEffect } from 'react';
import VideoAnalysis from './VideoAnalysis';
import SpeechRecognition from './SpeechRecognition';
import { Grid, Segment, Button, Header, List, Card, Message } from 'semantic-ui-react';
import { analyzeEmotions, AnalysisResult } from '../utils/emotionAnalysis';
import AnalysisResultCard from './AnalysisResultCard';

interface Answer {
  question: string;
  answer: string;
  emotions: any;
  truthProbability: number;
  observations: string[];
  formattedResults: AnalysisResult['formattedResults'];
}

const questions = [
  'Mis on sinu nimi?',
  'Kus sa töötad?',
  'Kas sa oled kunagi valetanud?',
  'Mis on sinu lemmikfilm?',
  'Kas sa oled täna hommikul söönud?'
];

interface EmotionHistory {
  timestamp: number;
  emotions: any;
}

const LieDetector: React.FC = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [showNextQuestion, setShowNextQuestion] = useState(true);
  const currentEmotions = useRef<any>(null);
  const emotionsHistoryRef = useRef<EmotionHistory[]>([]);
  const emotionsUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [showError, setShowError] = useState(false);

  const analyzeEmotionChanges = () => {
    const history = emotionsHistoryRef.current;
    if (history.length < 2) return null;

    const lastIndex = history.length - 1;
    const currentEmotions = history[lastIndex].emotions;
    const previousEmotions = history[lastIndex - 1].emotions;

    const changes: string[] = [];
    let suspiciousChange = false;

    // Kontrolli järske muutusi emotsioonides
    Object.entries(currentEmotions).forEach(([emotion, value]: [string, any]) => {
      const prevValue = previousEmotions[emotion];
      const change = Math.abs(value - prevValue);
      
      if (change > 0.3) { // Märkimisväärne muutus
        if (
          (emotion === 'happy' && (previousEmotions.fearful > 0.2 || previousEmotions.angry > 0.2)) ||
          (emotion === 'fearful' && previousEmotions.happy > 0.3) ||
          (emotion === 'angry' && previousEmotions.happy > 0.3)
        ) {
          suspiciousChange = true;
          changes.push(`Märgatud järsk muutus: ${emotion} (${(change * 100).toFixed(1)}%)`);
        }
      }
    });

    return { changes, suspiciousChange };
  };

  const handleTranscript = useCallback((transcript: string) => {
    console.log('Sain vastuse:', transcript);
    if (transcript && currentQuestionIndex < questions.length) {
      if (emotionsUpdateTimeoutRef.current) {
        clearTimeout(emotionsUpdateTimeoutRef.current);
      }
      
      emotionsUpdateTimeoutRef.current = setTimeout(() => {
        const emotionAnalysis = analyzeEmotions(
          currentEmotions.current,
          questions[currentQuestionIndex],
          transcript
        );
        const emotionChanges = analyzeEmotionChanges();
        
        const answer = {
          question: questions[currentQuestionIndex],
          answer: transcript,
          emotions: currentEmotions.current,
          truthProbability: emotionChanges?.suspiciousChange ? 
            Math.max(0.1, emotionAnalysis.truthProbability - 0.2) : 
            emotionAnalysis.truthProbability,
          observations: [
            ...emotionAnalysis.observations,
            ...(emotionChanges?.changes || [])
          ],
          formattedResults: emotionAnalysis.formattedResults
        };

        console.log('Salvestan vastuse koos emotsioonidega:', answer);
        setAnswers(prev => [...prev, answer]);
        setShowNextQuestion(false);
        
        // Oota 2 sekundit enne järgmise küsimuse näitamist
        setTimeout(() => {
          setCurrentQuestionIndex(prev => prev + 1);
          setShowNextQuestion(true);
          setIsListening(false);
        }, 2000);
      }, 500);
    }
  }, [currentQuestionIndex]);

  const handleNextQuestion = useCallback(() => {
    console.log('Alustan järgmise küsimusega');
    // Tühjenda emotsioonide ajalugu uue küsimuse jaoks
    emotionsHistoryRef.current = [];
    setIsListening(true);
  }, []);

  const handleEmotionsUpdate = useCallback((emotions: any) => {
    console.log('Emotsioonide uuendus:', emotions);
    currentEmotions.current = emotions;
    
    // Lisa emotsioonid ajalukku
    emotionsHistoryRef.current.push({
      timestamp: Date.now(),
      emotions: emotions
    });
    
    // Hoia ainult viimased 10 emotsiooni
    if (emotionsHistoryRef.current.length > 10) {
      emotionsHistoryRef.current.shift();
    }
  }, []);

  const handleAnswer = (answer: string) => {
    if (currentEmotions.current) {
      const emotionAnalysis = analyzeEmotions(
        currentEmotions.current,
        questions[currentQuestionIndex],
        answer
      );
      setAnswers(prev => [...prev, {
        question: questions[currentQuestionIndex],
        answer,
        emotions: currentEmotions.current,
        truthProbability: emotionAnalysis.truthProbability,
        observations: emotionAnalysis.observations,
        formattedResults: emotionAnalysis.formattedResults
      }]);
      setCurrentQuestionIndex(prev => prev + 1);
      setShowNextQuestion(true);
    }
  };

  return (
    <Grid stackable>
      <Grid.Row>
        <Grid.Column width={10}>
          <Segment>
            <VideoAnalysis onEmotionsUpdate={handleEmotionsUpdate} />
          </Segment>
        </Grid.Column>
        <Grid.Column width={6}>
          {currentQuestionIndex < questions.length ? (
            <Segment>
              {showNextQuestion ? (
                <>
                  <Header as='h2'>Küsimus {currentQuestionIndex + 1}</Header>
                  <p style={{ fontSize: '1.2em', margin: '1em 0' }}>{questions[currentQuestionIndex]}</p>
                  <Button 
                    primary 
                    size='large'
                    onClick={handleNextQuestion} 
                    disabled={isListening}
                  >
                    {isListening ? 'Kuulan...' : 'Vasta küsimusele'}
                  </Button>
                  <SpeechRecognition onTranscript={handleTranscript} isListening={isListening} />
                </>
              ) : (
                <Message info>
                  <Message.Header>Analüüsin vastust...</Message.Header>
                  <p>Palun oota, kuni analüüsin sinu vastust ja emotsioone.</p>
                </Message>
              )}
            </Segment>
          ) : (
            <Message success>
              <Message.Header>Küsimustik on lõppenud</Message.Header>
              <p>Kõik küsimused on vastatud. Allpool näed kõikide vastuste analüüsi.</p>
            </Message>
          )}

          {/* Viimase vastuse analüüsi kaart */}
          {!showNextQuestion && currentQuestionIndex < questions.length && answers.length > 0 && (
            <div style={{ marginTop: '1em' }}>
              <Header as='h3'>Viimase vastuse analüüs</Header>
              <AnalysisResultCard result={answers[answers.length - 1].formattedResults} />
            </div>
          )}

          {/* Kõikide eelnevate vastuste analüüsi kaardid */}
          {answers.length > 0 && (
            <div style={{ marginTop: '2em' }}>
              <Header as='h3' dividing>Kõik vastused ja analüüsid</Header>
              {answers.map((item, index) => (
                <div key={index} style={{ marginBottom: '2em' }}>
                  <Header as='h4' style={{ margin: '0 0 1em 0' }}>
                    Küsimus {index + 1}: {item.question}
                  </Header>
                  <AnalysisResultCard result={item.formattedResults} />
                </div>
              ))}
            </div>
          )}
        </Grid.Column>
      </Grid.Row>
    </Grid>
  );
};

export default LieDetector; 