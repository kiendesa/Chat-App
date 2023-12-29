import { ViewIcon } from '@chakra-ui/icons';
import { Box, Button, FormControl, IconButton, Input, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, useDisclosure, useToast } from '@chakra-ui/react';
import React, { useState } from 'react'
import { ChatState } from '../../Context/ChatProvider';
import UserBadgeItem from '../UserAvatar/UserBadgeItem';
import axios from 'axios';
import UserListItem from '../UserAvatar/UserListItem';


const UpdateGroupChatModal = ({ fetchAgain, setFetchAgain, fetchMessages }) => {

    const { isOpen, onOpen, onClose } = useDisclosure();

    const [groupChatName, setGroupChatName] = useState();
    const [search, setSearch] = useState('');
    const [searchResult, setSearchResult] = useState([]);
    const [loading, setLoading] = useState(false);
    const [renameLoading, setRenameLoading] = useState(false);

    const toast = useToast();

    const { user, setSelectedChat, selectedChat } = ChatState();

    const handleSearch = async (query) => {
        setSearch(query);
        if (!query) {
            return;
        }

        try {
            setLoading(true);
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`
                }
            }
            const { data } = await axios.get(`/api/user?search=${search}`, config);
            console.log("search", data);
            setLoading(false);
            setSearchResult(data);
        } catch (error) {
            toast({
                title: "Error Occured!",
                description: "search sai",
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom-left",
            });
        }
    }

    const handleRename = async () => {
        if (!groupChatName) return;

        try {
            setRenameLoading(true);
            const config = {
                headers: {
                    'Content-type': 'application/json',
                    Authorization: `Bearer ${user.token}`,
                }
            }

            const { data } = await axios.put("/api/chat/rename", {
                chatId: selectedChat._id,
                chatName: groupChatName
            }, config);

            console.log("data", data);
            setSelectedChat(data)
            setFetchAgain(!fetchAgain);
            setRenameLoading(false);
        } catch (error) {
            toast({
                title: ' ne!',
                status: 'error',
                duration: 5000,
                isClosable: true,
                position: 'bottom-left'
            })

            setRenameLoading(false)
        }

        setGroupChatName("");
    }

    const handleAddUser = async (userAdd) => {
        if (selectedChat.users.find((u) => u._id === userAdd._id)) {
            toast({
                title: ' Already to Add',
                status: 'error',
                duration: 5000,
                isClosable: true,
                position: 'bottom-left'
            })
            return
        }

        if (selectedChat.groupAdmin._id !== user._id) {
            toast({
                title: ' Only Admin can add',
                status: 'error',
                duration: 5000,
                isClosable: true,
                position: 'bottom-left'
            })
            return
        }

        try {
            setLoading(true);
            const config = {
                headers: {
                    'Content-type': 'application/json',
                    Authorization: `Bearer ${user.token}`,
                }
            }

            const { data } = await axios.put("/api/chat/groupadd", {
                chatId: selectedChat._id,
                userId: userAdd._id,
            }, config);

            setSelectedChat(data)
            setFetchAgain(!fetchAgain);
            setLoading(false);
        } catch (error) {
            toast({
                title: ' loggggggg Addd  sai!',
                status: 'error',
                duration: 5000,
                isClosable: true,
                position: 'bottom-left'
            })
        }
        setGroupChatName("");
    }

    const handleRemove = async (userDel) => {
        if (selectedChat.groupAdmin._id !== user._id && userDel._id !== user._id) {
            toast({
                title: ' can not remove!',
                status: 'error',
                duration: 5000,
                isClosable: true,
                position: 'bottom-left'
            })
        }
        try {
            setLoading(true);
            const config = {
                headers: {
                    'Content-type': 'application/json',
                    Authorization: `Bearer ${user.token}`,
                }
            }

            const { data } = await axios.put(
                `/api/chat/groupremove`,
                {
                    chatId: selectedChat._id,
                    userId: userDel._id,
                },
                config
            );

            userDel._id === user._id ? setSelectedChat() : setSelectedChat(data);
            setFetchAgain(!fetchAgain);
            fetchMessages();
            setLoading(false);
        } catch (error) {
            toast({
                title: ' loggggggg Addd  sai!',
                description: error.response.data.message,
                status: 'error',
                duration: 5000,
                isClosable: true,
                position: 'bottom-left'
            })
            setLoading(false);
        }
        setGroupChatName("");
    }


    return (
        <>
            <IconButton display={{ base: "flex" }} icon={<ViewIcon />} onClick={onOpen} />
            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader fontSize="40px"
                        fontFamily="Work sans"
                        display="flex"
                        justifyContent="center"
                    >
                        {selectedChat.chatName}
                    </ModalHeader>
                    <ModalCloseButton />
                    <ModalBody
                        display="flex"
                        flexDir="column"
                        alignItems="center"
                        justifyContent="space-between"
                    >
                        <Box
                            display="flex"
                            flexWrap="wrap"
                            width="100%"
                        >

                            {selectedChat.users.map((u) => (
                                <UserBadgeItem
                                    key={user._id}
                                    user={u}
                                    admin={selectedChat.groupAdmin}
                                    handleFunction={() => handleRemove(u)}
                                />
                            ))}
                        </Box>

                        <FormControl display="flex">
                            <Input
                                placeholder='Chat name'
                                mb={3}
                                value={groupChatName}
                                onChange={(e) => setGroupChatName(e.target.value)}
                            />
                            <Button
                                ml={1}
                                variant="solid"
                                colorScheme="teal"
                                isLoading={renameLoading}
                                onClick={handleRename}
                            >Update</Button>
                        </FormControl>
                        <FormControl>
                            <Input
                                placeholder='Add user...'
                                mb={1}
                                onChange={(e) => handleSearch(e.target.value)}
                            />
                        </FormControl>
                        {loading ? (
                            <div>loading</div>
                        ) : (
                            searchResult?.slice(0, 4).map((user) => (
                                <UserListItem
                                    key={user._id}
                                    user={user}
                                    handleFunction={() => handleAddUser(user)}
                                />
                            ))
                        )}
                    </ModalBody>

                    <ModalFooter>
                        <Button onClick={() => handleRemove(user)} colorScheme="red">
                            Leave Group
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    )
}

export default UpdateGroupChatModal