import React, { useState, useEffect } from 'react';

const TestCapture = () => {
  const [stream, setStream] = useState(null);
  const [error, setError] = useState('');
  const [isPermissionDenied, setIsPermissionDenied] = useState(false);

  useEffect(() => {
    // Attempt to access the camera directly
    const getCameraStream = async () => {
      try {
        console.log('Requesting camera access...');
        const videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
        setStream(videoStream);
        console.log('Camera stream obtained.');
      } catch (err) {
        setError('Error accessing camera: ' + err.message);
        console.error('Error accessing camera:', err);

        if (err.name === 'NotAllowedError') {
          setIsPermissionDenied(true);
        }
      }
    };

    getCameraStream();

    // Clean up the stream when the component unmounts
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  return (
    <div>
      <h1>Webcam Test</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {isPermissionDenied && (
        <p style={{ color: 'red' }}>
          Permission to access the camera was denied. Please allow camera access in your browser settings.
        </p>
      )}
      {stream ? (
        <video
          autoPlay
          playsInline
          muted
          ref={videoElement => {
            if (videoElement) {
              videoElement.srcObject = stream;
            }
          }}
          style={{ width: '100%', maxWidth: '600px', height: 'auto' }}
        />
      ) : (
        <p>Loading camera...</p>
      )}
    </div>
  );
};

export default TestCapture;
