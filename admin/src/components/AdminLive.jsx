// AdminLive.js
import { useEffect, useRef, useState } from "react";
import socket from "../socket"; // Import your configured socket client

const AdminLive = ({ lectureId }) => {
    const localVideoRef = useRef(null);
    const peerConnections = useRef({});
    const mediaStreamRef = useRef(null); // Store the media stream
    const [isLive, setIsLive] = useState(true); // Track live status

    useEffect(() => {
        startVideoStream();

        socket.emit("adminGoLive", lectureId); // Notify server that admin has gone live

        // Set up event listeners for signaling
        socket.on("studentJoin", handleStudentJoin);
        socket.on("iceCandidate", handleNewICECandidateMsg);
        socket.on("videoAnswer", handleVideoAnswer);

        return () => {
            socket.off("studentJoin", handleStudentJoin);
            socket.off("iceCandidate", handleNewICECandidateMsg);
            socket.off("videoAnswer", handleVideoAnswer);
            endCall(); // Ensure cleanup on component unmount
        };
    }, [lectureId]);

    const startVideoStream = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            mediaStreamRef.current = stream; // Save the stream reference
            localVideoRef.current.srcObject = stream;

            // Handle student join requests
            socket.on("studentJoin", (studentId) => {
                const peerConnection = createPeerConnection(studentId);
                peerConnections.current[studentId] = peerConnection;
                
                // Add admin's video stream to the peer connection
                stream.getTracks().forEach((track) => peerConnection.addTrack(track, stream));
            });
        } catch (error) {
            console.error("Error accessing media devices:", error);
        }
    };

    const createPeerConnection = (studentId) => {
        const peerConnection = new RTCPeerConnection();

        peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
                socket.emit("iceCandidate", { candidate: event.candidate, studentId });
            }
        };

        peerConnection.createOffer().then((offer) => {
            peerConnection.setLocalDescription(offer);
            socket.emit("videoOffer", { offer, studentId });
        });

        return peerConnection;
    };

    const handleStudentJoin = (studentId) => {
        if (!peerConnections.current[studentId]) {
            peerConnections.current[studentId] = createPeerConnection(studentId);
        }
    };

    const handleNewICECandidateMsg = (data) => {
        const peerConnection = peerConnections.current[data.studentId];
        if (peerConnection) {
            peerConnection.addIceCandidate(data.candidate);
        }
    };

    const handleVideoAnswer = (data) => {
        const peerConnection = peerConnections.current[data.studentId];
        if (peerConnection) {
            peerConnection.setRemoteDescription(new RTCSessionDescription(data.answer));
        }
    };

    const endCall = () => {
        // Stop all tracks in the media stream to end video/audio
        if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach((track) => track.stop());
            mediaStreamRef.current = null; // Clear the stream reference
        }

        // Close all peer connections with students
        for (let studentId in peerConnections.current) {
            const peerConnection = peerConnections.current[studentId];
            if (peerConnection) {
                peerConnection.close();
            }
            delete peerConnections.current[studentId];
        }

        socket.emit("endCall", lectureId); // Notify server of the call end
        setIsLive(false); // Update the UI state to show that live streaming has ended
    };

    return (
        <div className="flex flex-col items-center bg-gray-100 p-6 rounded-lg shadow-lg">
            <h2 className="text-xl text-green-600 font-semibold mb-4">Admin Live Stream</h2>
            <video
                ref={localVideoRef}
                autoPlay
                muted
                className="w-[80%] h-[90%] bg-black rounded-lg shadow-md mb-4"
            ></video>
            {isLive ? (
                <>
                    <p className="text-gray-600">You are now live. Students will join your lecture.</p>
                    <button
                        onClick={endCall}
                        className="mt-4 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
                    >
                        End Call
                    </button>
                </>
            ) : (
                <p className="text-red-500 mt-4">The live session has ended.</p>
            )}
        </div>
    );
};

export default AdminLive;
