import React from 'react';
import { Card, Icon, Progress, Label, Segment, Grid, List, SemanticCOLORS, SemanticICONS } from 'semantic-ui-react';
import { AnalysisResult } from '../utils/emotionAnalysis';

interface AnalysisResultCardProps {
  result: AnalysisResult['formattedResults'];
}

const getScoreColor = (score: number): SemanticCOLORS => {
  if (score >= 80) return 'green';
  if (score >= 60) return 'olive';
  if (score >= 40) return 'yellow';
  if (score >= 20) return 'orange';
  return 'red';
};

const getEmotionIcon = (emotion: string): SemanticICONS => {
  switch (emotion.toLowerCase()) {
    case 'happy': return 'smile outline';
    case 'sad': return 'frown outline';
    case 'angry': return 'fire';
    case 'fearful': return 'exclamation circle';
    case 'disgusted': return 'meh outline';
    case 'surprised': return 'star outline';
    case 'neutral': return 'minus';
    default: return 'question';
  }
};

const AnalysisResultCard: React.FC<AnalysisResultCardProps> = ({ result }) => {
  const scoreColor = getScoreColor(result.truthScore.percentage);

  return (
    <Card fluid>
      <Card.Content>
        <Card.Header>
          <Grid columns={2}>
            <Grid.Column>
              <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                <Icon name="question circle" /> {result.question}
              </div>
            </Grid.Column>
            <Grid.Column textAlign="right">
              <Label color={scoreColor} size="large">
                <Icon name="check circle" />
                {result.truthScore.percentage}% tõenäoline
              </Label>
            </Grid.Column>
          </Grid>
        </Card.Header>
        
        <Card.Description>
          <Segment raised>
            <Grid columns={2} divided>
              <Grid.Column width={12}>
                <h4><Icon name="comment" /> Vastus</h4>
                <div style={{
                  fontSize: '1.1em',
                  padding: '10px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '4px',
                  border: '1px solid #e9ecef',
                  marginTop: '5px',
                  wordWrap: 'break-word',
                  overflowWrap: 'break-word',
                  minHeight: '50px',
                  maxHeight: '150px',
                  overflowY: 'auto'
                }}>
                  "{result.answer}"
                </div>
              </Grid.Column>
              <Grid.Column width={4}>
                <h4><Icon name="chart bar" /> Usaldusväärsus</h4>
                <Progress 
                  percent={result.truthScore.confidence} 
                  color={scoreColor}
                  size="small"
                  style={{ marginBottom: '5px' }}
                  label={`${result.truthScore.evaluation} (${result.truthScore.confidence}% kindlus)`}
                />
              </Grid.Column>
            </Grid>
          </Segment>

          <Segment>
            <h4><Icon name="heart outline" /> Emotsionaalne Seisund</h4>
            <Grid columns={2}>
              <Grid.Column>
                <div style={{ marginBottom: '10px' }}>
                  <Label color="blue" size="large" style={{ marginBottom: '5px' }}>
                    <Icon name={getEmotionIcon(result.emotionalState.primary)} />
                    {result.emotionalState.primary}
                  </Label>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                  {result.emotionalState.secondary.map((emotion, index) => (
                    <Label key={index} size="medium">
                      <Icon name={getEmotionIcon(emotion)} />
                      {emotion}
                    </Label>
                  ))}
                </div>
              </Grid.Column>
              <Grid.Column>
                <Progress 
                  percent={result.emotionalState.stability} 
                  color="blue"
                  size="small"
                  style={{ marginBottom: '5px' }}
                  label={`Emotsionaalne stabiilsus: ${result.emotionalState.stability}%`}
                />
              </Grid.Column>
            </Grid>
          </Segment>

          {result.deceptionMarkers.found && (
            <Segment color="red">
              <h4><Icon name="warning sign" /> Valetamise Märgid</h4>
              <List divided relaxed style={{ maxHeight: '200px', overflowY: 'auto' }}>
                {result.deceptionMarkers.indicators.map((indicator, index) => (
                  <List.Item key={index}>
                    <List.Icon name="exclamation triangle" color="red" />
                    <List.Content style={{ wordBreak: 'break-word' }}>
                      {indicator}
                    </List.Content>
                  </List.Item>
                ))}
              </List>
            </Segment>
          )}

          {result.deceptionMarkers.microExpressions.length > 0 && (
            <Segment color="yellow">
              <h4><Icon name="eye" /> Mikro Ilmed</h4>
              <List divided relaxed style={{ maxHeight: '200px', overflowY: 'auto' }}>
                {result.deceptionMarkers.microExpressions.map((expression, index) => (
                  <List.Item key={index}>
                    <List.Icon name="lightning" color="yellow" />
                    <List.Content style={{ wordBreak: 'break-word' }}>
                      {expression}
                    </List.Content>
                  </List.Item>
                ))}
              </List>
            </Segment>
          )}

          {result.emotionalState.baseline.significantChanges.length > 0 && (
            <Segment color="teal">
              <h4><Icon name="exchange" /> Olulised Muutused Baasemotsioonidest</h4>
              <List divided relaxed style={{ maxHeight: '200px', overflowY: 'auto' }}>
                {result.emotionalState.baseline.significantChanges.map((change, index) => (
                  <List.Item key={index}>
                    <List.Icon name="arrow right" color="teal" />
                    <List.Content style={{ wordBreak: 'break-word' }}>
                      {change}
                    </List.Content>
                  </List.Item>
                ))}
              </List>
            </Segment>
          )}
        </Card.Description>
      </Card.Content>
    </Card>
  );
};

export default AnalysisResultCard; 