
import { Button, ButtonGroup, Container, TextField, Typography } from "@mui/material"
import { useState } from "react";
import { Await, useLocation, useNavigate } from "react-router-dom"
import { ToastContainer, toast } from 'react-toastify';
function Edit(props) {
    const navigate = useNavigate();
    const editdata = useLocation();
    const [regno, setRegno] = useState(editdata.state.regno);
    const [name, setName] = useState(editdata.state.name);
    const [age, setAge] = useState(editdata.state.age);
    const [address, setAddress] = useState(editdata.state.address);
    const [course, setCourse] = useState(editdata.state.course);
    const [CGPA, setCGPA] = useState(editdata.state.CGPA);
    const listOfStudents = props.listOfStudents;
    const setListOfStudents = props.setListOfStudents;

    const delay = async (ms) => {
        return new Promise((resolve) =>
            setTimeout(resolve, ms));
    };
    function handleCancel() {
        navigate('/studentList')
    }
     function handleUpdate() {
        console.log("Register number" + regno);
        listOfStudents.map(async data => {
            if (data.regno === regno) {
                data.name = name;
                data.age = age;
                data.address = address;
                data.age = age;
                data.course = course;
                data.CGPA = CGPA;
                toast.success("Updated Successfully")
                await delay(2000);
                navigate('/studentList')
            }
        }
        )
    }
    return (
        <Container maxWidth="sm" fixed sx={{ marginTop: '50px', boxShadow: "rgba(0, 0, 0, 0.35) 0px 5px 15px;", height: '690px', padding: '2px' }}>
            <Typography textAlign="center" padding={'10px'} margin={'15px'} color={'primary'} fontFamily={"sans-serif"} fontWeight={"bold"} fontSize={"34px"}>Update Student Details</Typography>
            <TextField id="outlined-basic" value={regno} onChange={(event) => { setRegno(event.target.value) }} label="Register no" variant="outlined" sx={{ width: "70%", marginLeft: "70px", padding: "2px", marginBottom: '20px' }} />
            <TextField id="outlined-basic" value={name} onChange={(event) => {
                console.log(name);
                setName(event.target.value)
            }} label="Name" variant="outlined" sx={{ width: "70%", marginLeft: "70px", padding: "2px", marginBottom: '20px' }} />
            <TextField id="outlined-basic" value={age}
                onChange={(event) => { setAge(event.target.value) }} label="Age" variant="outlined" sx={{ width: "70%", marginLeft: "70px", padding: "2px", marginBottom: '20px' }} />
            <TextField id="outlined-basic" value={address} onChange={(event) => { setAddress(event.target.value) }} label="Address" variant="outlined" sx={{ width: "70%", marginLeft: "70px", padding: "2px", marginBottom: '20px' }} />
            <TextField id="outlined-basic" value={course} onChange={(event) => { setCourse(event.target.value) }} label="Course" variant="outlined" sx={{ width: "70%", marginLeft: "70px", padding: "2px", marginBottom: '20px' }} />
            <TextField id="outlined-basic" value={CGPA} onChange={(event) => { setCGPA(event.target.value) }} label="CGPA" variant="outlined" sx={{ width: "70%", marginLeft: "70px", padding: "2px", marginBottom: '20px' }} />
            <br></br>
            <ButtonGroup variant="contained" aria-label="Basic button group" sx={{ boxShadow: "none", display: 'flex', justifyContent: 'space-around', margin: '30px' }}>
                <Button onClick={handleUpdate}>Update</Button>
                <Button color="error" onClick={handleCancel}>Cancel</Button>
            </ButtonGroup>
            <ToastContainer/>
        </Container>)
}
export default Edit