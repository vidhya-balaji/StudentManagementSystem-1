
import { Button, ButtonGroup, Container, Dialog, DialogContent, DialogTitle, Stack, TextField, Typography } from "@mui/material"
import CancelIcon from '@mui/icons-material/Cancel';
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
function Add(props) {
    const { openPopUp, setOpenPopUp,setListOfStudents} = props;
    const [regno, setRegno] = useState("");
      const [name, setName] = useState("");
      const [age, setAge] = useState("");
      const [course, setCourse] = useState("");
      const [address, setAddress] = useState("");
      const [CGPA, setCGPA] = useState(""); 
    console.log("Add open popup" + openPopUp);
    const navigate = useNavigate();
     const delay = async (ms) => {
        return new Promise((resolve) =>
            setTimeout(resolve, ms));
    };
    function setClear() {
        setRegno("");
        setName("");
        setAge("");
        setCourse("");
        setAddress("");
        setCGPA("");
      }
    const handleAdd=()=>
    {
        axios.post(process.env.REACT_APP_BASE_URL +"/add",{ regno: regno, name: name, age: age, course: course, address: address, CGPA: CGPA }).then(suc=>
        {
            if(suc.data){
                setOpenPopUp(false)
                toast.error("Record Added Successfully");
                 toast.dismiss();
            }
            else{
                toast.error("Record not Added");
            }
        }
        ).catch(err=>
        {
            toast.error("Record not Added");
        }
        )
        
        setListOfStudents(listOfStudents=>[...listOfStudents,{ regno: regno, name: name, age: age, course: course, address: address, CGPA: CGPA }])
        setClear();
    }
    return (
        <Dialog open={openPopUp} >
            <DialogTitle>
                <Stack direction={"row"} spacing={3} alignContent={"space-evenly"} >
                    <Typography textAlign="center" marginBottom={'20px'} color={'primary'} fontFamily={"sans-serif"} fontWeight={"bold"} fontSize={"25px"}>Add New Record</Typography>
                    <Button onClick={() => { setOpenPopUp(false) }}><CancelIcon color="error" ></CancelIcon></Button>
                </Stack>
            </DialogTitle>
            <DialogContent>
                <Stack direction={"column"} spacing={2} >
                    <TextField id="outlined-basic" value={regno} onChange={(event) => { setRegno(event.target.value) }} label="Register no" variant="outlined" sx={{ margin: '10px' }} />
                    <TextField id="outlined-basic" value={name} onChange={(event) => { setName(event.target.value) }} label="Name" variant="outlined" />
                    <TextField id="outlined-basic" value={age} onChange={(event) => { setAge(event.target.value) }} label="Age" variant="outlined" />
                    <TextField id="outlined-basic" value={address} onChange={(event) => { setAddress(event.target.value) }} label="Address" variant="outlined" />
                    <TextField id="outlined-basic" value={course} onChange={(event) => { setCourse(event.target.value) }} label="Course" variant="outlined" />
                    <TextField id="outlined-basic" value={CGPA} onChange={(event) => { setCGPA(event.target.value) }} label="CGPA" variant="outlined" />
                </Stack>
                <ButtonGroup variant="contained" aria-label="Basic button group" sx={{ boxShadow: "none", display: 'flex', justifyContent: 'space-around', margin: '30px' }}>
                    <Button onClick={handleAdd}>Add</Button>
                    <Button color="error" onClick={() => { setOpenPopUp(false) }}>Cancel</Button>
                </ButtonGroup>
                <ToastContainer/>
            </DialogContent>
        </Dialog>
    )
}
export default Add