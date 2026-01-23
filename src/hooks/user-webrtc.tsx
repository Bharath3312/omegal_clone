import {useEffect,useRef,useState} from 'react';
import { socket } from '@/services/socket';
import { AppDispatch } from '@/store';
import { resetState } from '@/features/reduxStore';


export function useUserWebRTC(roomId: string) {
  console.log("useUserWebRTC called with roomId:", roomId);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [pcReady, setPcReady] = useState(false);
  const dataChannelRef = useRef<RTCDataChannel | null>(null);

  useEffect(() => {
    const peerConnection = new RTCPeerConnection({
    //   iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
        iceServers: [
            {
                urls: "stun:stun.relay.metered.ca:80",
            },
            {
                urls: "turn:in.relay.metered.ca:80",
                username: "4b3aa6c4917d1978c548c190",
                credential: "VAFdi3LHkNUq3AAk",
            },
            {
                urls: "turn:in.relay.metered.ca:80?transport=tcp",
                username: "4b3aa6c4917d1978c548c190",
                credential: "VAFdi3LHkNUq3AAk",
            },
            {
                urls: "turn:in.relay.metered.ca:443",
                username: "4b3aa6c4917d1978c548c190",
                credential: "VAFdi3LHkNUq3AAk",
            },
            {
                urls: "turns:in.relay.metered.ca:443?transport=tcp",
                username: "4b3aa6c4917d1978c548c190",
                credential: "VAFdi3LHkNUq3AAk",
            },
        ],
    });
    peerConnectionRef.current = peerConnection;
    setPcReady(true);
    peerConnection.onicecandidate = (event) => {
      // console.log("onicecandidate event:", event);
      if (event.candidate) {
        socket.emit('webrtc-ice-candidate', {
          roomId,
          candidate: event.candidate,
        });
      }
    };

    peerConnection.onconnectionstatechange = () => {
      const state = peerConnection.connectionState;
      console.log(state ,"connectionSTate");
      if (state === 'connected') {
        setIsConnected(true);
      } else {
        setIsConnected(false);
      }
      if (state === "disconnected" || state === "failed" || state === "closed") {
        console.log("Peer disconnected");
        // update UI, end call, show message
      }
    };

    socket.on('webrtc-offer', async ({ roomId, offer }) => {
      // if (from === roomId) {
        await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);
        socket.emit('webrtc-answer', {
          roomId,
          answer,
        });
      // }
    });

    socket.on('webrtc-answer', async ({ answer }) => {
      // if (from === roomId) {
        await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
      // }
    });

    socket.on('webrtc-ice-candidate', async ({ candidate }) => {
      // if (from === roomId) {
        try {
          await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (e) {
          console.error('Error adding received ice candidate', e);
        }
      // }
    });

    return () => {
      peerConnection.close();
      socket.off('webrtc-offer');
      socket.off('webrtc-answer');
      socket.off('webrtc-ice-candidate');
    };
  }, []);

  const createChannel = (onMessage: (msg: string) => void) => {
    if (!peerConnectionRef.current) return;

    const dc = peerConnectionRef.current.createDataChannel("chat");
    dataChannelRef.current = dc;

    dc.onopen = () => console.log("Chat channel open");
    dc.onmessage = (e) => onMessage(e.data);
    createOffer();
  };

  const listenChannel = (onMessage: (msg: string) => void) => {
    if (!peerConnectionRef.current) return;

    peerConnectionRef.current.ondatachannel = (event) => {
      const dc = event.channel;
      dataChannelRef.current = dc;
      dc.onopen = () =>{ console.log("Chat channel open");}
      dc.onmessage = (e) =>{console.log(e.data,"listen channel*************************************");
        onMessage(e.data);}
    };
  };

  const sendMessage = (msg: string) => {
    dataChannelRef.current?.send(msg);
  };
  const createOffer = async () => {
    console.log("createOffer......");
    
    try {
    // debugger
      const peerConnection = peerConnectionRef.current;
      if (peerConnection) {
      console.log("peerconnection is have");
      
        const offer = await peerConnection.createOffer();
        console.log("create offer success");
        
        await peerConnection.setLocalDescription(offer);
        socket.emit('webrtc-offer', {
          roomId,
          offer,
        });
      }
    } catch (error) {
      console.log(error,"error iin webrtc hooks ");
      
    }
  };
const closeConnection = () => {
  // 1. Close data channel
  if (dataChannelRef.current) {
    dataChannelRef.current.close();
    dataChannelRef.current = null;
  }

  // 2. Stop media tracks
  if (peerConnectionRef.current) {
    peerConnectionRef.current.getSenders().forEach(sender => {
      sender.track?.stop();
    });

    // 3. Close peer connection
    peerConnectionRef.current.close();
    peerConnectionRef.current = null;
    // const dispatch = useAppDispatch();
  }
  // disPatch(resetState())
  setIsConnected(false);
  console.log("WebRTC connection closed locally");
};

  return { isConnected, createOffer, peerConnection: peerConnectionRef.current, createChannel,listenChannel,sendMessage, closeConnection };
}







                        
//API Key for the credential: a507218ffe3bd707fb6c0037ec5fb95ac9d6

// // Calling the REST API TO fetch the TURN Server Credentials
// const response = 
//   await fetch("https://myomegle.metered.live/api/v1/turn/credentials?apiKey=a507218ffe3bd707fb6c0037ec5fb95ac9d6");

// // Saving the response in the iceServers array
// const iceServers = await response.json();

// // Using the iceServers array in the RTCPeerConnection method
// var myPeerConnection = new RTCPeerConnection({
//   iceServers: iceServers
// });


// var myPeerConnection = new RTCPeerConnection({
//   iceServers: [
//       {
//         urls: "stun:stun.relay.metered.ca:80",
//       },
//       {
//         urls: "turn:in.relay.metered.ca:80",
//         username: "4b3aa6c4917d1978c548c190",
//         credential: "VAFdi3LHkNUq3AAk",
//       },
//       {
//         urls: "turn:in.relay.metered.ca:80?transport=tcp",
//         username: "4b3aa6c4917d1978c548c190",
//         credential: "VAFdi3LHkNUq3AAk",
//       },
//       {
//         urls: "turn:in.relay.metered.ca:443",
//         username: "4b3aa6c4917d1978c548c190",
//         credential: "VAFdi3LHkNUq3AAk",
//       },
//       {
//         urls: "turns:in.relay.metered.ca:443?transport=tcp",
//         username: "4b3aa6c4917d1978c548c190",
//         credential: "VAFdi3LHkNUq3AAk",
//       },
//   ],
// });