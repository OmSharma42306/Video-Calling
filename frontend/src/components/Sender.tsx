import React, { useEffect, useState, useRef } from 'react';
import { Camera, Mic, MicOff, Video, VideoOff, PhoneOff, Phone } from 'lucide-react';

export function Sender() {
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const [isVideoEnabled, setIsVideoEnabled] = useState(false);
    const [isAudioEnabled, setIsAudioEnabled] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  
    useEffect(() => {
      const newSocket = new WebSocket("ws://localhost:8080");
      
      newSocket.onopen = () => {
        newSocket.send(JSON.stringify({type: 'sender'}));
      };
      
      setSocket(newSocket);
  
      return () => {
        newSocket.close();
      };
    }, []);
  
    async function startSendingVideo() {
      if (!socket) return;
  
      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ]
      });
      peerConnectionRef.current = pc;
  
      pc.onnegotiationneeded = async () => {
        try {
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          socket?.send(JSON.stringify({type: 'createOffer', sdp: pc.localDescription}));
        } catch (error) {
          console.error("Error creating offer:", error);
        }
      };
  
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket?.send(JSON.stringify({type: 'iceCandidate', candidate: event.candidate}));
        }
      };
  
      socket.onmessage = async (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'createAnswer') {
          await pc.setRemoteDescription(data.sdp);
        } else if (data.type === 'iceCandidate') {
          pc.addIceCandidate(data.candidate);
        }
      };
  
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true, 
          audio: true
        });
  
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
  
        stream.getTracks().forEach(track => {
          pc.addTrack(track, stream);
        });
  
        setIsVideoEnabled(true);
        setIsAudioEnabled(true);
      } catch (error) {
        console.error("Error accessing media devices:", error);
      }
    }
  
    function toggleVideo() {
      if (videoRef.current) {
        const videoTrack = videoRef.current.srcObject?.getVideoTracks()[0];
        if (videoTrack) {
          videoTrack.enabled = !videoTrack.enabled;
          setIsVideoEnabled(videoTrack.enabled);
        }
      }
    }
  
    function toggleAudio() {
      if (videoRef.current) {
        const audioTrack = videoRef.current.srcObject?.getAudioTracks()[0];
        if (audioTrack) {
          audioTrack.enabled = !audioTrack.enabled;
          setIsAudioEnabled(audioTrack.enabled);
        }
      }
    }
  
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
        <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md">
          <h2 className="text-2xl font-bold mb-4 text-center text-gray-800">Video Calling - Sender</h2>
          
          <div className="relative mb-4 bg-gray-200 rounded-lg overflow-hidden">
            <video 
              ref={videoRef} 
              className="w-full h-64 object-cover"
              muted 
              autoPlay 
              playsInline
            />
            {!isVideoEnabled && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-500 bg-opacity-50">
                <VideoOff className="text-white w-16 h-16" />
              </div>
            )}
          </div>
  
          <div className="flex justify-center space-x-4 mb-4">
            <button 
              onClick={startSendingVideo}
              className="bg-green-500 text-white p-3 rounded-full hover:bg-green-600 transition"
            >
              <Phone className="w-6 h-6" />
            </button>
  
            <button 
              onClick={toggleVideo}
              className={`p-3 rounded-full transition ${
                isVideoEnabled 
                  ? 'bg-blue-500 text-white hover:bg-blue-600' 
                  : 'bg-red-500 text-white hover:bg-red-600'
              }`}
            >
              {isVideoEnabled ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
            </button>
  
            <button 
              onClick={toggleAudio}
              className={`p-3 rounded-full transition ${
                isAudioEnabled 
                  ? 'bg-blue-500 text-white hover:bg-blue-600' 
                  : 'bg-red-500 text-white hover:bg-red-600'
              }`}
            >
              {isAudioEnabled ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>
    );
  }