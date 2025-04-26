import React, { useEffect, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';
import { Message, Dimmer, Loader } from 'semantic-ui-react';

interface VideoAnalysisProps {
  onEmotionsUpdate: (emotions: any) => void;
}

const VideoAnalysis: React.FC<VideoAnalysisProps> = ({ onEmotionsUpdate }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadModels = async () => {
      try {
        console.log('Alustame mudelite laadimist...');
        const MODEL_URL = '/models';
        
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL)
        ]);

        console.log('Mudelid edukalt laaditud!');
        setIsModelLoaded(true);
      } catch (error) {
        console.error('Mudelite laadimine ebaõnnestus:', error);
        setError('Mudelite laadimine ebaõnnestus');
      }
    };

    loadModels();
  }, []);

  useEffect(() => {
    let videoStream: MediaStream | null = null;

    const startVideo = async () => {
      if (videoRef.current) {
        try {
          console.log('Proovime kaamerat käivitada...');
          const stream = await navigator.mediaDevices.getUserMedia({
            video: {
              width: 720,
              height: 560,
              facingMode: 'user'
            }
          });
          
          videoRef.current.srcObject = stream;
          videoStream = stream;
          console.log('Kaamera edukalt käivitatud!');
        } catch (error) {
          console.error('Kaamera käivitamine ebaõnnestus:', error);
          setError('Kaamera käivitamine ebaõnnestus. Palun kontrollige, kas brauser on saanud loa kaamera kasutamiseks.');
        }
      }
    };

    if (isModelLoaded) {
      startVideo();
    }

    // Puhastame video streami kui komponent unmount'itakse
    return () => {
      if (videoStream) {
        videoStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isModelLoaded]);

  const handleVideoPlay = () => {
    if (!canvasRef.current || !videoRef.current) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;

    const displaySize = { width: video.width, height: video.height };
    faceapi.matchDimensions(canvas, displaySize);

    const interval = setInterval(async () => {
      if (video.paused || video.ended) return;

      try {
        const detections = await faceapi
          .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
          .withFaceLandmarks()
          .withFaceExpressions();

        if (detections && detections.length > 0) {
          const resizedDetections = faceapi.resizeResults(detections, displaySize);
          
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            faceapi.draw.drawDetections(canvas, resizedDetections);
            faceapi.draw.drawFaceExpressions(canvas, resizedDetections);
          }

          if (detections[0].expressions) {
            onEmotionsUpdate(detections[0].expressions);
          }
        }
      } catch (error) {
        console.error('Näo tuvastamine ebaõnnestus:', error);
      }
    }, 100);

    return () => clearInterval(interval);
  };

  return (
    <div className="video-analysis" style={{ position: 'relative' }}>
      {!isModelLoaded && (
        <Dimmer active>
          <Loader>Laen mudeleid...</Loader>
        </Dimmer>
      )}
      {error && (
        <Message negative>
          <Message.Header>Viga</Message.Header>
          <p>{error}</p>
        </Message>
      )}
      <div style={{ position: 'relative' }}>
        <video
          ref={videoRef}
          width="720"
          height="560"
          autoPlay
          playsInline
          muted
          onPlay={handleVideoPlay}
          style={{ 
            transform: 'scaleX(-1)',
            maxWidth: '100%',
            height: 'auto'
          }}
        />
        <canvas 
          ref={canvasRef} 
          style={{ 
            position: 'absolute',
            top: 0,
            left: 0,
            transform: 'scaleX(1)',
            maxWidth: '100%',
            height: 'auto'
          }} 
        />
      </div>
    </div>
  );
};

export default VideoAnalysis; 