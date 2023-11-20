import React, { useEffect, useState } from 'react'
import { ChatState } from '../../Context/ChatProvider';
import { Box, FormControl, IconButton, Input, Spinner, Text, useToast } from '@chakra-ui/react';
import { ArrowBackIcon } from '@chakra-ui/icons';
import { getSender, getSenderFull } from '../../config/ChatLogics';
import ProfileModal from '../miscellaneous/ProfileModal';
import UpdateGroupChatModal from '../miscellaneous/UpdateGroupChatModal';
import axios from 'axios';
import './styles.css'
import ScrollableChat from './ScrollableChat';

const SingleChat = ({ fetchAgain, setFetchAgain }) => {

    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [newMessage, setNewMessage] = useState([]);

    const { user, selectedChat, setSelectedChat } = ChatState();
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
        fetchMessages();
    }, [selectedChat])

    const sendMessage = async (event) => {
        if (event.key === "Enter" && newMessage) {
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


    const typingHandler = (e) => {
        setNewMessage(e.target.value);
    }

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

                            <FormControl onKeyDown={sendMessage} isRequired mt={3}>
                                <Input
                                    variant="filled"
                                    bg="#E0E0E0"
                                    placeholder='Enter a message..'
                                    onChange={typingHandler}
                                    value={newMessage} />
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