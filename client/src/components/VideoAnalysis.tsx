import React, { useEffect, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';
import { Message } from 'semantic-ui-react';

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

        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }

        if (detections && detections.length > 0) {
          const resizedDetections = faceapi.resizeResults(detections, displaySize);
          
          if (ctx) {
            faceapi.draw.drawDetections(canvas, resizedDetections);
            faceapi.draw.drawFaceExpressions(canvas, resizedDetections);
          }

          if (detections[0].expressions) {
            onEmotionsUpdate(detections[0].expressions);
          }
        } else {
          // Kui nägu ei tuvastatud, saadame neutraalsed emotsioonid
          onEmotionsUpdate({
            neutral: 1,
            happy: 0,
            sad: 0,
            angry: 0,
            fearful: 0,
            disgusted: 0,
            surprised: 0
          });
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
        <div 
          style={{ 
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000
          }}
        >
          <div style={{ color: 'white', textAlign: 'center' }}>
            <div className="loading-spinner" style={{ 
              width: '50px', 
              height: '50px',
              border: '3px solid #f3f3f3',
              borderTop: '3px solid #3498db',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 10px auto'
            }} />
            <div>Laen mudeleid...</div>
          </div>
        </div>
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
            transform: 'scaleX(1)',
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
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default VideoAnalysis; 