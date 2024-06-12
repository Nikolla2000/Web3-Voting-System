'use client'

import CloseIcon from '@mui/icons-material/Close';
import ChatBot from "react-simple-chatbot"
import instructions from './instructions';
import './chatbot.css';

export default function ChatBox({ show, setShow }: {show: boolean, setShow: any}) {
    return (
        <div className={`chatbot-wrapper ${!show && 'remove'}`}>
            <ChatBot steps={instructions}/>
            <CloseIcon onClick={() => setShow(false)}/>
      </div>
    )
}