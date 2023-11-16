import React, { useEffect, useState } from 'react'
import { ChatState } from '../Context/ChatProvider';
import { useToast, Box, Button, Stack, Text } from '@chakra-ui/react';
import axios from 'axios';
import { AddIcon } from '@chakra-ui/icons';
import ChatLoading from './ChatLoading';
import { getSender } from '../config/ChatLogics';
import GroupChatModel from './miscellaneous/GroupChatModel';



const MyChats = ({ fetchAgain }) => {

    const [loggedUser, setLoggedUser] = useState();
    const { selectedChat, setSelectedChat, user, chats, setChats } = ChatState();

    const toast = useToast();

    const fetchChats = async () => {
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`
                }
            }
            const { data } = await axios.get("/api/chat", config);
            setChats(data);
        } catch (error) {
            toast({
                title: "Error Occured!",
                description: "log sai",
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom-left",
            });
        }
    }

    useEffect(() => {
        setLoggedUser(JSON.parse(localStorage.getItem("userInfo")));
        fetchChats();
    }, [fetchAgain])

    return <Box
        display={{ base: selectedChat ? "flex" : "none", md: "flex" }}
        alignItems="center"
        flexDir="column"
        p={3}
        bg="white"
        w={{ base: "100%", md: "31%" }}
        borderRadius="lg"
        borderWidth="1px">
        <Box
            display="flex"
            width="100%"
            padding={3}
            px={3}
            fontFamily={{ base: "28px", md: "30px" }}
            justifyContent="space-between"
            alignItems="center"
        >
            My chats
            <GroupChatModel>
                <Button
                    display="flex"
                    fontSize={{ base: "17px", md: "10px", lg: "17px" }}
                    rightIcon={<AddIcon />}
                >
                    New Group Chat
                </Button>
            </GroupChatModel>
        </Box>
        <Box
            display="flex"
            flexDir="column"
            p={3}
            bg="#F8F8F8"
            width="100%"
            height="100%"
            borderRadius="lg"
            overflowY="hidden"
        >
            {chats ? (
                <Stack
                    overflowY='scroll'
                >
                    {chats.map((chat) => (
                        <Box
                            onClick={() => setSelectedChat(chat)}
                            cursor="pointer"
                            bg={selectedChat === chat ? "#38B2AC" : "#E8E8E8"}
                            color={selectedChat === chat ? "white" : "black"}
                            px={3}
                            py={2}
                            borderRadius="lg"
                            key={chat._id}
                        >
                            <Text>
                                {!chat.isGroupChat ? getSender(loggedUser, chat.users) : chat.chatName}
                            </Text>
                        </Box>
                    ))}
                </Stack>
            ) : (
                <ChatLoading />
            )}
        </Box>
    </Box>


}

export default MyChats