import React, { useState, useEffect, useCallback } from "react";
import { useSocket } from "../providers/Socket"; // Adjust the path if needed
import { useNavigate } from "react-router-dom";

const Modal = ({ isOpen, onClose }) => {
  const { socket } = useSocket();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [roomId, setRoomId] = useState("");
  const [loading, setLoading] = useState(false);

  // Handle room joining
  const handleRoomJoined = useCallback(
    ({ roomId }) => {
      navigate(`/admin-live/${roomId}`);
    },
    [navigate]
  );

  // Set up and clean up socket listeners
  useEffect(() => {
    socket.on("joined-room", handleRoomJoined);
    return () => {
      socket.off("joined-room", handleRoomJoined);
    };
  }, [handleRoomJoined, socket]);

  // Handle form submission
  const handleJoinRoom = async () => {
    setLoading(true);
    try {
      socket.emit("join-room", { emailId: email, roomId });
    } catch (error) {
      console.error("Error occurred", error);
    } finally {
      setLoading(false);
      onClose(); // Close modal after joining
    }
  };

  // Prevent rendering if modal is not open
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg p-6 shadow-lg w-96">
        <h2 className="text-lg font-semibold mb-4">Join Live Room</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleJoinRoom();
          }}
        >
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Room ID</label>
            <input
              type="text"
              placeholder="Enter Room ID"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              required
              className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Joining..." : "Join"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Modal;
