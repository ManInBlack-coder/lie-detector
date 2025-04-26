declare module 'face-api.js' {
  export const nets: any;
  export const draw: any;
  export function matchDimensions(canvas: HTMLCanvasElement, dimensions: any): void;
  export function resizeResults(detections: any, dimensions: any): any;
  export class TinyFaceDetectorOptions {
    constructor();
  }
  export function detectAllFaces(input: HTMLVideoElement | HTMLCanvasElement, options?: any): any;
} 