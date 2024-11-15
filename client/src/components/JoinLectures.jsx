// JoinLecture.js
import  { useEffect, useRef } from "react";
import socket from "../socket"; // Import your configured socket client

const JoinLecture = ({ lectureId }) => {
    const remoteVideoRef = useRef(null);
    const peerConnection = useRef(null);

    useEffect(() => {
        socket.emit("joinLecture", lectureId);

        socket.on("videoOffer", handleVideoOffer);
        socket.on("iceCandidate", handleNewICECandidateMsg);

        return () => {
            socket.off("videoOffer");
            socket.off("iceCandidate");
            if (peerConnection.current) peerConnection.current.close();
        };
    }, [lectureId]);

    const handleVideoOffer = async (offer) => {
        if (!peerConnection.current) initializePeerConnection();

        await peerConnection.current.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await peerConnection.current.createAnswer();
        await peerConnection.current.setLocalDescription(answer);
        socket.emit("videoAnswer", { answer, lectureId });
    };

    const initializePeerConnection = () => {
        peerConnection.current = new RTCPeerConnection();

        peerConnection.current.onicecandidate = (event) => {
            if (event.candidate) {
                socket.emit("iceCandidate", { candidate: event.candidate });
            }
        };

        peerConnection.current.ontrack = (event) => {
            remoteVideoRef.current.srcObject = event.streams[0];
        };
    };

    const handleNewICECandidateMsg = async (data) => {
        try {
            await peerConnection.current.addIceCandidate(data.candidate);
        } catch (e) {
            console.error("Error adding received ICE candidate", e);
        }
    };

    return (
        <div className="flex flex-col items-center bg-gray-100 p-6 rounded-lg shadow-lg">
            <h2 className="text-xl text-red-600 font-semibold mb-4">Live Lecture</h2>
            <video
                ref={remoteVideoRef}
                autoPlay
                className="w-[80%] h-[90%] bg-black rounded-lg shadow-md mb-4"
            ></video>
            <p className="text-green-600">You are now watching the live lecture.</p>
        </div>
    );
};

export default JoinLecture;
