const isProd = import.meta.env.PROD;
console.log("isProd", isProd);
export const rtcConfig: RTCConfiguration = isProd
  ? {
      iceServers: [
        { urls: import.meta.env.VITE_TURN_STUN },
        {
          urls: import.meta.env.VITE_TURN_URL,
          username: import.meta.env.VITE_TURN_USERNAME,
          credential: import.meta.env.VITE_TURN_CREDENTIAL,
        },
        {
          urls: import.meta.env.VITE_TURN_TCP,
          username: import.meta.env.VITE_TURN_USERNAME,
          credential: import.meta.env.VITE_TURN_CREDENTIAL,
        },
        {
          urls: import.meta.env.VITE_TURN_443,
          username: import.meta.env.VITE_TURN_USERNAME,
          credential: import.meta.env.VITE_TURN_CREDENTIAL,
        },
        {
          urls: import.meta.env.VITE_TURN_TLS,
          username: import.meta.env.VITE_TURN_USERNAME,
          credential: import.meta.env.VITE_TURN_CREDENTIAL,
        },
      ],
    }
  : {
      iceServers: [
        { urls: import.meta.env.VITE_ICE_STUN },
      ],
    };
