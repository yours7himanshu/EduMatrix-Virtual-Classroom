import { useEffect, useRef } from "react";
import socket from "../socket";

const JoinLecture = ({ lectureId }) => {
  const remoteVideoRef = useRef(null);
  const peerConnection = useRef(null);

  useEffect(() => {
    // Notify server that the client has joined the lecture
    socket.emit("joinLecture", lectureId);

    // Listen for WebRTC events
    socket.on("videoOffer", handleVideoOffer);
    socket.on("iceCandidate", handleNewICECandidateMsg);

    return () => {
      // Cleanup listeners and close the peer connection on unmount
      socket.off("videoOffer", handleVideoOffer);
      socket.off("iceCandidate", handleNewICECandidateMsg);
      if (peerConnection.current) {
        peerConnection.current.close();
        peerConnection.current = null;
      }
    };
  }, [lectureId]);

  const handleVideoOffer = async (offer) => {
    if (!peerConnection.current) initializePeerConnection();

    try {
      // Set the remote description to the incoming offer
      await peerConnection.current.setRemoteDescription(
        new RTCSessionDescription(offer)
      );

      // Create and send an answer back to the admin
      const answer = await peerConnection.current.createAnswer();
      await peerConnection.current.setLocalDescription(answer);
      socket.emit("videoAnswer", { answer, lectureId });
    } catch (error) {
      console.error("Error handling video offer:", error);
    }
  };

  const initializePeerConnection = () => {
    // Initialize a new RTCPeerConnection
    peerConnection.current = new RTCPeerConnection();

    // Handle ICE candidate events and send them to the admin
    peerConnection.current.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("iceCandidate", { candidate: event.candidate, lectureId });
      }
    };

    // Attach the remote stream to the video element
    peerConnection.current.ontrack = (event) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };
  };

  const handleNewICECandidateMsg = async (data) => {
    try {
      // Add the received ICE candidate to the peer connection
      if (peerConnection.current) {
        await peerConnection.current.addIceCandidate(data.candidate);
      }
    } catch (error) {
      console.error("Error adding received ICE candidate:", error);
    }
  };

  return (
    <div className="flex flex-col items-center bg-gray-100 p-6 rounded-lg shadow-lg">
      <h2 className="text-xl text-red-600 font-semibold mb-4">Live Lecture</h2>
      <video
        ref={remoteVideoRef}
        autoPlay
        muted
        className="w-[80%] h-[90%] bg-black rounded-lg shadow-md mb-4"
      ></video>
      <p className="text-green-600">You are now watching the live lecture.</p>
    </div>
  );
};

export default JoinLecture;
