import React, { useState, useRef, useCallback } from 'react';
import { Camera, X, RotateCcw, Check, Download, Share2 } from 'lucide-react';
import { vibrate, shareContent } from '../utils/gestures';

interface CameraCaptureProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture?: (imageData: string) => void;
  title?: string;
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({
  isOpen,
  onClose,
  onCapture,
  title = "Capture Your Dish"
}) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const startCamera = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      });
      
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play();
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('Unable to access camera. Please check permissions.');
    } finally {
      setIsLoading(false);
    }
  }, [facingMode]);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  }, [stream]);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert to base64 image
    const imageData = canvas.toDataURL('image/jpeg', 0.8);
    setCapturedImage(imageData);
    
    // Add haptic feedback
    vibrate(100);
    
    // Stop camera after capture
    stopCamera();
  }, [stopCamera]);

  const toggleCamera = useCallback(() => {
    stopCamera();
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  }, [stopCamera]);

  const retakePhoto = useCallback(() => {
    setCapturedImage(null);
    startCamera();
  }, [startCamera]);

  const savePhoto = useCallback(() => {
    if (capturedImage) {
      onCapture?.(capturedImage);
      onClose();
    }
  }, [capturedImage, onCapture, onClose]);

  const downloadPhoto = useCallback(() => {
    if (!capturedImage) return;

    const link = document.createElement('a');
    link.href = capturedImage;
    link.download = `chefspeak-dish-${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    vibrate(50);
  }, [capturedImage]);

  const sharePhoto = useCallback(async () => {
    if (!capturedImage) return;

    try {
      // Convert data URL to blob
      const response = await fetch(capturedImage);
      const blob = await response.blob();
      
      if (navigator.share && navigator.canShare) {
        const file = new File([blob], `chefspeak-dish-${Date.now()}.jpg`, { type: 'image/jpeg' });
        
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: 'My ChefSpeak Creation',
            text: 'Check out what I cooked with ChefSpeak!',
            files: [file]
          });
          return;
        }
      }
      
      // Fallback: use the shareContent utility
      await shareContent({
        title: 'My ChefSpeak Creation',
        text: 'Check out what I cooked with ChefSpeak!',
        url: window.location.href
      });
      
    } catch (error) {
      console.error('Error sharing photo:', error);
      // Fallback to download
      downloadPhoto();
    }
  }, [capturedImage, downloadPhoto]);

  React.useEffect(() => {
    if (isOpen && !capturedImage) {
      startCamera();
    }
    
    return () => {
      stopCamera();
    };
  }, [isOpen, capturedImage, startCamera, stopCamera]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/50 to-transparent">
        <div className="safe-area-top flex items-center justify-between p-4">
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-black/30 backdrop-blur-sm text-white hover:bg-black/50 transition-all min-h-[44px] min-w-[44px]"
          >
            <X className="w-6 h-6" />
          </button>
          
          <h1 className="text-white font-semibold text-lg">{title}</h1>
          
          {stream && !capturedImage && (
            <button
              onClick={toggleCamera}
              className="p-2 rounded-full bg-black/30 backdrop-blur-sm text-white hover:bg-black/50 transition-all min-h-[44px] min-w-[44px]"
              title="Switch camera"
            >
              <RotateCcw className="w-6 h-6" />
            </button>
          )}
        </div>
      </div>

      {/* Camera View */}
      <div className="relative w-full h-full flex items-center justify-center">
        {/* Loading State */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black">
            <div className="text-center text-white">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
              <p>Starting camera...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black">
            <div className="text-center text-white max-w-sm mx-auto p-6">
              <Camera className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-semibold mb-2">Camera Error</p>
              <p className="text-gray-300 mb-6">{error}</p>
              <button
                onClick={startCamera}
                className="bg-gradient-to-r from-warm-green-500 to-terracotta-500 text-white px-6 py-3 rounded-xl font-medium hover:from-warm-green-600 hover:to-terracotta-600 transition-all"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Video Stream */}
        {stream && !capturedImage && (
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            playsInline
            muted
          />
        )}

        {/* Captured Image */}
        {capturedImage && (
          <img
            src={capturedImage}
            alt="Captured dish"
            className="w-full h-full object-cover"
          />
        )}

        {/* Hidden Canvas for Capture */}
        <canvas ref={canvasRef} className="hidden" />
      </div>

      {/* Controls */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent">
        <div className="safe-area-bottom p-6">
          {!capturedImage ? (
            /* Capture Controls */
            <div className="flex items-center justify-center">
              <button
                onClick={capturePhoto}
                disabled={!stream || isLoading}
                className="w-20 h-20 bg-white rounded-full border-4 border-gray-300 shadow-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                <div className="w-16 h-16 bg-white rounded-full border-2 border-gray-400"></div>
              </button>
            </div>
          ) : (
            /* Review Controls */
            <div className="flex items-center justify-between">
              <button
                onClick={retakePhoto}
                className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-3 rounded-xl font-medium transition-all min-h-[52px]"
              >
                <RotateCcw className="w-5 h-5" />
                Retake
              </button>
              
              <div className="flex gap-3">
                <button
                  onClick={downloadPhoto}
                  className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all min-h-[52px] min-w-[52px]"
                  title="Download"
                >
                  <Download className="w-5 h-5" />
                </button>
                
                <button
                  onClick={sharePhoto}
                  className="p-3 bg-green-600 hover:bg-green-700 text-white rounded-xl transition-all min-h-[52px] min-w-[52px]"
                  title="Share"
                >
                  <Share2 className="w-5 h-5" />
                </button>
                
                <button
                  onClick={savePhoto}
                  className="flex items-center gap-2 bg-gradient-to-r from-warm-green-500 to-terracotta-500 hover:from-warm-green-600 hover:to-terracotta-600 text-white px-6 py-3 rounded-xl font-medium transition-all min-h-[52px]"
                >
                  <Check className="w-5 h-5" />
                  Save
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Hook for camera permissions
export const useCameraPermission = () => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isSupported, setIsSupported] = useState(true);

  React.useEffect(() => {
    const checkPermission = async () => {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setIsSupported(false);
        return;
      }

      try {
        const result = await navigator.permissions.query({ name: 'camera' as PermissionName });
        setHasPermission(result.state === 'granted');
        
        result.addEventListener('change', () => {
          setHasPermission(result.state === 'granted');
        });
      } catch (error) {
        console.log('Permissions API not supported');
        // Try to access camera to test permission
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          stream.getTracks().forEach(track => track.stop());
          setHasPermission(true);
        } catch (err) {
          setHasPermission(false);
        }
      }
    };

    checkPermission();
  }, []);

  const requestPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach(track => track.stop());
      setHasPermission(true);
      return true;
    } catch (error) {
      setHasPermission(false);
      return false;
    }
  };

  return { hasPermission, isSupported, requestPermission };
}; 