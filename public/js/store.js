let state = {
    socketId: null,
    localStream: null, //caller camera or audio
    remoteStream: null, //callee's audio and video
    screenSharingStream: null,
    allowConnectionFromStrangers: false,
    screenSharingActive: false,
};

export const setSocketId = (socketId) => {
    state = {
        ...state,
        socketId,
    };
    console.log("socket.id setted", state);
};

export const setLocalStream = (stream) => {
    state = {
        ...state,
        localStream: stream,
    };
};

export const setRemoteStream = (stream) => {
    state = {
        ...state,
        remoteStream: stream,
    };
};

export const setScreenSharingStream = (stream) => {
    state = {
        ...state,
        screenSharingStream: stream,
    };
};

export const setAllowConnectionsFromStrangers = (allowConnection) => {
    state = {
        ...state,
        allowConnectionsFromStrangers: allowConnection,
    };
};

export const setScreenSharingActive = (screenSharingActive) => {
    state = {
        ...state,
        screenSharingActive,
    };
};

export const getState = () => {
    return state;
};
