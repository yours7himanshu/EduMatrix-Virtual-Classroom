import {
    createContext,
    useMemo,
    useContext,
    useEffect,
    useState,
    useCallback,
  } from "react";
  
  const PeerContext = createContext();
  export const usePeer = () => useContext(PeerContext);
  
  export const PeerProvider = (props) => {
    const [remoteStream, setRemoteStream] = useState(null);
  
  
    const peer = useMemo(
      () =>
        new RTCPeerConnection({
          iceServers: [
            {
              urls: [
                "stun:stun.l.google.com:19302",
                "stun:global.stun.twilio.com:3478",
              ],
            },
          ],
        }),
      []
    );
  
    const createOffer = async () => {
      const offer = await peer.createOffer();
      await peer.setLocalDescription(offer);
      return offer;
    };
  
    const createAnswer = async (offer) => {
      await peer.setRemoteDescription(offer);
      const answer = await peer.createAnswer();
      await peer.setLocalDescription(answer);
      return answer;
    };
  
    const setRemoteAns = async (ans) => {
      await peer.setRemoteDescription(ans);
    };
  
    const sendStream = async (stream) => {
      // Get a list of already added tracks
      const existingSenders = peer.getSenders().map((sender) => sender.track);
    
      // Iterate over the tracks and add only if not already added
      for (const track of stream.getTracks()) {
        if (!existingSenders.includes(track)) {
          peer.addTrack(track, stream);
        }
      }
    };
    
  
    const handleTrackEvent = useCallback((ev) => {
      console.log("Track event", ev.streams);
      setRemoteStream(ev.streams[0]);
    }, []);
  
  
    useEffect(() => {
      peer.addEventListener("track", handleTrackEvent);
      return () => {
        peer.removeEventListener("track", handleTrackEvent);
      };
    }, [peer, handleTrackEvent]);
  
    return (
      <PeerContext.Provider
        value={{
          peer,
          createOffer,
          createAnswer,
          setRemoteAns,
          sendStream,
          remoteStream,
        }}
      >
        {props.children}
      </PeerContext.Provider>
    );
  };
  