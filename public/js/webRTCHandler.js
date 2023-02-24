import * as wss from "./wss.js";
import * as constant from "./constants.js";
import * as ui from "./ui.js";

let connectedUserDetails;

export const sendPreOffer = (callType, calleePersonalCode) => {
    const data = {
        callType,
        calleePersonalCode,
    };

    wss.sendPreOffer(data);
};

export const handlePreOffer = (data) => {
    const { callType, callerSocketId } = data;

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

const acceptCallHandler = () => console.log("call accept");
const rejectCallHandler = () => console.log("call reject");
