import * as wss from "./wss.js";
import * as constant from "./constants.js";
import * as ui from "./ui.js";

let connectedUserDetails;

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
    }

    if (preOfferAnswer === constant.preOfferAnswer.CALL_UNAVAILABLE) {
        // show dialog that callee is not able to connect
    }

    if (preOfferAnswer === constant.preOfferAnswer.CALL_REJECTED) {
        // show dialog that call is rejected by the callee
    }

    if (preOfferAnswer === constant.preOfferAnswer.CALL_ACCEPTED) {
        // send webRTC offer
    }
};

// Event Listners

const acceptCallHandler = () => {
    console.log("call accept");
    sendPreOfferAnswer(constant.preOfferAnswer.CALL_ACCEPTED);
};
const rejectCallHandler = () => {
    console.log("call reject");
    sendPreOfferAnswer(constant.preOfferAnswer.CALL_REJECTED);
};

const callingDialogRejectCallHandler = () => console.log("rejecting the call");
