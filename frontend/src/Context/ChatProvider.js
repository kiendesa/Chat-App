import { createContext, useContext, useEffect, useState } from 'react'
import { useHistory } from 'react-router-dom';

const ChatContext = createContext();

const ChatProvider = ({ children }) => {
    const [user, setUser] = useState();
    const [selectedChat, setSelectedChat] = useState();
    const [chats, setChats] = useState([]);
    const [notification, setNotification] = useState([]);
    const [shouldRender, setShouldRender] = useState(false);

    const history = useHistory();

    useEffect(() => {
        const userInfo = JSON.parse(localStorage.getItem("userInfo"));
        console.log("userInfo", userInfo);
        setUser(userInfo);
        if (!userInfo) {
            history.push('/')
        }
        setShouldRender(false);
    }, [shouldRender])

    return <ChatContext.Provider value={{ user, setUser, selectedChat, setSelectedChat, chats, setChats, notification, setNotification, setShouldRender }}>
        {children}
    </ChatContext.Provider>
};

export const ChatState = () => {
    return useContext(ChatContext);
}

export default ChatProvider;