const express = require('express');
const multer = require('multer');
const cors = require('cors');
const { Storage } = require('@google-cloud/storage');
const speech = require('@google-cloud/speech');
const fs = require('fs');
const path = require('path');

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(cors());
app.use(express.json());

const client = new speech.SpeechClient({
  keyFilename: path.join(__dirname, 'google-credentials.json')
});

app.post('/transcribe', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file provided' });
    }

    const audioBytes = fs.readFileSync(req.file.path);
    const audio = {
      content: audioBytes.toString('base64'),
    };
    
    const config = {
      encoding: 'LINEAR16',
      sampleRateHertz: 48000,
      languageCode: 'et-EE',
    };
    
    const request = {
      audio: audio,
      config: config,
    };

    const [response] = await client.recognize(request);
    const transcription = response.results
      .map(result => result.alternatives[0].transcript)
      .join('\n');

    // Kustutame ajutise faili
    fs.unlinkSync(req.file.path);

    res.json({ transcript: transcription });
  } catch (error) {
    console.error('Transcription error:', error);
    res.status(500).json({ error: 'Failed to transcribe audio' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 