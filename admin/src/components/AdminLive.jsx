import { useCallback, useEffect, useState, useRef } from "react";
import { useSocket } from "../providers/Socket";
import { usePeer } from "../providers/Peer";
import * as blazeface from "@tensorflow-models/blazeface";
import "@tensorflow/tfjs";
import Message from "../shared/Message";
import TabMonitor from "./TabMonitor/TabMonitor";
import { useNavigate } from "react-router-dom";
import CallEndIcon from "@mui/icons-material/CallEnd";

// Room ID for consistent room joining
const DEFAULT_ROOM_ID = "admin-classroom-live";

const AdminLive = () => {
  const [alertMsg, setAlertMsg] = useState("");
  const [roomId, setRoomId] = useState(DEFAULT_ROOM_ID);
  const [isConnected, setIsConnected] = useState(false);
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

  const [myStream, setMyStream] = useState(null);
  const [remoteEmailId, setRemoteEmailId] = useState(null);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const modelRef = useRef(null);
  const detectionIntervalRef = useRef(null);
  const isDetectingRef = useRef(false);
  const isDetectionRunningRef = useRef(false);

  const getUserMediaStream = useCallback(async () => {
    if (myStream) {
      console.log("getUserMediaStream called, but stream already exists.");
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

      if (
        err.name === "NotAllowedError" ||
        err.name === "PermissionDeniedError"
      ) {
        setAlertMsg(
          "Error: Camera/Microphone access denied. Please check browser permissions."
        );
      } else if (
        err.name === "NotFoundError" ||
        err.name === "DevicesNotFoundError"
      ) {
        setAlertMsg(
          "Error: No camera/microphone found. Please ensure they are connected and enabled."
        );
      } else {
        setAlertMsg("Error: Could not access camera or microphone.");
      }
    }
  }, [myStream]);

  const handleNewUserJoined = useCallback(
    async (data) => {
      const { emailId } = data;
      console.log("New user joined", emailId);
      if (!peer) {
        console.error("Peer connection not available for creating offer");
        return;
      }
      try {
        const offer = await createOffer();

        if (socket?.connected) {
          socket.emit("call-user", { emailId, offer });
          setRemoteEmailId(emailId);
        } else {
          console.error("Socket not connected, cannot send call-user");
        }
      } catch (error) {
        console.error("Error creating or sending offer:", error);
      }
    },
    [createOffer, socket, peer]
  );

  const handleIncommingCall = useCallback(
    async (data) => {
      const { from, offer } = data;
      console.log("Incoming call data", from, offer);
      if (!peer) {
        console.error("Peer connection not available for creating answer");
        return;
      }
      try {
        const ans = await createAnswer(offer);
        if (socket?.connected) {
          socket.emit("call-accepted", { emailId: from, ans });
          setRemoteEmailId(from);
        } else {
          console.error("Socket not connected, cannot send call-accepted");
        }
      } catch (error) {
        console.error("Error creating or sending answer:", error);
      }
    },
    [createAnswer, socket, peer]
  );

  const handleCallAccepted = useCallback(
    async (data) => {
      const { ans } = data;
      console.log("Call got accepted", ans);
      if (!peer) {
        console.error(
          "Peer connection not available for setting remote answer"
        );
        return;
      }
      try {
        await setRemoteAns(ans);

        console.log("Remote answer set.");
      } catch (error) {
        console.error("Error setting remote answer:", error);
      }
    },
    [setRemoteAns, peer]
  );

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
      socket.emit("renegotiate", { emailId: remoteEmailId, offer });
    } catch (error) {
      console.error(
        "Error during renegotiation offer creation/sending:",
        error
      );
    }
  }, [createOffer, remoteEmailId, socket, peer]);

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

  const handleUserLeft = useCallback(
    ({ emailId }) => {
      console.log("User left event received for:", emailId);
      if (emailId === remoteEmailId) {
        console.log(
          "Matching user left. Clearing remote participant information."
        );
        setRemoteEmailId(null);
      }
    },
    [remoteEmailId]
  );

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

  useEffect(() => {
    if (!socket || !peer) {
      console.log("Socket or Peer not ready for listeners.");
      return;
    }

    const handleIceCandidateEvent = ({ candidate }) => {
      if (candidate && peer.signalingState !== "closed") {
        peer
          .addIceCandidate(new RTCIceCandidate(candidate))
          .catch((e) =>
            console.error("Error adding received ICE candidate:", e)
          );
      }
    };

    const handleRenegotiateEvent = async ({ from, offer }) => {
      const targetEmail = from || remoteEmailId;
      console.log("Renegotiation requested from:", targetEmail);
      if (!targetEmail) {
        console.warn(
          "Received renegotiation request but no target email known."
        );
        return;
      }
      try {
        const ans = await createAnswer(offer);
        socket.emit("call-accepted", { emailId: targetEmail, ans }); // Re-use call-accepted for simplicity
      } catch (error) {
        console.error("Error handling renegotiation request:", error);
      }
    };

    console.log("Attaching Socket event listeners");
    socket.on("user-joined", handleNewUserJoined);
    socket.on("incomming-call", handleIncommingCall);
    socket.on("call-accepted", handleCallAccepted);
    socket.on("ice-candidate", handleIceCandidateEvent);
    socket.on("renegotiate", handleRenegotiateEvent);
    socket.on("user-left", handleUserLeft);

    return () => {
      console.log("Removing Socket event listeners");
      socket.off("user-joined", handleNewUserJoined);
      socket.off("incomming-call", handleIncommingCall);
      socket.off("call-accepted", handleCallAccepted);
      socket.off("ice-candidate", handleIceCandidateEvent);
      socket.off("renegotiate", handleRenegotiateEvent);
      socket.off("user-left", handleUserLeft);
    };
    // Add all dependencies including handlers and potentially `createAnswer` if used directly in listeners
  }, [
    socket,
    peer,
    handleNewUserJoined,
    handleIncommingCall,
    handleCallAccepted,
    handleUserLeft,
    createAnswer,
    remoteEmailId,
  ]);

  useEffect(() => {
    let isMounted = true;
    const loadModel = async () => {
      try {
        console.log("Loading Blazeface model...");

        const loadedModel = await blazeface.load();
        if (isMounted) {
          modelRef.current = loadedModel;
          console.log("Blazeface model loaded successfully.");

          if (
            localVideoRef.current?.readyState >=
              localVideoRef.current?.HAVE_METADATA &&
            !isDetectionRunningRef.current
          ) {
            console.log(
              "Model loaded after metadata, attempting to start detection."
            );
            handleLocalVideoMetadataLoaded();
          }
        }
      } catch (error) {
        console.error("Failed to load Blazeface model:", error);
        if (isMounted) {
          setAlertMsg("Error: Could not load face detection model.");
        }
      }
    };
    loadModel();

    return () => {
      isMounted = false;
      console.log("Face detection model effect cleanup.");
    };
  }, []);

  useEffect(() => {
    if (!myStream) {
      getUserMediaStream();
    }
  }, [getUserMediaStream, myStream]);

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

  useEffect(() => {
    if (remoteStream && remoteVideoRef.current) {
      console.log("Assigning remote stream to video element");
      if (remoteVideoRef.current.srcObject !== remoteStream) {
        remoteVideoRef.current.srcObject = remoteStream;
      }
    }
  }, [remoteStream]);

  const detectFaceLoop = useCallback(async () => {
    if (
      !isDetectionRunningRef.current ||
      !localVideoRef.current ||
      !modelRef.current ||
      isDetectingRef.current
    ) {
      // If detection stopped or refs lost, cancel any pending frame
      if (!isDetectionRunningRef.current && detectionIntervalRef.current) {
        cancelAnimationFrame(detectionIntervalRef.current);
        detectionIntervalRef.current = null;
      }
      return;
    }

    const videoElement = localVideoRef.current;

    // Final check for metadata readiness (should be ready if started via onLoadedMetadata)
    if (videoElement.readyState < videoElement.HAVE_METADATA) {
      console.warn(
        "detectFaceLoop called but metadata not ready, rescheduling."
      );
      detectionIntervalRef.current = requestAnimationFrame(detectFaceLoop); // Try again next frame
      return;
    }

    isDetectingRef.current = true;

    let currentAlert = "";

    try {
      const predictions = await modelRef.current.estimateFaces(
        videoElement,
        false /* returnTensors */
      );

      if (predictions.length === 0) {
        currentAlert = "No face detected! No one is watching the stream";
      } else if (predictions.length > 1) {
        currentAlert =
          "More than one face detected by our system! You are cheating";
      } else {
        currentAlert = "";
      }

      setAlertMsg((prevAlert) => {
        if (prevAlert === currentAlert) {
          return prevAlert;
        }
        // Clear previous timeouts if setting a new message or clearing
        // (This basic timeout clearing might need refinement for complex scenarios)
        // if (alertTimeoutRef.current) clearTimeout(alertTimeoutRef.current);

        // Set timeout only for specific messages if desired
        // if (currentAlert === "No face detected! No one is watching the stream") {
        //     alertTimeoutRef.current = setTimeout(() => setAlertMsg(""), 5000);
        // } else if (currentAlert === "More than one face detected by our system! You are cheating") {
        //     alertTimeoutRef.current = setTimeout(() => setAlertMsg(""), 7000);
        // }
        return currentAlert;
      });
    } catch (error) {
      console.error("Error during face estimation:", error);
      setAlertMsg((prev) =>
        prev !== "Error: Face detection failed."
          ? "Error: Face detection failed."
          : prev
      );
      isDetectionRunningRef.current = false;
    } finally {
      isDetectingRef.current = false;
      if (isDetectionRunningRef.current) {
        detectionIntervalRef.current = requestAnimationFrame(detectFaceLoop);
      } else {
        // Ensure frame is cancelled if loop was stopped during async operation
        if (detectionIntervalRef.current)
          cancelAnimationFrame(detectionIntervalRef.current);
        detectionIntervalRef.current = null;
        console.log("Detection loop stopping as flag is false.");
      }
    }
  }, []);

  const handleLocalVideoMetadataLoaded = useCallback(() => {
    console.log("Local video metadata loaded.");

    if (
      modelRef.current &&
      !isDetectionRunningRef.current &&
      localVideoRef.current
    ) {
      console.log(
        "Model ready and metadata loaded. Starting face detection loop."
      );

      if (
        localVideoRef.current.videoWidth > 0 &&
        localVideoRef.current.videoHeight > 0
      ) {
        isDetectionRunningRef.current = true; // Set flag BEFORE starting loop
        detectFaceLoop(); // Start the loop
      } else {
        console.warn(
          "Metadata loaded, but video dimensions not available yet. Detection not started."
        );
      }
    } else if (!modelRef.current) {
      console.warn("Metadata loaded, but face detection model not ready yet.");
    } else if (isDetectionRunningRef.current) {
      console.log(
        "Metadata loaded, but detection loop appears to be already running."
      );
    } else if (!localVideoRef.current) {
      console.warn("Metadata loaded, but local video ref is missing.");
    }
  }, [detectFaceLoop]);

  useEffect(() => {
    return () => {
      console.log("AdminLive unmounting. Stopping face detection loop.");
      isDetectionRunningRef.current = false; // Signal loop to stop
      if (detectionIntervalRef.current) {
        cancelAnimationFrame(detectionIntervalRef.current);
        detectionIntervalRef.current = null;
        console.log("Cancelled animation frame.");
      }
    };
  }, []);

  const handleMeeting = (e) => {
    e.preventDefault();
    socket.off("user-left", handleUserLeft);
    navigate("/dashboard");
  };

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
    } else {
      // Log why stream isn't sent yet
      // console.log(`Stream not sent: Peer: ${!!peer}, Stream: ${!!myStream}, SendStreamFn: ${!!sendStream}, PeerState: ${peer?.connectionState}`);
    }
  }, [peer, myStream, sendStream]);

  useEffect(() => {
    if (socket && !isConnected) {
      console.log("Joining room:", roomId);
      socket.emit("join-room", { roomId });
      setIsConnected(true);
    }

    return () => {
      if (socket && isConnected) {
        console.log("Leaving room:", roomId);
        socket.emit("leave-room", { roomId });
        setIsConnected(false);
      }
    };
  }, [socket, roomId, isConnected]);

  return (
    <div className="video-call flex min-h-full w-full bg-gray-900 text-white"> {/* Changed h-auto to min-h-full */}
      {" "}
      {/* Added text-white for base color */}
      <div className="flex w-full h-full flex-col items-center bg-gray-800 p-4 md:p-6 rounded-lg shadow-lg"> {/* Changed h-screen to h-full, removed m-2 */}
        <h2 className="text-xl text-green-400 font-semibold mb-2 md:mb-4"> {/* Added mb for spacing */}
          Admin Live Stream
        </h2>

        <TabMonitor />

        <div className="h-10 mb-2 flex items-center  justify-center w-full">
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
          <div
            className={` bg-black rounded-lg overflow-hidden shadow-md border-2 ${
              alertMsg.includes("detected") || alertMsg.includes("watching")
                ? "border-yellow-500"
                : "border-green-500"
            }`}
          >
            {" "}
            {/* Dynamic border */}
            <video
              ref={localVideoRef}
              className="w-full h-full object-cover block"
              autoPlay
              playsInline
              onLoadedMetadata={handleLocalVideoMetadataLoaded}
            />
            {!myStream && (
              <div className="absolute inset-0 flex items-center justify-center text-gray-400 bg-black bg-opacity-70 text-sm">
                Waiting for local camera...
              </div>
            )}
            <span className="absolute bottom-1 left-1 md:bottom-2 md:left-2 bg-black bg-opacity-60 text-white text-xs px-1 rounded">
              You
            </span>
          </div>

          {remoteStream && (
            <div className="relative bg-black  rounded-lg overflow-hidden shadow-md border-2 border-blue-500">
              <video
                ref={remoteVideoRef}
                className="w-full h-full object-cover block"
                autoPlay
                playsInline
              />
              {remoteEmailId && (
                <span className="absolute bottom-1 left-1 md:bottom-2 md:left-2 bg-black bg-opacity-60 text-white text-xs px-1 rounded">
                  {remoteEmailId}
                </span>
              )}
            </div>
          )}
        </div>
        <CallEndIcon
          style={{ height: "60px", width: "60px" }}
          onClick={handleMeeting}
          className="relative bottom-20 right-10 bg-red-700 p-2 rounded-full border font-bold cursor-pointer"
        />
      </div>
      <Message />
    </div>
  );
};

export default AdminLive;
