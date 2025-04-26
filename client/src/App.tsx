import React from 'react';
import './App.css';
import LieDetector from './components/LieDetector';
import 'semantic-ui-css/semantic.min.css';
import { Container, Header, Segment } from 'semantic-ui-react';

function App() {
  return (
    <div className="App">
      <Segment inverted vertical textAlign="center" className="header-segment" style={{ padding: '2em 0em' }}>
        <Container>
          <Header as='h1' inverted>Valetamise Detektor</Header>
        </Container>
      </Segment>
      <Container style={{ marginTop: '2em' }}>
        <LieDetector />
      </Container>
    </div>
  );
}

export default App;
