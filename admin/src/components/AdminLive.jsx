

import { useCallback, useEffect, useState, useRef } from "react"; 
import { useSocket } from "../providers/Socket";
import { usePeer } from "../providers/Peer";
import * as blazeface from "@tensorflow-models/blazeface";
import "@tensorflow/tfjs";
import Message from '../shared/Message';
import TabMonitor from "./TabMonitor/TabMonitor";

const AdminLive = () => {
  const [alertMsg, setAlertMsg] = useState('');
  const { socket } = useSocket();
  const {
    peer,
    createOffer,
    createAnswer,
    setRemoteAns,
    sendStream,
    remoteStream,
  } = usePeer();

  const [myStream, setMyStream] = useState(null);
  const [remoteEmailId, setRemoteEmailId] = useState();

  // Refs for video elements
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const modelRef = useRef(null); 
  const detectionIntervalRef = useRef(null); 

  // --- Get User Media ---
  const getUserMediaStream = useCallback(async () => {
    try {
      console.log("Requesting user media...");
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true, 
      });
      console.log("User media obtained:", stream);
      setMyStream(stream);

      if (peer && stream) {
          console.log("Sending stream to peer");
          sendStream(stream);
      }
    } catch (err) {
      console.error("Error accessing media devices:", err);
      setAlertMsg("Error: Could not access camera or microphone. Please check permissions.");
    }
  }, [setMyStream, sendStream, peer]); 

  // 

  const handleNewUserJoined = useCallback(
    async (data) => {
      const { emailId } = data;
      console.log("New user joined", emailId);
      if (!peer) {
          console.error("Peer connection not available for creating offer");
          return;
      }
      const offer = await createOffer();
      socket.emit("call-user", { emailId, offer });
      setRemoteEmailId(emailId);
    },
    [createOffer, socket, peer] // Added peer
  );

  const handleIncommingCall = useCallback(
    async (data) => {
      const { from, offer } = data;
      console.log("Incoming data", from, offer);
      if (!peer) {
          console.error("Peer connection not available for creating answer");
          return;
      }
      const ans = await createAnswer(offer);
      socket.emit("call-accepted", { emailId: from, ans });
      setRemoteEmailId(from);
    },
    [createAnswer, socket, peer] // Added peer
  );

 const handleCallAccepted = useCallback(
    async (data) => {
      const { ans } = data;
      console.log("Call got accepted", ans);
      if (!peer) {
         console.error("Peer connection not available for setting remote answer");
         return;
      }
      await setRemoteAns(ans);
      // Maybe trigger sending the stream *after* call is accepted and connection established
      // if (myStream) {
      //     console.log("Resending stream after call accepted");
      //     sendStream(myStream);
      // }
    },
    [setRemoteAns, peer] 
  );

  const handleNegotiationNeeded = useCallback(async () => {
    console.log('negotiation needed for:', remoteEmailId);
    if (!remoteEmailId || !peer) {
       console.warn("Skipping renegotiation: missing remoteEmailId or peer");
       return;
    }
    const offer = await createOffer();
    socket.emit('renegotiate', { emailId: remoteEmailId, offer });
  }, [createOffer, remoteEmailId, socket, peer]); // Added peer, socket

  const handleIceCandidate = useCallback((event) => {
    if (event.candidate && remoteEmailId) {
      socket.emit('ice-candidate', { candidate: event.candidate, to: remoteEmailId });
    }
  }, [socket, remoteEmailId]);

const handleUserLeft = useCallback(({ emailId }) => {
  console.log("User left:", emailId);
 
  if (emailId === remoteEmailId) {
     setRemoteEmailId(null);
     
     console.log("Cleared remote participant information.");
  }
}, [remoteEmailId]);

  useEffect(() => {
    if (!peer) return; 

    peer.addEventListener('icecandidate', handleIceCandidate);
    peer.addEventListener('negotiationneeded', handleNegotiationNeeded);
    // Listen for the remote track
    const handleTrack = (ev) => {
        console.log("Remote track received:", ev.streams);
        
    };
    peer.addEventListener('track', handleTrack);

    return () => {
      peer.removeEventListener('icecandidate', handleIceCandidate);
      peer.removeEventListener('negotiationneeded', handleNegotiationNeeded);
      peer.removeEventListener('track', handleTrack);
    };
  }, [peer, handleIceCandidate, handleNegotiationNeeded]); 

  
  useEffect(() => {
    if (!socket || !peer) return; 

    const handleIceCandidateEvent = ({ candidate }) => {
      if (candidate) {
          peer.addIceCandidate(new RTCIceCandidate(candidate)).catch(e => console.error("Error adding ICE candidate:", e));
      }
    };

    const handleRenegotiateEvent = async ({ from, offer }) => { 
      console.log("Renegotiation requested from:", from || remoteEmailId);
      const ans = await createAnswer(offer);
      socket.emit('call-accepted', { emailId: from || remoteEmailId, ans }); 
    };

    socket.on("user-joined", handleNewUserJoined);
    socket.on("incomming-call", handleIncommingCall);
    socket.on("call-accepted", handleCallAccepted);
    socket.on("ice-candidate", handleIceCandidateEvent);
    socket.on("renegotiate", handleRenegotiateEvent); 
socket.on('user-left', handleUserLeft);

    return () => {
      socket.off("user-joined", handleNewUserJoined);
      socket.off("incomming-call", handleIncommingCall);
      socket.off("call-accepted", handleCallAccepted);
      socket.off("ice-candidate", handleIceCandidateEvent);
      socket.off("renegotiate", handleRenegotiateEvent);
socket.on('user-left', handleUserLeft);
    };
   
  }, [socket, peer, handleNewUserJoined, handleIncommingCall, handleCallAccepted, createAnswer, remoteEmailId]);

  
  useEffect(() => {
    const loadModel = async () => {
       try {
           console.log("Loading Blazeface model...");
           modelRef.current = await blazeface.load();
           console.log("Blazeface model loaded successfully.");
       } catch (error) {
           console.error("Failed to load Blazeface model:", error);
           setAlertMsg("Error: Could not load face detection model.");
       }
    };
    loadModel();

    
    return () => {
       
        console.log("Face detection model resources might be released (if applicable).");
    }
  }, []); 

  // --- Start Face Detection ---
  useEffect(()=>{
  
    if (!modelRef.current || !myStream || !localVideoRef.current) {
      console.log("Face detection prerequisites not met (model, stream, or video element).");
      return; 
    }

    const videoElement = localVideoRef.current;
    let isDetecting = false; 

    const detectFace = async () => {
       
        if (!videoElement || videoElement.readyState < videoElement.HAVE_METADATA || isDetecting) {
            detectionIntervalRef.current = requestAnimationFrame(detectFace);
           
            return;
        }

        isDetecting = true; 

        try {
            const predictions = await modelRef.current.estimateFaces(videoElement, false /* returnTensors */);

            if (predictions.length === 0) {
                setAlertMsg("No face detected!No one is watching the stream");
                console.log("no face detected");
                setTimeout(()=>{
                  setAlertMsg("")
                },6000)
            } 
            else if (predictions.length>1){
             setAlertMsg("More then one faces are detecting by our system! You are cheating");
             setTimeout(()=>{
              setAlertMsg("")
             },3000)
            }
            else {
                
                 if (alertMsg === "Warning: No face detected!") {
                  return (
                    <div className="video-call flex h-screen w-screen bg-gray-900">
                      <div className="flex w-[70%] flex-col items-center bg-gray-800 p-6 rounded-lg shadow-lg overflow-hidden">
                        <h2 className="text-xl text-green-600 font-semibold mb-4">
                          Admin Live Stream
                        </h2>
                        <TabMonitor/>
                       
                        {alertMsg && (
                           <p className={`p-2 rounded mb-2 ${alertMsg.startsWith('Error:') ? 'bg-red-500 text-white' : 'bg-yellow-400 text-black'}`}>
                             {alertMsg}
                           </p>
                        )}
                 
                  
                        <div className={`relative w-full flex-grow grid gap-4 ${remoteStream ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
                 
                        
                          {myStream && (
                             <div className={`relative bg-black rounded-lg overflow-hidden ${!remoteStream ? 'md:col-span-1' : ''}`}> 
                                 <video
                                    ref={localVideoRef}
                                    className="w-full h-full object-cover border-2 border-green-500 shadow-md"
                                    autoPlay
                                    muted
                                    playsInline
                                 />
                                 <span className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-1 rounded">You</span>
                             </div>
                          )}
                 
                          
                          {remoteStream && (
                            <div className="relative bg-black rounded-lg overflow-hidden">
                              <video
                                ref={remoteVideoRef}
                                className="w-full h-full object-cover border-2 border-blue-500 shadow-md"
                                autoPlay
                                playsInline
                             
                              />
                            
                              {remoteEmailId && <span className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-1 rounded">{remoteEmailId}</span>}
                            </div>
                          )}
                 
                          {/* Optional: Placeholder if no streams are ready yet */}
                          {!myStream && !remoteStream && (
                             <div className="flex items-center justify-center text-gray-400 h-full">
                                 Waiting for video streams...
                             </div>
                          )}
                 
                        </div>
                      </div>
                      {/* Message Component outside the main video container */}
                      <Message />
                    </div>
                  );
                 }
                console.log("Face detected:", predictions.length);
            }
        } catch (error) {
            console.error("Error during face estimation:", error);
            // Avoid setting alert message here repeatedly on error
        } finally {
             isDetecting = false; // Reset flag
             // Continue the loop
             detectionIntervalRef.current = requestAnimationFrame(detectFace);
        }
    };


    const startDetection = () => {
        console.log("Video metadata loaded. Starting face detection loop.");

        if (detectionIntervalRef.current) {
            cancelAnimationFrame(detectionIntervalRef.current);
        }
        detectFace(); 
    }

    // Check if metadata is already loaded
    if (videoElement.readyState >= videoElement.HAVE_METADATA) {
        startDetection();
    } else {
        videoElement.addEventListener('loadedmetadata', startDetection);
    }

    // Cleanup function for the effect
    return () => {
        console.log("Stopping face detection loop.");
        if (detectionIntervalRef.current) {
            cancelAnimationFrame(detectionIntervalRef.current); 
        }
     
        if (videoElement) {
            videoElement.removeEventListener('loadedmetadata', startDetection);
        }
    
        if (alertMsg === "Warning: No face detected!") {
             setAlertMsg("");
        }
    };
    
  },[myStream, alertMsg]); 


  // --- Initial Media Request ---
  useEffect(() => {
    getUserMediaStream();
  }, [getUserMediaStream]); 


  useEffect(() => {
    if (myStream && localVideoRef.current) {
      console.log("Assigning local stream to video element");
      localVideoRef.current.srcObject = myStream;
    }
  }, [myStream]);

 
  useEffect(() => {
    if (remoteStream && remoteVideoRef.current) {
      console.log("Assigning remote stream to video element");
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);


    return (
    <div className="video-call flex h-screen w-screen bg-gray-900">
      <div className="flex w-[70%] flex-col items-center bg-gray-800 p-6 rounded-lg shadow-lg overflow-hidden">
        <h2 className="text-xl text-green-600 font-semibold mb-4">
          Admin Live Stream
        </h2>
        <TabMonitor/>
        {/* Display Alert Message */}
        {alertMsg && (
           <p className={`p-2 rounded mb-2 ${alertMsg.startsWith('Error:') ? 'bg-red-500 text-white' : 'bg-yellow-400 text-black'}`}>
             {alertMsg}
           </p>
        )}
 
      
        <div className={`relative w-full flex-grow grid gap-4 ${remoteStream ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
 
          {/* Local Video - Only render if myStream exists */}
          {myStream && (
             <div className={`relative bg-black rounded-lg overflow-hidden ${!remoteStream ? 'md:col-span-1' : ''}`}> {/* Ensure it takes full width if alone */}
                 <video
                    ref={localVideoRef}
                    className="w-full h-full object-cover border-2 border-green-500 shadow-md"
                    autoPlay
                    muted
                    playsInline
                 />
                 <span className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-1 rounded">You</span>
             </div>
          )}
 
          {/* Remote Video - Conditionally Rendered */}
          {remoteStream && (
            <div className="relative bg-black rounded-lg overflow-hidden">
              <video
                ref={remoteVideoRef}
                className="w-full h-full object-cover border-2 border-blue-500 shadow-md"
                autoPlay
                playsInline
         
              />
              {/* Display email only if it's set */}
              {remoteEmailId && <span className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-1 rounded">{remoteEmailId}</span>}
            </div>
          )}
 
      
          {!myStream && !remoteStream && (
             <div className="flex items-center justify-center text-gray-400 h-full">
                 Waiting for video streams...
             </div>
          )}
 
        </div>
      </div>
    
      <Message />
    </div>
  );
};

export default AdminLive;