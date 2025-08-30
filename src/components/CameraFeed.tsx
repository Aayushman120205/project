// import React, { useRef, useEffect, useState } from 'react';
// import { FaceMesh } from '@mediapipe/face_mesh';
// import { Camera } from '@mediapipe/camera_utils';

// interface CameraFeedProps {
//   onEyeOpenness: (openness: number) => void;
//   onFaceDetected: (detected: boolean) => void;
// }

// const CameraFeed: React.FC<CameraFeedProps> = ({ onEyeOpenness, onFaceDetected }) => {
//   const videoRef = useRef<HTMLVideoElement>(null);
//   const canvasRef = useRef<HTMLCanvasElement>(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     let faceMesh: FaceMesh | null = null;
//     let camera: Camera | null = null;
//     let stream: MediaStream | null = null;

//     const initializeCamera = async () => {
//       try {
//         if (!videoRef.current || !canvasRef.current) return;

//         stream = await navigator.mediaDevices.getUserMedia({ video: true });
//         videoRef.current.srcObject = stream;

//         faceMesh = new FaceMesh({
//           locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
//         });

//         faceMesh.setOptions({
//           maxNumFaces: 1,
//           refineLandmarks: true,
//           minDetectionConfidence: 0.5,
//           minTrackingConfidence: 0.5,
//         });

//         faceMesh.onResults((results) => {
//           const canvas = canvasRef.current;
//           const ctx = canvas?.getContext('2d');
//           if (!canvas || !ctx || !videoRef.current) return;

//           canvas.width = videoRef.current.videoWidth;
//           canvas.height = videoRef.current.videoHeight;

//           ctx.clearRect(0, 0, canvas.width, canvas.height);
//           ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

//           if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
//             onFaceDetected(true);
//             const landmarks = results.multiFaceLandmarks[0];
//             const leftEye = [145, 159];
//             const rightEye = [374, 386];

//             ctx.fillStyle = 'lime';
//             leftEye.forEach(index => {
//               const point = landmarks[index];
//               if (point) {
//                 ctx.beginPath();
//                 ctx.arc(point.x * canvas.width, point.y * canvas.height, 3, 0, 2 * Math.PI);
//                 ctx.fill();
//               }
//             });

//             ctx.fillStyle = 'cyan';
//             rightEye.forEach(index => {
//               const point = landmarks[index];
//               if (point) {
//                 ctx.beginPath();
//                 ctx.arc(point.x * canvas.width, point.y * canvas.height, 3, 0, 2 * Math.PI);
//                 ctx.fill();
//               }
//             });

//           if (landmarks[145] && landmarks[159] && landmarks[374] && landmarks[386]) {
//             const leftEyeHeight = Math.abs(landmarks[159].y - landmarks[145].y);
//             const rightEyeHeight = Math.abs(landmarks[386].y - landmarks[374].y);
//             const avgEyeHeight = (leftEyeHeight + rightEyeHeight) / 2;

//             const refDistance = Math.abs(landmarks[362].x - landmarks[133].x);

//             const normalizedOpenness = avgEyeHeight / refDistance;

//             const eyeOpenness = Math.min(100, Math.max(0, normalizedOpenness * 500));
//             onEyeOpenness(eyeOpenness);
//           }

//           } else {
//             onFaceDetected(false);
//             onEyeOpenness(0);
//           }
//         });

//         videoRef.current.onloadedmetadata = async () => {
//           await videoRef.current?.play();
//           camera = new Camera(videoRef.current!, {
//             onFrame: async () => {
//               if (videoRef.current) {
//                 await faceMesh!.send({ image: videoRef.current });
//               }
//             },
//             width: 640,
//             height: 480,
//           });

//           await camera.start();
//           setIsLoading(false);
//         };
//       } catch (err) {
//         console.error("Camera init error:", err);
//         setError('Failed to initialize camera');
//         setIsLoading(false);
//       }
//     };

//     initializeCamera();

//     return () => {
//       if (camera) camera.stop();
//       if (stream) {
//         stream.getTracks().forEach(track => track.stop());
//       }
//     };
//   }, [onEyeOpenness, onFaceDetected]);

//   if (error) {
//     return (
//       <div className="w-full h-64 bg-gray-800 rounded-lg flex items-center justify-center">
//         <p className="text-red-400">{error}</p>
//       </div>
//     );
//   }

//   return (
//     <div className="relative w-full h-64 bg-black rounded-lg overflow-hidden">
//       {isLoading && (
//         <div className="absolute inset-0 bg-gray-800 flex items-center justify-center z-10">
//           <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
//           <span className="ml-2 text-blue-400">Initializing Camera...</span>
//         </div>
//       )}
//       <video
//         ref={videoRef}
//         className="absolute inset-0 w-full h-full object-cover"
//         autoPlay
//         playsInline
//         muted
//       />
//       <canvas
//         ref={canvasRef}
//         className="absolute inset-0 w-full h-full object-cover"
//       />
//       <div className="absolute top-2 left-2 bg-black/70 rounded px-2 py-1 text-xs text-green-400">
//         🔴 LIVE
//       </div>
//     </div>
//   );
// };

// export default CameraFeed;


import React, { useRef, useEffect, useState } from 'react';
import { FaceMesh } from '@mediapipe/face_mesh';
import { Camera } from '@mediapipe/camera_utils';

interface CameraFeedProps {
  onEyeOpenness: (openness: number) => void;
  onFaceDetected: (detected: boolean) => void;
}

const CameraFeed: React.FC<CameraFeedProps> = ({ onEyeOpenness, onFaceDetected }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Smoothed eye openness
  const [smoothedOpenness, setSmoothedOpenness] = useState(100);
  const smoothingFactor = 0.2; // adjust between 0.1-0.3 for smoother/faster response

  useEffect(() => {
    let faceMesh: FaceMesh | null = null;
    let camera: Camera | null = null;
    let stream: MediaStream | null = null;

    const initializeCamera = async () => {
      try {
        if (!videoRef.current || !canvasRef.current) return;

        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        videoRef.current.srcObject = stream;

        faceMesh = new FaceMesh({
          locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
        });

        faceMesh.setOptions({
          maxNumFaces: 1,
          refineLandmarks: true,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });

        faceMesh.onResults((results) => {
          const canvas = canvasRef.current;
          const ctx = canvas?.getContext('2d');
          if (!canvas || !ctx || !videoRef.current) return;

          canvas.width = videoRef.current.videoWidth;
          canvas.height = videoRef.current.videoHeight;

          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

          if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
            onFaceDetected(true);
            const landmarks = results.multiFaceLandmarks[0];

            // Eye landmark indices
            const leftEyeIndices = [33, 133, 160, 159, 158, 157, 173, 144, 145, 153, 154, 155];
            const rightEyeIndices = [263, 362, 387, 386, 385, 384, 398, 373, 374, 380, 381, 382];

            // Draw left eye
            ctx.strokeStyle = 'lime';
            ctx.lineWidth = 2;
            ctx.beginPath();
            leftEyeIndices.forEach((index, i) => {
              const point = landmarks[index];
              if (point) {
                const x = point.x * canvas.width;
                const y = point.y * canvas.height;
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
              }
            });
            ctx.closePath();
            ctx.stroke();

            // Draw right eye
            ctx.strokeStyle = 'cyan';
            ctx.lineWidth = 2;
            ctx.beginPath();
            rightEyeIndices.forEach((index, i) => {
              const point = landmarks[index];
              if (point) {
                const x = point.x * canvas.width;
                const y = point.y * canvas.height;
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
              }
            });
            ctx.closePath();
            ctx.stroke();

            // Eye openness calculation
            if (landmarks[145] && landmarks[159] && landmarks[374] && landmarks[386]) {
              const leftEyeHeight = Math.abs(landmarks[159].y - landmarks[145].y);
              const rightEyeHeight = Math.abs(landmarks[386].y - landmarks[374].y);
              const avgEyeHeight = (leftEyeHeight + rightEyeHeight) / 2;

              const refDistance = Math.abs(landmarks[362].x - landmarks[133].x);
              const normalizedOpenness = avgEyeHeight / refDistance;
              const rawOpenness = Math.min(100, Math.max(0, normalizedOpenness * 500));

              // Exponential smoothing
              const newSmoothed = smoothedOpenness + (rawOpenness - smoothedOpenness) * smoothingFactor;
              setSmoothedOpenness(newSmoothed);

              onEyeOpenness(newSmoothed);
            }
          } else {
            onFaceDetected(false);
            setSmoothedOpenness(0);
            onEyeOpenness(0);
          }
        });

        videoRef.current.onloadedmetadata = async () => {
          await videoRef.current?.play();
          camera = new Camera(videoRef.current!, {
            onFrame: async () => {
              if (videoRef.current) {
                await faceMesh!.send({ image: videoRef.current });
              }
            },
            width: 640,
            height: 480,
          });

          await camera.start();
          setIsLoading(false);
        };
      } catch (err) {
        console.error("Camera init error:", err);
        setError('Failed to initialize camera');
        setIsLoading(false);
      }
    };

    initializeCamera();

    return () => {
      if (camera) camera.stop();
      if (stream) stream.getTracks().forEach(track => track.stop());
    };
  }, [onEyeOpenness, onFaceDetected, smoothedOpenness]);

  if (error) {
    return (
      <div className="w-full h-64 bg-gray-800 rounded-lg flex items-center justify-center">
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-64 bg-black rounded-lg overflow-hidden">
      {isLoading && (
        <div className="absolute inset-0 bg-gray-800 flex items-center justify-center z-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
          <span className="ml-2 text-blue-400">Initializing Camera...</span>
        </div>
      )}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        autoPlay
        playsInline
        muted
      />
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute top-2 left-2 bg-black/70 rounded px-2 py-1 text-xs text-green-400">
        🔴 LIVE
      </div>
    </div>
  );
};

export default CameraFeed;
