import React, { useContext, useEffect, useRef, useState } from "react";
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
import globalContext from "../../contexts/globalContext";

const ChatPage = () => {
  const globalContextHandler = useContext(globalContext);
  const chatHandlerRef = useRef({
    onReceive: (_callback: (message: ChatData) => void) => {},
    sendMessage: (_message: ChatData) => {},
    initialised: false,
  });
  const [chatsFetched, updateChatsFetchedState] = useState<boolean>(false);
  const [messageList, updateMessageList] = useState<Array<ChatData>>([
    {
      message: "Hey! Let's chat! How are you holding up?",
      ts: new Date().toISOString(),
      sender: "ai",
    }
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

  useEffect(() => {
    if (!chatsFetched) {
      globalContextHandler.request("chats/all", {})
      .get()
      .then((response) => {
        console.log("response:", response);
        updateMessageList([ ...messageList, ...response.data ]);
      })
      .catch((err) => {
        console.log("error:", err);
      });
      updateChatsFetchedState(true);
    }
    return () => {
      socketManager.chatHandler.sendMessage({}, true);
    }
  }, []);

  const handleMessageChange = (value: string) => {
    setInputMessage(value);
  };

  return (
    <div style={{ position: "relative", height: "100vh", width: "100%" }}>
      <MainContainer>
        <ChatContainer>
          <MessageList>
            {(messageList || []).map((message, index) => (
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
