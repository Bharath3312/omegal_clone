
# Real-time Video & Audio Chat using WebRTC, React, Node.js & Socket.io


This is a real-time video and audio chat application inspired by Omegle.
Users can connect with random strangers for video or audio calls, mute/unmute
media dynamically, and chat using a data channel.


## ✨ Features

- 🎥 One-to-one Video Chat (WebRTC)
- 🎧 Audio-only Chat mode
- 🔇 Mute / Unmute microphone
- 📷 Enable / Disable camera
- 🔄 Real-time media state sync between users
- 💬 Text chat using WebRTC DataChannel
- 🔌 Auto disconnect & reconnect handling
- 📱 Mobile & Desktop responsive UI


## 🛠️ Tech Stack

**Frontend**
- React + Vite
- TypeScript
- Tailwind CSS
- Redux Toolkit

**Backend**
- Node.js
- Socket.io (signaling server)

**Real-Time**
- WebRTC (RTCPeerConnection, MediaStream, DataChannel)

**Others**
- STUN / TURN servers


## 🧩 Architecture Overview

1. User joins a room via Socket.io
2. Socket.io acts as a signaling server
3. WebRTC handles:
   - Media streaming (audio/video)
   - DataChannel for chat & media state
4. Media tracks are dynamically enabled/disabled
5. Redux manages global state (room, role, connection)

## What is WebRTC?

WebRTC (Web Real-Time Communication) is a browser technology that enables
real-time audio, video, and data communication directly between browsers
without requiring plugins.

WebRTC is mainly used for:
- Video calling
- Audio calling
- Screen sharing
- Real-time data transfer

WebRTC provides peer-to-peer (P2P) communication, which means media streams
flow directly between users instead of passing through a central server.

## Why is a Signaling Server Required?

WebRTC itself does NOT define how peers discover each other.

Before two browsers can communicate, they must exchange:
- Session Description Protocol (SDP)
- ICE candidates
- Connection metadata

This exchange process is called **signaling**.

In this project:
- Socket.IO is used as the signaling mechanism
- The signaling server only exchanges messages
- Media data never passes through the signaling server

## WebRTC Connection Flow

- User A opens the application
- User B joins the same room
- Both clients create an RTCPeerConnection
- User A creates an SDP Offer
- The Offer is sent to User B via the signaling server
- User B creates an SDP Answer
- ICE candidates are exchanged
- A direct peer-to-peer connection is established
- Media streams start flowing directly between peers

## What is SDP (Session Description Protocol)?

SDP describes:
- Media types (audio / video)
- Codecs
- Resolution
- Encryption methods
- Transport information

SDP does NOT contain media data.
It only describes how media should be transmitted.

## What is ICE (Interactive Connectivity Establishment)?

ICE is a framework used by WebRTC to find the best possible path
to connect two peers over the network.

ICE collects multiple connection candidates such as:
- Local IP addresses
- Public IP addresses
- Relay addresses (TURN)

## What is a STUN Server?

STUN (Session Traversal Utilities for NAT) helps a client discover
its public IP address when it is behind a NAT.

Why STUN is needed:
- Most users are behind routers (NAT)
- Peers don’t know their public IP by default
- STUN tells the browser: "This is how the internet sees you"

STUN is lightweight and free, but it does NOT relay media.

## What is a TURN Server?

TURN (Traversal Using Relays around NAT) is used when a direct
peer-to-peer connection is not possible.

TURN acts as a relay server:
- Media flows through the TURN server
- Used in strict NAT or firewall environments
- More reliable but consumes bandwidth and cost

TURN is only used as a fallback when STUN fails.

## TURN Server Integration (Metered.ca)

This project uses a TURN server to ensure reliable connectivity
when direct peer-to-peer communication fails due to strict NAT
or firewall restrictions.

Metered.ca is used as an example TURN provider.
Any compliant TURN server can be used.



##  RTCPeerConnection Configuration

The application uses different ICE server configurations
for development and production environments.

STUN is used by default.
TURN is enabled in production to ensure connectivity.

## Environment Variables

Create a `.env` file in the root directory:

| Variable | Description |
|--------|-------------|
| VITE_TURN_STUN | STUN server URL |
| VITE_TURN_URL | TURN server UDP URL |
| VITE_TURN_TCP | TURN server TCP URL |
| VITE_TURN_443 | TURN server 443 port |
| VITE_TURN_TLS | TURN server TLS URL |
| VITE_TURN_USERNAME | TURN username |
| VITE_TURN_CREDENTIAL | TURN password |


## External Resources

- 🟢  [**signaling server**:](https://github.com/Bharath3312/signaling-server.git)
- 🔄  [**Metered TURN Server**:](https://www.metered.ca/)

## Getting Started

```bash
git clone https://github.com/Bharath3312/omegal_clone.git
npm install
npm run dev
```


## Conclusion

This project demonstrates a complete real-time communication system
using WebRTC with proper signaling, NAT traversal, and media handling.
It focuses on understanding how WebRTC works internally rather than
just using third-party abstractions.
