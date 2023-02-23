import * as store from "./store.js";
import * as wss from "./wss.js";
import * as webRTCHandler from "./webRTCHandler.js";
import * as constants from "./constants.js";

// Socket.io Connection

const socket = io("/");
wss.registerSocketEvents(socket);

// register event for personal code copy button

const personalCodeCopyButton = document.getElementById(
    "personal_code_copy_button"
);

personalCodeCopyButton.addEventListener("click", () => {
    const personalCode = store.getState().socketId;
    navigator.clipboard && navigator.clipboard.writeText(personalCode);
});

// register event listners for connection buttons

const personalCodeChatButton = document.getElementById(
    "personal_code_chat_button"
);
// console.log(personalCodeChatButton);

const personalCodeVideoButton = document.getElementById(
    "personal_code_video_button"
);
// console.log(personalCodeVideoButton);

personalCodeChatButton.addEventListener("click", () => {
    console.log("chat btn clicked & pre offer send");
    // get values from personal personal_code_input

    const calleePersonalCode = document.getElementById(
        "personal_code_input"
    ).value;

    const callType = constants.callType.CHAT_PERSONAL_CODE;
    webRTCHandler.sendPreOffer(callType, calleePersonalCode);
});
personalCodeVideoButton.addEventListener("click", () => {
    console.log("video btn clicked & pre offer send");
    // get values from personal personal_code_input

    const calleePersonalCode = document.getElementById(
        "personal_code_input"
    ).value;

    const callType = constants.callType.VIDEO_PERSONAL_CODE;
    webRTCHandler.sendPreOffer(callType, calleePersonalCode);
});
