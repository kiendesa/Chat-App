import React, { useEffect, useState } from 'react'
import { ChatState } from '../../Context/ChatProvider';
import { Box, FormControl, IconButton, Input, Spinner, Text, useToast } from '@chakra-ui/react';
import { ArrowBackIcon } from '@chakra-ui/icons';
import { getSender, getSenderFull } from '../../config/ChatLogics';
import ProfileModal from '../miscellaneous/ProfileModal';
import UpdateGroupChatModal from '../miscellaneous/UpdateGroupChatModal';
import axios from 'axios';
import './styles.css'
import Lottie from "react-lottie";
import animationData from '../../animation/typing.json'

import ScrollableChat from './ScrollableChat';
import io from 'socket.io-client';
import EmojiPicker from '../../animation/EmojiPicker';

const ENDPOINT = "http://localhost:5000";
var socket, selectedChatCompare;

const SingleChat = ({ fetchAgain, setFetchAgain }) => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [newMessage, setNewMessage] = useState([]);
    const [socketConnected, setSocketConnected] = useState(false);
    const [typing, setTyping] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const { user, selectedChat, setSelectedChat, notification, setNotification } = ChatState();

    const defaultOptions = {
        loop: true,
        autoplay: true,
        animationData: animationData,
        rendererSettings: {
            preserveAspectRatio: "xMidYMid slice",
        },
    };

    const toast = useToast();

    const fetchMessages = async () => {
        if (!selectedChat) return;

        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`
                }
            }
            const { data } = await axios.get(`/api/message/${selectedChat._id}`, config);
            console.log("message", data);
            setMessages(data);
            setLoading(false);

            socket.emit("join chat", selectedChat._id)
        } catch (error) {
            toast({
                title: "Error!",
                description: "can not fetch message",
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom-left",
            });
        }
    }

    useEffect(() => {
        socket = io(ENDPOINT);
        socket.emit("setup", user);
        socket.on("connected", () => setSocketConnected(true));
        socket.on("typing", () => setIsTyping(true));
        socket.on("stop typing", () => setIsTyping(false));
    }, [])


    useEffect(() => {
        fetchMessages();
        selectedChatCompare = selectedChat
    }, [selectedChat])

    console.log("noti", notification);

    const sendMessage = async (event) => {


        if (event.key === "Enter" && newMessage) {
            socket.emit("stop typing", selectedChat._id);
            try {
                const config = {
                    headers: {
                        Authorization: `Bearer ${user.token}`
                    }
                }
                setNewMessage("");
                const { data } = await axios.post("/api/message",
                    {
                        content: newMessage,
                        chatId: selectedChat._id
                    }, config);

                socket.emit('new message', data)
                console.log("11111", messages);
                setMessages([...messages, data])
            } catch (error) {
                toast({
                    title: "Error!",
                    description: "can not send message",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                    position: "bottom-left",
                });
            }
        }
    }

    useEffect(() => {
        socket.on('message received', (newMessageReceived) => {
            if (!selectedChatCompare || selectedChatCompare._id !== newMessageReceived.chat._id) {
                // give notification
                if (!notification.includes(newMessageReceived)) {
                    setNotification([newMessageReceived, ...notification]);
                    setFetchAgain(!fetchAgain);
                }
            } else {
                console.log("newMessageReceived", newMessageReceived);
                setMessages([...messages, newMessageReceived]);
                console.log("qqq", messages);
            }
        });
    })


    const typingHandler = (e) => {
        setNewMessage(e.target.value);
        console.log("is typing", isTyping);
        if (!socketConnected) return;
        if (!typing) {
            setTyping(true);
            socket.emit("typing", selectedChat._id)
        };

        console.log("is typing 22", isTyping);

        let lastTyping = new Date().getTime();
        var timeLength = 3000;
        setTimeout(() => {
            var timeNow = new Date().getTime();
            var timeDiff = timeNow - lastTyping;

            if (timeDiff >= timeLength && typing) {
                socket.emit("stop typing", selectedChat._id);
                setTyping(false);
            }
        }, timeLength);
    }

    const handleBlur = () => {
        socket.emit("stop typing", selectedChat._id);
    };

    return (
        <>
            {
                selectedChat ? (
                    <>
                        <Text
                            fontSize={{ base: "28px", md: "30px" }}
                            pb={3}
                            px={2}
                            w="100%"
                            fontFamily="Work sans"
                            display="flex"
                            justifyContent={{ base: "space-between" }}
                            alignItems="center"
                        >
                            <IconButton
                                display={{ base: "flex", md: "none" }}
                                icon={<ArrowBackIcon />}
                                onClick={() => setSelectedChat("")}
                            />
                            {!selectedChat.isGroupChat ? (
                                <>
                                    {getSender(user, selectedChat.users)}
                                    <ProfileModal user={getSenderFull(user, selectedChat.users)} />
                                </>
                            ) : (
                                <>
                                    {selectedChat.chatName.toUpperCase()}
                                    <UpdateGroupChatModal fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} fetchMessages={fetchMessages} />
                                </>
                            )}
                        </Text>
                        <Box
                            display="flex"
                            flexDir="column"
                            justifyContent="flex-end"
                            p={3}
                            bg="#E8E8E8"
                            width="100%"
                            height="100%"
                            borderRadius="lg"
                            overflowY="hidden"
                        >
                            {/* Message here */}
                            {loading ? (
                                <Spinner
                                    size="xl"
                                    width={10}
                                    height={10}
                                    alignSelf="center"
                                    margin="auto"
                                />
                            ) : (
                                <div className='message'>
                                    <ScrollableChat messages={messages} />
                                </div>
                            )}

                            <FormControl className='aaaa' onKeyDown={sendMessage} isRequired mt={3}>
                                {/* typing */}
                                {isTyping ?
                                    <div>
                                        <Lottie
                                            options={defaultOptions}
                                            width={70}
                                            style={{ marginBottom: 5, marginLeft: 0 }}
                                        />
                                    </div> : <></>}
                                <div className='input-container'>
                                    <Input
                                        placeholder='Enter a message..'
                                        onChange={typingHandler}
                                        onBlur={handleBlur}
                                        value={newMessage}
                                    // onChange={e => setInputStr(e.target.value)}
                                    />
                                </div>
                            </FormControl>
                        </Box>
                    </>
                ) : (
                    <Box display="flex" alignItems="center" justifyContent="center" h="100%">
                        <Text fontSize="3xl" padding={3} fontFamily="Work sans">Click on a user to start chatting</Text>
                    </Box>
                )
            }
        </>
    )
}

export default SingleChat