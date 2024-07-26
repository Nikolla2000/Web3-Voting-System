'use client'

import CloseIcon from '@mui/icons-material/Close';
import ChatBot from "react-simple-chatbot"
import instructions from './instructions';
import './chatbot.css';

interface ChatBoxProps {
    show: boolean;
    setShow: (show: boolean) => void;
}

export default function ChatBox({ show, setShow }: ChatBoxProps) {
    return (
        <div className={`chatbot-wrapper ${!show && 'remove'}`}>
            <ChatBot steps={instructions}/>
            <CloseIcon onClick={() => setShow(false)}/>
      </div>
    )
}