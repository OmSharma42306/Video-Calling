import React, { useEffect, useState, useRef } from 'react';
import { Camera, Mic, MicOff, Video, VideoOff, PhoneOff, Phone } from 'lucide-react';

const wsUrl = import.meta.env.VITE_WEBSOCKET_URL;
export function Receiver() {
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const [isVideoReceived, setIsVideoReceived] = useState(false);
    const [isManualPlayRequired, setIsManualPlayRequired] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  
    const handleVideoPlay = () => {
      videoRef.current?.play().catch((err) => {
        console.error("Video playback error:", err);
        setIsManualPlayRequired(true);
      });
    }
  
    useEffect(() => {
      const socket = new WebSocket(wsUrl);
      setSocket(socket);
  
      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ]
      });
      peerConnectionRef.current = pc;
  
      socket.onopen = () => {
        socket.send(JSON.stringify({type: 'receiver'}));
      };
  
      pc.ontrack = (event) => {
        console.log("Track received:", event.track);
        if (videoRef.current) {
          videoRef.current.srcObject = new MediaStream([event.track]);
          
          // Attempt to play, but be prepared to handle manual play
          videoRef.current.play().catch((err) => {
            console.error("Video playback error:", err);
            setIsManualPlayRequired(true);
          });
          
          setIsVideoReceived(true);
        }
      };
  
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket.send(JSON.stringify({type: 'iceCandidate', candidate: event.candidate}));
        }
      };
  
      socket.onmessage = async (event) => {
        const message = JSON.parse(event.data);
        
        if (message.type === 'createOffer') {
          try {
            await pc.setRemoteDescription(new RTCSessionDescription(message.sdp));
            
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
  
            socket.send(JSON.stringify({type: 'createAnswer', sdp: pc.localDescription}));
          } catch (error) {
            console.error("Error handling offer:", error);
          }
        } else if (message.type === 'iceCandidate') {
          try {
            await pc.addIceCandidate(new RTCIceCandidate(message.candidate));
          } catch (error) {
            console.error("Error adding ICE candidate:", error);
          }
        }
      };
  
      return () => {
        socket.close();
        pc.close();
      };
    }, []);
  
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
        <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
          <h2 className="text-2xl font-bold mb-4 text-center text-gray-800">Incoming Call - Receiver</h2>
          
          <div className="relative mb-4 bg-gray-200 rounded-lg overflow-hidden">
            <video 
              ref={videoRef} 
              className="w-full h-64 object-cover"
              playsInline
              muted
            />
            {!isVideoReceived && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-500 bg-opacity-50">
                <Camera className="text-white w-16 h-16" />
              </div>
            )}
            
            {isManualPlayRequired && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-500 bg-opacity-50">
                <button 
                  onClick={handleVideoPlay}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
                >
                  Play Video
                </button>
              </div>
            )}
          </div>
  
          <div className="flex justify-center space-x-4">
            <button 
              className="bg-red-500 text-white p-3 rounded-full hover:bg-red-600 transition"
            >
              <PhoneOff className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    );
  }