import * as wss from "./wss.js";
import * as constant from "./constants.js";
import * as ui from "./ui.js";
import * as store from "./store.js";

// connected user details
let connectedUserDetails;

// peer connection
let peerConnection;

// getting access to the camera
const defaultConstraints = {
    audio: true,
    video: true,
};

// stun servers (webrtc configuration)
const configuration = {
    iceServers: [
        {
            urls: "stun:stun.1.google.com:13902",
        },
    ],
};

export const getLocalPreview = () => {
    navigator.mediaDevices
        .getUserMedia(defaultConstraints)
        .then((stream) => {
            ui.updateLocalVideo(stream);
            store.setLocalStream(stream);
        })
        .catch((err) => {
            console.log("error occured when trying to get an access to camera");
            console.log(err);
        });
};

// establish peer connection
const createPeerConnetion = () => {
    peerConnection = new RTCPeerConnection(configuration);

    peerConnection.onicecandidate = (event) => {
        console.log("getting ice candidate from stun server");

        if (event.candidate) {
            // send our ice candidates to other peer
            wss.sendDataUsingWebRTCSignaling({
                connectedUserSocketId: connectedUserDetails.socketId,
                typeof: constant.webRTCSignaling.ICE_CANDIDATE,
                candidate: event.candidate,
            });
        }
    };

    peerConnection.onconnectionstatechange = (event) => {
        if (peerConnection.connectionState === "connected") {
            console.log("succesfully connected with other peer");
        }
    };

    // receiving track from other peer
    const remoteStream = new MediaStream();
    store.setRemoteStream(remoteStream);
    ui.updateRemoteVideo(remoteStream);

    peerConnection.ontrack = (event) => {
        remoteStream.addTrack(event.track);
    };

    // add our stream to peer connection
    if (
        connectedUserDetails.callType === constant.callType.VIDEO_PERSONAL_CODE
    ) {
        const localStream = store.getState().localStream;

        for (const track of localStream.getTracks()) {
            peerConnection.addTrack(track, localStream);
        }
    }
};

export const sendPreOffer = (callType, calleePersonalCode) => {
    connectedUserDetails = {
        callType,
        socketId: calleePersonalCode,
    };

    if (
        callType === constant.callType.CHAT_PERSONAL_CODE ||
        callType === constant.callType.VIDEO_PERSONAL_CODE
    ) {
        const data = {
            callType,
            calleePersonalCode,
        };
        ui.showCallingDialog(callingDialogRejectCallHandler);
        wss.sendPreOffer(data);
    }
};

export const handlePreOffer = (data) => {
    const { callType, callerSocketId } = data;

    connectedUserDetails = {
        callType,
        socketId: callerSocketId,
    };

    if (
        callType === constant.callType.CHAT_PERSONAL_CODE ||
        callType === constant.callType.VIDEO_PERSONAL_CODE
    ) {
        ui.showIncomingCallDialog(
            callType,
            acceptCallHandler,
            rejectCallHandler
        );
    }
};

// send accept or reject pre offer

const sendPreOfferAnswer = (preOfferAnswer) => {
    const data = {
        callerSocketId: connectedUserDetails.socketId,
        preOfferAnswer: preOfferAnswer,
    };
    ui.removeAllDialogs();
    wss.sendPreOfferAnswer(data);
};

export const handlePreOfferAnswer = (data) => {
    const { preOfferAnswer } = data;
    console.log("pre offer answer came");
    console.log(data);
    ui.removeAllDialogs();

    if (preOfferAnswer === constant.preOfferAnswer.CALLEE_NOT_FOUND) {
        // show dialog that callee has not been found
        ui.showInfoDialog(preOfferAnswer);
    }

    if (preOfferAnswer === constant.preOfferAnswer.CALL_UNAVAILABLE) {
        // show dialog that callee is not able to connect
        ui.showInfoDialog(preOfferAnswer);
    }

    if (preOfferAnswer === constant.preOfferAnswer.CALL_REJECTED) {
        // show dialog that call is rejected by the callee
        ui.showInfoDialog(preOfferAnswer);
    }

    if (preOfferAnswer === constant.preOfferAnswer.CALL_ACCEPTED) {
        ui.showCallElements(connectedUserDetails.callType);
        createPeerConnetion();
        // send webRTC offer
        sendWebRTCOffer();
    }
};

const sendWebRTCOffer = async () => {
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    wss.sendDataUsingWebRTCSignaling({
        connectedUserSocketId: connectedUserDetails.socketId,
        type: constant.webRTCSignaling.OFFER,
        offer: offer,
    });
};

export const handleWebRTCOffer = async (data) => {
    await peerConnection.setRemoteDescription(data.offer);
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
    wss.sendDataUsingWebRTCSignaling({
        connectedUserSocketId: connectedUserDetails.socketId,
        type: constant.webRTCSignaling.ANSWER,
        answer: answer,
    });
};

export const handleWebRTCAnswer = async (data) => {
    console.log("handling webRTC Answer");
    await peerConnection.setRemoteDescription(data.answer);
};

export const handleWebRTCCandidate = async (data) => {
    try {
        await peerConnection.addIceCandidate(data.candidate);
    } catch (err) {
        console.log(
            "error occured when trying to add recieved ice candidate",
            err
        );
    }
};

// Event Listners

const acceptCallHandler = () => {
    console.log("call accept");
    createPeerConnetion();
    sendPreOfferAnswer(constant.preOfferAnswer.CALL_ACCEPTED);
    ui.showCallElements(connectedUserDetails.callType);
};
const rejectCallHandler = () => {
    console.log("call reject");
    sendPreOfferAnswer(constant.preOfferAnswer.CALL_REJECTED);
};

const callingDialogRejectCallHandler = () => console.log("rejecting the call");
