
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import { useNavigate } from "react-router-dom";
import Box from '@mui/material/Box';
import { Typography } from '@mui/material';
import { blue } from '@mui/material/colors';
import { useState } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
function SignUp() {
    const navigate = useNavigate();

    const [name, setName] = useState();
    const [email, setEmail] = useState();
    const [password, setPassword] = useState();
    function handleName(e) {
        setName(e.target.value);
    }
    const delay = async (ms) => {
        return new Promise((resolve) =>
            setTimeout(resolve, ms));
    };
    function handleEmail(e) {
        setEmail(e.target.value);
    }
    function handlePassword(e) {
        setPassword(e.target.value);
    }
    function register() {
        console.log(name + " " + email + " " + password);
        if (email === "" || email === undefined) {
            toast.error("Email are empty")
        }
        else {
            axios.post(process.env.REACT_APP_BASE_URL +"/register", { email: email, password: password }).then(async result => {
                console.log(result.data);
                if (result.data === true) {
                    console.log("Registered successful");
                    toast.success("Registered Successfully")
                    await delay(2000);
                    navigate('/')
                }
                else if (result.data === "User already exist") {
                    toast.error("User already exist")
                }
                else {
                    toast.error("Registered failed")
                }
            }).catch(err => {
                console.log("Registration failed :" + err)
                toast.error("Registration failed")
            }
            )
        }
    };
    return (
        <Box sx={{
            width: 400,
            height: 400, position: 'absolute', top: '20%', left: '35%', boxShadow: 3
        }}>
            <Typography fontSize={40} color='primary' sx={{ fontFamily: 'ui-sans-serif', textAlign: 'center', fontWeight: 'bold', background: blue }}>SIGN UP</Typography>
            <div >
                <TextField
                    value={name}
                    onChange={handleName}
                    sx={{ m: 2, width: '90%' }}
                    id="outlined-multiline-flexible"
                    label="Username"
                    Name
                    maxRows={4}
                />
            </div>
            <div>
                <TextField
                    value={email}
                    onChange={handleEmail}
                    sx={{ m: 2, width: '90%' }}
                    id="outlined-multiline-flexible"
                    label="Email"
                    Email
                    required
                    maxRows={4}
                /></div><div>
                <TextField
                    value={password}
                    onChange={handlePassword}
                    sx={{ m: 2, width: '90%' }}
                    id="outlined-multiline-flexible"
                    label="Password"
                    type='password'
                    password
                    required
                    maxRows={4}
                />
            </div>
            <Button variant="contained" sx={{ m: 2, width: '90%' }} onClick={register}>Sign Up</Button>
            <ToastContainer />
        </Box>
    )
}
export default SignUp