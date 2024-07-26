declare module 'react-simple-chatbot' {
    import { ComponentType } from 'react';
  
    interface Step {
      id: string;
      message?: string | (() => string);
      trigger?: string;
      end?: boolean;
      options?: { value: string | number, label: string, trigger: string }[];
    }
  
    interface ChatBotProps {
      steps: Step[];
      [key: string]: any;
    }
  
    const ChatBot: ComponentType<ChatBotProps>;
    export default ChatBot;
  }