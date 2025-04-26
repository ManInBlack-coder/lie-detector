#!/bin/bash

# Loome vajaliku kausta
mkdir -p ../public/models

# Laadime alla face-api.js mudelid
cd ../public/models

# TinyFaceDetector mudel
wget https://github.com/justadudewhohacks/face-api.js/raw/master/weights/tiny_face_detector_model-weights_manifest.json
wget https://github.com/justadudewhohacks/face-api.js/raw/master/weights/tiny_face_detector_model-shard1

# Face Landmark mudel
wget https://github.com/justadudewhohacks/face-api.js/raw/master/weights/face_landmark_68_model-weights_manifest.json
wget https://github.com/justadudewhohacks/face-api.js/raw/master/weights/face_landmark_68_model-shard1

# Face Expression mudel
wget https://github.com/justadudewhohacks/face-api.js/raw/master/weights/face_expression_model-weights_manifest.json
wget https://github.com/justadudewhohacks/face-api.js/raw/master/weights/face_expression_model-shard1

echo "Mudelid on edukalt alla laaditud!" 