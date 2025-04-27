import { useCallback, useEffect, useState, useRef } from "react";
import { useSocket } from "../../providers/Socket";
import { usePeer } from "../../providers/Peer";
import { useNavigate } from "react-router-dom";
import CallEndIcon from "@mui/icons-material/CallEnd";

// Room ID for consistent room joining - must match AdminLive's DEFAULT_ROOM_ID
const DEFAULT_ROOM_ID = "admin-classroom-live";

const StudentLive = () => {
  const [alertMsg, setAlertMsg] = useState("");
  const [roomId, setRoomId] = useState(DEFAULT_ROOM_ID);
  const [isConnected, setIsConnected] = useState(false);
  const [myStream, setMyStream] = useState(null);
  const [remoteEmailId, setRemoteEmailId] = useState(null);
  const [isJoining, setIsJoining] = useState(false);
  
  const navigate = useNavigate();
  const { socket } = useSocket();
  const {
    peer,
    createOffer,
    createAnswer,
    setRemoteAns,
    sendStream,
    remoteStream,
  } = usePeer();

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  // Get user media stream (camera and microphone)
  const getUserMediaStream = useCallback(async () => {
    if (myStream) {
      console.log("Stream already exists, not requesting new one");
      return;
    }
    
    try {
      console.log("Requesting user media...");
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      console.log("User media obtained:", stream);
      setMyStream(stream);
    } catch (err) {
      console.error("Error accessing media devices:", err);
      
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        setAlertMsg("Error: Camera/Microphone access denied. Please check browser permissions.");
      } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
        setAlertMsg("Error: No camera/microphone found. Please ensure they are connected and enabled.");
      } else {
        setAlertMsg("Error: Could not access camera or microphone.");
      }
    }
  }, [myStream]);

  // Handle incoming call from admin
  const handleIncommingCall = useCallback(
    async (data) => {
      const { from, offer } = data;
      console.log("Incoming call from", from, "with offer:", offer);
      
      if (!peer) {
        console.error("Peer connection not available for creating answer");
        return;
      }
      
      try {
        const ans = await createAnswer(offer);
        if (socket?.connected) {
          socket.emit("call-accepted", { emailId: from, ans });
          setRemoteEmailId(from);
          setAlertMsg("Connected to teacher's stream");
        } else {
          console.error("Socket not connected, cannot send call-accepted");
        }
      } catch (error) {
        console.error("Error creating or sending answer:", error);
      }
    },
    [createAnswer, socket, peer]
  );

  // Handle ICE candidate events
  const handleIceCandidate = useCallback(
    (event) => {
      if (event.candidate && remoteEmailId && socket?.connected) {
        socket.emit("ice-candidate", {
          candidate: event.candidate,
          to: remoteEmailId,
        });
      }
    },
    [socket, remoteEmailId]
  );

  // Handle renegotiation
  const handleNegotiationNeeded = useCallback(async () => {
    console.log("Negotiation needed for:", remoteEmailId);
    if (!remoteEmailId || !peer || !socket?.connected) {
      console.warn(
        "Skipping renegotiation: missing remoteEmailId, peer, or socket connection."
      );
      return;
    }
    try {
      console.log("Creating renegotiation offer for", remoteEmailId);
      const offer = await createOffer();
      socket.emit("renegotiate", { to: remoteEmailId, offer });
    } catch (error) {
      console.error(
        "Error during renegotiation offer creation/sending:",
        error
      );
    }
  }, [createOffer, remoteEmailId, socket, peer]);

  // Handle user left event
  const handleUserLeft = useCallback(
    ({ emailId }) => {
      console.log("User left event received for:", emailId);
      if (emailId === remoteEmailId) {
        console.log("Teacher left. Clearing remote participant information.");
        setRemoteEmailId(null);
        setAlertMsg("Teacher disconnected. Waiting for them to rejoin...");
      }
    },
    [remoteEmailId]
  );

  // Setup peer event listeners
  useEffect(() => {
    if (!peer) return;

    console.log("Attaching Peer event listeners");
    peer.addEventListener("icecandidate", handleIceCandidate);
    peer.addEventListener("negotiationneeded", handleNegotiationNeeded);

    return () => {
      console.log("Removing Peer event listeners");
      peer.removeEventListener("icecandidate", handleIceCandidate);
      peer.removeEventListener("negotiationneeded", handleNegotiationNeeded);
    };
  }, [peer, handleIceCandidate, handleNegotiationNeeded]);

  // Setup socket event listeners
  useEffect(() => {
    if (!socket || !peer) {
      console.log("Socket or Peer not ready for listeners.");
      return;
    }

    const handleIceCandidateEvent = ({ candidate }) => {
      if (candidate && peer.signalingState !== "closed") {
        peer
          .addIceCandidate(new RTCIceCandidate(candidate))
          .catch((e) => console.error("Error adding received ICE candidate:", e));
      }
    };

    const handleRenegotiateEvent = async ({ from, offer }) => {
      const targetEmail = from || remoteEmailId;
      console.log("Renegotiation requested from:", targetEmail);
      if (!targetEmail) {
        console.warn("Received renegotiation request but no target email known.");
        return;
      }
      try {
        const ans = await createAnswer(offer);
        socket.emit("call-accepted", { emailId: targetEmail, ans });
      } catch (error) {
        console.error("Error handling renegotiation request:", error);
      }
    };

    console.log("Attaching Socket event listeners");
    socket.on("incomming-call", handleIncommingCall);
    socket.on("ice-candidate", handleIceCandidateEvent);
    socket.on("renegotiate", handleRenegotiateEvent);
    socket.on("user-left", handleUserLeft);
    socket.on("joined-room", () => {
      console.log("Successfully joined room:", roomId);
      setIsJoining(false);
      setIsConnected(true);
      setAlertMsg("Waiting for teacher to start the stream...");
    });

    return () => {
      console.log("Removing Socket event listeners");
      socket.off("incomming-call", handleIncommingCall);
      socket.off("ice-candidate", handleIceCandidateEvent);
      socket.off("renegotiate", handleRenegotiateEvent);
      socket.off("user-left", handleUserLeft);
      socket.off("joined-room");
    };
  }, [socket, peer, handleIncommingCall, handleUserLeft, createAnswer, remoteEmailId, roomId]);

  // Get user media when component mounts
  useEffect(() => {
    if (!myStream) {
      getUserMediaStream();
    }
  }, [getUserMediaStream, myStream]);

  // Attach local stream to video element
  useEffect(() => {
    if (myStream && localVideoRef.current) {
      console.log("Assigning local stream to video element");
      if (localVideoRef.current.srcObject !== myStream) {
        localVideoRef.current.srcObject = myStream;
      }
    }

    return () => {
      if (myStream) {
        console.log("Stopping local stream tracks on cleanup.");
        myStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [myStream]);

  // Attach remote stream to video element
  useEffect(() => {
    if (remoteStream && remoteVideoRef.current) {
      console.log("Assigning remote stream to video element");
      if (remoteVideoRef.current.srcObject !== remoteStream) {
        remoteVideoRef.current.srcObject = remoteStream;
      }
    }
  }, [remoteStream]);

  // Send local stream to peer when ready
  useEffect(() => {
    if (
      peer &&
      myStream &&
      sendStream &&
      (peer.connectionState === "new" ||
        peer.connectionState === "connecting" ||
        peer.connectionState === "connected")
    ) {
      console.log("Peer and stream ready. Attempting to send stream.");
      sendStream(myStream);
    }
  }, [peer, myStream, sendStream]);

  // Join room when component mounts and socket is ready
  useEffect(() => {
    if (socket && !isConnected && !isJoining) {
      console.log("Joining room:", roomId);
      setIsJoining(true);
      // Get email from localStorage or use a default value
      const email = localStorage.getItem('email') || 'student@example.com';
      socket.emit("join-room", { roomId, emailId: email });
    }

    return () => {
      if (socket && (isConnected || isJoining)) {
        console.log("Leaving room:", roomId);
        socket.emit("leave-room", { roomId });
        setIsConnected(false);
        setIsJoining(false);
      }
    };
  }, [socket, roomId, isConnected, isJoining]);

  // Handle leaving the meeting
  const handleLeaveMeeting = (e) => {
    e.preventDefault();
    socket.off("user-left", handleUserLeft);
    navigate("/StudentDashboard/dashboard");
  };

  return (
    <div className="video-call flex h-auto w-full bg-gray-900 text-white">
      <div className="flex w-full h-screen flex-col items-center bg-gray-800 p-4 md:p-6 rounded-lg shadow-lg">
        <h2 className="text-xl text-green-400 font-semibold">
          Live Classroom
        </h2>

        <div className="h-10 mb-2 flex items-center justify-center w-full">
          {alertMsg && (
            <p
              className={`p-2 rounded text-sm md:text-base transition-opacity duration-300 ${
                alertMsg.startsWith("Error:")
                  ? "bg-red-500 text-white"
                  : "bg-yellow-500 text-black"
              }`}
            >
              {alertMsg}
            </p>
          )}
        </div>

        <div
          className={`relative w-full h-[70%] flex-grow grid gap-4 ${
            remoteStream ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"
          }`}
        >
          {/* Local video (smaller when remote stream is present) */}
          <div
            className={`bg-black rounded-lg overflow-hidden shadow-md border-2 ${
              remoteStream ? "md:col-start-2" : ""
            } border-green-500`}
          >
            <video
              ref={localVideoRef}
              className="w-full h-full object-cover block"
              autoPlay
              playsInline
              muted
            />
            {!myStream && (
              <div className="absolute inset-0 flex items-center justify-center text-gray-400 bg-black bg-opacity-70 text-sm">
                Waiting for your camera...
              </div>
            )}
            <span className="absolute bottom-1 left-1 md:bottom-2 md:left-2 bg-black bg-opacity-60 text-white text-xs px-1 rounded">
              You
            </span>
          </div>

          {/* Remote video (teacher) */}
          {remoteStream ? (
            <div className="relative bg-black rounded-lg overflow-hidden shadow-md border-2 border-blue-500 md:col-start-1 md:row-start-1">
              <video
                ref={remoteVideoRef}
                className="w-full h-full object-cover block"
                autoPlay
                playsInline
              />
              {remoteEmailId && (
                <span className="absolute bottom-1 left-1 md:bottom-2 md:left-2 bg-black bg-opacity-60 text-white text-xs px-1 rounded">
                  {remoteEmailId} (Teacher)
                </span>
              )}
            </div>
          ) : (
            <div className="hidden md:flex md:col-start-1 items-center justify-center bg-gray-900 rounded-lg border border-gray-700">
              <p className="text-gray-400 text-center px-4">
                Waiting for teacher to start streaming...
              </p>
            </div>
          )}
        </div>
        
        <div className="mt-4">
          <CallEndIcon
            style={{ height: "50px", width: "50px" }}
            onClick={handleLeaveMeeting}
            className="bg-red-700 p-2 rounded-full border font-bold cursor-pointer hover:bg-red-800 transition-colors"
          />
        </div>
      </div>
    </div>
  );
};

export default StudentLive;