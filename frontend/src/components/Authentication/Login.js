import React, { useState } from 'react'
import { FormControl, FormLabel, VStack, Input, InputGroup, InputRightElement, Button, useToast } from '@chakra-ui/react'
import axios from 'axios';
import { useHistory } from 'react-router-dom';
import { ChatState } from "../../Context/ChatProvider"


const Login = () => {

    const [email, setEmail] = useState();
    const [password, setPassword] = useState();
    const [loading, setLoading] = useState(false);
    const [show, setShow] = React.useState(false)
    const handleClick = () => setShow(!show)
    const toast = useToast();

    const history = useHistory();

    const { setShouldRender } = ChatState();

    const submitLoginHandler = async () => {
        setLoading(true);
        if (!email || !password) {
            toast({
                title: 'Please fill all the Feilds!',
                status: 'warning',
                duration: 5000,
                isClosable: true,
                position: 'bottom'
            })
            setLoading(false);
            return;
        }

        try {
            const config = {
                headers: {
                    "Content-type": "application/json"
                }
            }
            const { data } = await axios.post("/api/user/login", { email, password }, config);
            toast({
                title: 'Login Successful!',
                status: 'warning',
                duration: 5000,
                isClosable: true,
                position: 'bottom'
            })

            localStorage.setItem('userInfo', JSON.stringify(data));
            setLoading(false);
            setShouldRender(true);
            history.push('/chats');
        } catch (error) {
            toast({
                title: 'Error!',
                description: error.response.data.message,
                status: 'warning',
                duration: 5000,
                isClosable: true,
                position: 'bottom'
            })
            setLoading(false);
        }
    }
    const submitCreHandler = () => {

    }

    return <VStack>
        <FormControl id='email' isRequired>
            <FormLabel>
                Email
            </FormLabel>
            <Input placeholder='email' onChange={(e) => setEmail(e.target.value)} />
        </FormControl>
        <FormControl id='password' isRequired>
            <FormLabel>
                Pass word
            </FormLabel>
            <InputGroup size='md'>
                <Input
                    pr='4.5rem'
                    type={show ? 'text' : 'password'}
                    placeholder='Enter password'
                    onChange={(e) => setPassword(e.target.value)}
                />
                <InputRightElement width='4.5rem'>
                    <Button h='1.75rem' size='sm' onClick={handleClick}>
                        {show ? 'Hide' : 'Show'}
                    </Button>
                </InputRightElement>
            </InputGroup>
        </FormControl>

        <Button
            colorScheme='blue'
            width='100%'
            style={{ marginTop: 15 }}
            onClick={submitLoginHandler}
            isLoading={loading}
        >
            Login
        </Button>
        <Button
            colorScheme='red'
            width='100%'
            style={{ marginTop: 15 }}
            onClick={submitCreHandler}
        >
            Get Guest User Credentials
        </Button>
    </VStack>
}

export default Login