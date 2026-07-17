'use client'

import { useState } from "react"
import MessageIcon from '@mui/icons-material/Message';
import ChatBox from "./ChatBot";
import './chatbot.css';

export default function OpenChatButton() {
    const [showChatBot, setShowChatBot] = useState<boolean>(false);

    return (
        <>
        {!showChatBot && <div
            className="show-chat-btn"
            onClick={() => setShowChatBot(!showChatBot)}>
                <MessageIcon/>
        </div>}
        {showChatBot && <ChatBox show={showChatBot} setShow={setShowChatBot}/>}
        </>
    )
    

}