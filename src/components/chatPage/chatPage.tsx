import React, { useEffect, useRef, useState } from "react";
import "@chatscope/chat-ui-kit-styles/dist/default/styles.min.css";
import {
  MainContainer,
  ChatContainer,
  MessageList,
  Message,
  MessageInput,
} from "@chatscope/chat-ui-kit-react";
import { ChatData } from "../../types/types";
import socketManager from "../../utils/socketManager";

const ChatPage = () => {
  const chatHandlerRef = useRef({
    onReceive: (_callback: (message: ChatData) => void) => {},
    sendMessage: (_message: ChatData) => {},
    initialised: false,
  });
  const [messageList, updateMessageList] = useState<Array<ChatData>>([
    {
      message: "Hello!",
      ts: new Date().toISOString(),
      sender: "user",
    },
    {
      message: "How are you?",
      ts: new Date().toISOString(),
      sender: "ai",
    },
    {
      message: "I'm doing great!",
      ts: new Date().toISOString(),
      sender: "user",
    },
    {
      message: "What's up?",
      ts: new Date().toISOString(),
      sender: "user",
    },
    {
      message: "Not much, just working on this project.",
      ts: new Date().toISOString(),
      sender: "ai",
    },
    {
      message: "That sounds interesting.",
      ts: new Date().toISOString(),
      sender: "user",
    },
    {
      message: "Yeah, it's been a lot of fun.",
      ts: new Date().toISOString(),
      sender: "ai",
    },
    {
      message: "I'm glad to hear that.",
      ts: new Date().toISOString(),
      sender: "user",
    },
    {
      message: "By the way, have you seen the latest episode of that show?",
      ts: new Date().toISOString(),
      sender: "user",
    },
    {
      message: "No, I haven't. Is it any good?",
      ts: new Date().toISOString(),
      sender: "ai",
    },
  ]);
  const [inputMessage, setInputMessage] = useState<string>("");


  useEffect(() => {
    // Connect to the socket
    console.log("connecting to socket...");
    socketManager.connect();
  }, []);

  useEffect(() => {
      socketManager.chatHandler.onReceive((message: ChatData) => {
        console.log("received message:", message);
        updateMessageList([...messageList, message]);
      });
  }, [messageList]);

  const handleMessageChange = (value: string) => {
    setInputMessage(value);
  };

  return (
    <div style={{ position: "relative", height: "100vh" }}>
      <MainContainer>
        <ChatContainer>
          <MessageList>
            {messageList.map((message, index) => (
              <Message
                key={index}
                model={{
                  message: message.message,
                  sentTime: message.ts,
                  sender: message.sender,
                  direction:
                    message.sender === "user" ? "outgoing" : "incoming",
                  position: "single",
                }}
              />
            ))}
          </MessageList>
          <MessageInput
            placeholder="Type message here"
            value={inputMessage}
            onChange={(innerHtml, textContent) => {
              handleMessageChange(textContent);
            }}
            onSend={() => {
              const chatObj: ChatData = {
                message: inputMessage,
                ts: new Date().toISOString(),
                sender: "user",
              };
              socketManager.chatHandler.sendMessage(chatObj);
              updateMessageList([
                ...messageList,
                chatObj
              ]);
              setInputMessage("");
            }}
          />
        </ChatContainer>
      </MainContainer>
    </div>
  );
};

export default ChatPage;
