import React, { useEffect, useState } from 'react'
import { ChatState } from '../../Context/ChatProvider';
import { Box, FormControl, IconButton, Input, Spinner, Text, useToast, Button } from '@chakra-ui/react';
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
import { FaFileImage } from 'react-icons/fa';


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
    const [pic, setPic] = useState();

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
        if (!socketConnected) return;
        if (!typing) {
            setTyping(true);
            socket.emit("typing", selectedChat._id)
        };

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

    const [selectedImages, setSelectedImages] = useState([]);


    const handleImageChange = (event) => {
        const files = event.target.files;
        const newImages = Array.from(files);
        if (newImages.length > 0) {
            newImages.forEach(element => {
                const data = new FormData();
                data.append("file", element);
                data.append("upload_preset", "chat-app")
                data.append("cloud_name", "dqux6rudi");
                fetch("https://api.cloudinary.com/v1_1/dqux6rudi/image/upload", {
                    method: 'post',
                    body: data
                }).then((res) => res.json())
                    .then(data => {
                        let imageUrl = data.url.toString();
                        setSelectedImages(prevImages => [...prevImages, imageUrl]);
                        console.log("aaa", imageUrl);
                        setLoading(false);
                    })
                    .catch((err) => {
                        console.log(err);
                        setLoading(false);
                    })
            });
        }
    };

    const handleSendImages = async () => {
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`
                }
            }
            setSelectedImages([]);
            console.log('list images:', selectedImages);
            selectedImages.forEach(element => {
                const { data } = axios.post("/api/message",
                    {
                        images: element,
                        chatId: selectedChat._id
                    }, config);
                socket.emit('new message', data)
                setMessages([...messages, data])
            });

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
                                    <div>
                                        <div>
                                            <label htmlFor="fileInput" className="file-input-label">
                                                <FaFileImage className="file-input-icon" />
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    id="fileInput"
                                                    onChange={handleImageChange}
                                                    multiple
                                                    className="visually-hidden"
                                                />
                                            </label>
                                        </div>
                                    </div>
                                    <Input
                                        placeholder='Enter a message..'
                                        onChange={typingHandler}
                                        onBlur={handleBlur}
                                        value={newMessage}
                                    />
                                    <div>
                                        <button onClick={handleSendImages} disabled={selectedImages.length === 0}>
                                            Send
                                        </button>
                                    </div>
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