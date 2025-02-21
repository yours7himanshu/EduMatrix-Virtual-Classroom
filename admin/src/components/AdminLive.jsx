/*

Copyright 2024 Himanshu Dinkar

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/


import { useCallback, useEffect, useState } from "react";
import { useSocket } from "../providers/Socket";
import { usePeer } from "../providers/Peer";

import Message from '../shared/Message';

const AdminLive = () => {
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

  const getUserMediaStream = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    setMyStream(stream);
    sendStream(stream); 
  }, [setMyStream, sendStream]);

  const handleNewUserJoined = useCallback(
    async (data) => {
      const { emailId } = data;
      console.log("New user joined", emailId);
      const offer = await createOffer();
      socket.emit("call-user", { emailId, offer });
      setRemoteEmailId(emailId);
    },
    [createOffer, socket]
   
  );

  const handleIncommingCall = useCallback(
    async (data) => {
      const { from, offer } = data;
      console.log("Incoming data", from, offer);
      const ans = await createAnswer(offer);
      socket.emit("call-accepted", { emailId: from, ans });
      setRemoteEmailId(from);
    },
    [createAnswer, socket]
  );

  const handleCallAccepted = useCallback(
    async (data) => {
      const { ans } = data;
      console.log("Call got accepted", ans);
      await setRemoteAns(ans);
    },
    [setRemoteAns]
  );

  const handleNegotiationNeeded = useCallback(async () => {
    console.log('negotiation needed');
    const offer = await createOffer();
    socket.emit('renegotiate', { emailId: remoteEmailId, offer });
  }, [createOffer, remoteEmailId]);

  const handleIceCandidate = useCallback((event) => {
    if (event.candidate) {
      socket.emit('ice-candidate', { candidate: event.candidate, to: remoteEmailId });
    }
  }, [socket, remoteEmailId]);

  useEffect(() => {
    peer.addEventListener('icecandidate', handleIceCandidate);
    peer.addEventListener('negotiationneeded', handleNegotiationNeeded);
    return () => {
      peer.removeEventListener('icecandidate', handleIceCandidate);
      peer.removeEventListener('negotiationneeded', handleNegotiationNeeded);
    };
  }, [peer, handleIceCandidate, handleNegotiationNeeded]);

  useEffect(() => {
    socket.on("user-joined", handleNewUserJoined);
    socket.on("incomming-call", handleIncommingCall);
    socket.on("call-accepted", handleCallAccepted);
    socket.on("ice-candidate", ({ candidate }) => {
      peer.addIceCandidate(new RTCIceCandidate(candidate));
    });
    socket.on("renegotiate", async ({ offer }) => {
      const ans = await createAnswer(offer);
      socket.emit('call-accepted', { emailId: remoteEmailId, ans });
    });
    return () => {
      socket.off("user-joined", handleNewUserJoined);
      socket.off("incomming-call", handleIncommingCall);
      socket.off("call-accepted", handleCallAccepted);
      socket.off("ice-candidate");
      socket.off("renegotiate");
    };
  }, [handleNewUserJoined, handleIncommingCall, handleCallAccepted, socket, peer]);

  useEffect(() => {
    getUserMediaStream();
  }, [getUserMediaStream]);

  return (
    <div className="video-call flex h-screen w-screen bg-gray-900">
      <div className="flex w-[70%] flex-col items-center bg-gray-800 p-6 rounded-lg shadow-lg">
        <h2 className="text-xl text-green-600 font-semibold mb-4">
          Admin Live Stream
        </h2>
        <div className="relative w-full h-[60vh] grid grid-cols-2 gap-4">
          <video
            className="w-full h-full rounded-lg border-2 border-green-500 shadow-md"
            autoPlay
            muted
            ref={(ref) => ref && (ref.srcObject = myStream)}
          />
          <video
            className="w-full h-full rounded-lg border-2 border-blue-500 shadow-md"
            autoPlay
            ref={(ref) => ref && (ref.srcObject = remoteStream)}
          />
        </div>
      </div>
      <Message />
    </div>
  );
};

export default AdminLive;
