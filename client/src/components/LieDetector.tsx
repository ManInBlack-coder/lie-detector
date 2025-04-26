import React, { useState, useCallback } from 'react';
import VideoAnalysis from './VideoAnalysis';
import SpeechRecognition from './SpeechRecognition';
import { Grid, Segment, Button, Header, List, Card } from 'semantic-ui-react';

const questions = [
  'Mis on sinu nimi?',
  'Kus sa töötad?',
  'Kas sa oled kunagi valetanud?',
  'Mis on sinu lemmikfilm?',
  'Kas sa oled täna hommikul söönud?'
];

const LieDetector: React.FC = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [answers, setAnswers] = useState<Array<{ question: string; answer: string; emotions: any }>>([]);
  const [currentEmotions, setCurrentEmotions] = useState<any>(null);

  const handleTranscript = useCallback((transcript: string) => {
    if (transcript && currentQuestionIndex < questions.length) {
      setAnswers(prev => [...prev, {
        question: questions[currentQuestionIndex],
        answer: transcript,
        emotions: currentEmotions
      }]);
      setCurrentQuestionIndex(prev => prev + 1);
      setIsListening(false);
    }
  }, [currentQuestionIndex, currentEmotions]);

  const handleNextQuestion = () => {
    setIsListening(true);
  };

  const handleEmotionsUpdate = (emotions: any) => {
    setCurrentEmotions(emotions);
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
            </Segment>
          ) : (
            <Card fluid>
              <Card.Content>
                <Card.Header>Tulemused</Card.Header>
                <Card.Description>
                  <List divided relaxed>
                    {answers.map((item, index) => (
                      <List.Item key={index}>
                        <List.Content>
                          <List.Header>Küsimus: {item.question}</List.Header>
                          <List.Description>
                            <strong>Vastus:</strong> {item.answer}
                            <div style={{ marginTop: '0.5em' }}>
                              <strong>Emotsioonid:</strong>
                              <pre style={{ 
                                background: '#f8f9fa', 
                                padding: '0.5em', 
                                borderRadius: '4px',
                                fontSize: '0.9em' 
                              }}>
                                {JSON.stringify(item.emotions, null, 2)}
                              </pre>
                            </div>
                          </List.Description>
                        </List.Content>
                      </List.Item>
                    ))}
                  </List>
                </Card.Description>
              </Card.Content>
            </Card>
          )}
        </Grid.Column>
      </Grid.Row>
    </Grid>
  );
};

export default LieDetector; 