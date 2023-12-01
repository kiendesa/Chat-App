import React, { useState } from 'react'
import { Box } from "@chakra-ui/layout";
import { Spinner, Text } from '@chakra-ui/react'
import { BellIcon, ChevronDownIcon } from "@chakra-ui/icons";
import { ChatState } from '../../Context/ChatProvider';
import ProfileModel from './ProfileModel';
import { useHistory } from 'react-router-dom'
import {
    Drawer,
    DrawerBody,
    DrawerHeader,
    DrawerOverlay,
    DrawerContent,
    DrawerCloseButton,
    useDisclosure,
    useToast,
    Button, Tooltip, Menu, MenuButton, Avatar, MenuList, MenuItem, MenuDivider, Input
} from '@chakra-ui/react'
import axios from 'axios';
import ChatLoading from '../ChatLoading';
import UserListItem from '../UserAvatar/UserListItem';
import { getSender } from '../../config/ChatLogics';
import NotificationBadge from 'react-notification-badge';
import { Effect } from 'react-notification-badge';


const SideDrawer = () => {

    const [search, setSearch] = useState('');
    const [searchResult, setSearchResult] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingChat, setLoadingChat] = useState();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const btnRef = React.useRef()
    const toast = useToast();

    const { user, setSelectedChat, chats, setChats, notification, setNotification } = ChatState();
    const history = useHistory()

    const logoutHandler = () => {
        localStorage.removeItem("userInfo");
        history.push('/')
    }

    const accessChat = async (userId) => {
        console.log("bbb", user.token);
        try {
            setLoadingChat(true);
            const config = {
                headers: {
                    'Content-type': 'application/json',
                    Authorization: `Bearer ${user.token}`,
                }
            }

            const { data } = await axios.post("/api/chat", { userId }, config);
            if (!chats.find((c) => c._id === data._id)) setChats([data, ...chats]);

            setSelectedChat(data);
            setLoadingChat(false);
            onClose();
        } catch (error) {
            toast({
                title: ' ne!',
                status: 'error',
                duration: 5000,
                isClosable: true,
                position: 'bottom-left'
            })
        }
    }

    const handleSearch = async () => {
        if (!search) {
            toast({
                title: 'Please fill all the Feilds!',
                status: 'warning',
                duration: 5000,
                isClosable: true,
                position: 'top-left'
            })
        }
        try {
            setLoading(true);
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                }
            }

            const { data } = await axios.get(`/api/user?search=${search}`, config)
            setLoading(false);
            setSearchResult(data);
        } catch (error) {
            toast({
                title: 'Error!',
                status: 'error',
                duration: 5000,
                isClosable: true,
                position: 'bottom-left'
            })
        }
    }

    return (
        <>
            <Box
                display='flex'
                justifyContent='space-between'
                alignItems='center'
                bg='white'
                width='100%'
                borderWidth='5px'
            >
                <Tooltip
                    label='Search Users to chat'
                    hasArrow
                    placement='bottom-end'>
                    <Button variant='ghost' ref={btnRef} onClick={onOpen}>
                        <i className="fas fa-search"></i>
                        <Text display={{ base: "none", md: 'flex' }}>
                            Search User
                        </Text>
                    </Button>
                </Tooltip>
                <Text fontSize='2xl' fontFamily='Work sans' >
                    Talk-A-Tive
                </Text>
                <div>
                    <Menu>
                        <MenuButton p={1}>
                            <NotificationBadge
                                count={notification.length}
                                effect={Effect.SCALE}
                            >
                            </NotificationBadge>
                            <BellIcon fontSize="2xl" m={1} />
                        </MenuButton>
                        <MenuList pl={2}>
                            {!notification.length && "No mess"}
                            {notification.map(item => (
                                <MenuItem key={item._id} onClick={() => {
                                    setSelectedChat(item.chat)
                                    setNotification(notification.filter((n) => n !== item))
                                }}>
                                    {item.chat.isGroupChat ? `New message in ${item.chat.chatName}` : `New message from ${getSender(user, item.chat.users)}`}
                                </MenuItem>
                            ))}
                        </MenuList>
                    </Menu>
                    <Menu>
                        <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
                            <Avatar
                                size='sm'
                                cursor='pointer'
                                name={user.name}
                                src={user.pic}
                            />
                        </MenuButton>
                        <MenuList>
                            <ProfileModel user={user}>
                                <MenuItem>My Profile</MenuItem>
                            </ProfileModel>
                            <MenuDivider />
                            <MenuItem onClick={logoutHandler}>Logout</MenuItem>
                        </MenuList>
                    </Menu>
                </div>
            </Box>

            <Drawer
                isOpen={isOpen}
                placement='left'
                onClose={onClose}
                finalFocusRef={btnRef}
            >
                <DrawerOverlay />
                <DrawerContent>
                    <DrawerCloseButton />
                    <DrawerHeader borderBottomWidth='1px'>Search user</DrawerHeader>
                    <DrawerBody>
                        <Box display='flex' pb={2}>
                            <Input
                                placeholder='Search by name or email...'
                                mr={2}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                            <Button
                                onClick={handleSearch}
                            >Go</Button>
                        </Box>
                        {loading ? (
                            <ChatLoading />
                        ) : (
                            searchResult?.map((user) => (
                                < UserListItem
                                    key={user._id}
                                    user={user}
                                    handleFunction={() => accessChat(user._id)}
                                />
                            ))
                        )}
                        {loadingChat && <Spinner ml="auto" display="flex" />}
                    </DrawerBody>
                </DrawerContent>
            </Drawer>
        </>
    )
}

export default SideDrawer