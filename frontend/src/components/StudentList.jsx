
import { AppBar, Box, Button, Container, Icon, Menu, MenuItem, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Toolbar, Typography } from "@mui/material"
import { useNavigate } from "react-router-dom";
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import axios from "axios";
import AddIcon from '@mui/icons-material/Add';
import Add from "./Add";
import { useState } from "react";
import StudentIcon from "../asset/icon.png";
import { ToastContainer, toast } from "react-toastify";
function StudentList(props) {
  const navigate = useNavigate();
  const listOfStudents = props.listOfStudents;
  const setListOfStudents = props.setListOfStudents;
  const [openPopUp, setOpenPopUp] = useState(false);
  const [search, setSearch] = useState();
  const delay = async (ms) => {
    return new Promise((resolve) =>
      setTimeout(resolve, ms));
  };
  function handleEdit(editRegNo) {
    console.log(editRegNo);
    axios.post(process.env.REACT_APP_BASE_URL +"/edit", { editRegNo }).then((res) => {
      console.log(res.data);
      if (res.data === true) {
        listOfStudents.map(students => {
          if (students.regno === editRegNo) {
            navigate('/edit', { state: { regno: editRegNo, name: students.name, age: students.age, address: students.address, course: students.course, CGPA: students.CGPA } })
          }
        })
      }
    }).catch((err) => { console.log("Registration failed :" + err) })
  };
  function handleSearch(evt)
  {
    setSearch(evt.target.value);
    console.log(search);
    var list =listOfStudents.filter(item => item.regno.toString().includes(evt.target.value));
    console.log(list);
    setListOfStudents(list);
  }

  async function handleDelete(deleteid) {
    var temp = listOfStudents.filter((data) => {
      if (data.regno === deleteid)
        return false;
      else
        return true;
    })
    toast.info("Record deleted Successfully")
    await delay(2000);
    setListOfStudents(temp)
  }
  function handleNewRecord() {
    setOpenPopUp(true);
  }
  return (
    <Container maxWidth="xl">
      <AppBar position="sticky" sx={{ width: '100%' }}>
        <Container maxWidth="xl" sx={{ display: 'flex' }}>
          <Container sx={{ display: 'flex', justifyContent: "flex-start" }}>
            <img src={StudentIcon} width={"50px"} height={"50px"}></img>
            <Typography
              variant="h6"
              noWrap
              component="a"
              href="/studentlist"
              sx={{
                mr: 2,
                display: { xs: 'none', md: 'flex' },
                fontFamily: 'monospace',
                fontWeight: 700,
                letterSpacing: '.3rem',
                color: 'inherit',
                textDecoration: 'none',
              }}
            >STUDIX</Typography>
          </Container>
          <Button variant="text" color="white" sx={{ position: "relative", right: '0%', "&:hover": { cursor: "pointer", color: 'black', boxShadow: 3 } }}>MarkDetails</Button>
          <Button variant="text" color="white" onClick={() => { navigate('/') }} sx={{ position: "relative", right: '0%', "&:hover": { cursor: "pointer", color: 'black', boxShadow: 3 } }}>Log Out</Button>
        </Container>
      </AppBar>
      <TableContainer sx={{ width: "80%", position: "absolute", left: "10%", top: "15%" }} component={Paper}>
        <Stack direction="row"
          spacing={2} margin={2}
          sx={{
            justifyContent: "end",
          }}>
          <TextField value={search} onChange={(evt)=>{handleSearch(evt)}} label="Search...." sx={{ width: '40%', margin: '20px' }} />
          <Button onClick={handleNewRecord} color="primary" variant="contained" sx={{ height: '50px', margin: '20px' }} endIcon={<AddIcon />}>Add</Button>
        </Stack>
        <Table sx={{ minWidth: 800 }} aria-label="simple table">
          <TableHead sx={{ background: '#2196f3', color: "white" }}>
            <TableRow >
              <TableCell>Reg No</TableCell>
              <TableCell align="left">Name</TableCell>
              <TableCell align="left">Age</TableCell>
              <TableCell align="left">Course</TableCell>
              <TableCell align="left">Address</TableCell>
              <TableCell align="left">CGPA</TableCell>
              <TableCell align="left">Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {listOfStudents.map((data) => (
              <TableRow
                key={data.name}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell component="th" scope="row">
                  {data.regno}
                </TableCell>
                <TableCell align="left">{data.name}</TableCell>
                <TableCell align="left">{data.age}</TableCell>
                <TableCell align="left">{data.course}</TableCell>
                <TableCell align="left">{data.address}</TableCell>
                <TableCell align="left">{data.CGPA}</TableCell>
                <TableCell align="left" sx={{ justifyItems: "space-between" }}>
                  <Button variant="contained" color="primary" onClick={() => handleEdit(data.regno)} startIcon={<EditIcon />} sx={{ m: 1, hover: "text-black bg-blue-400" }}>Edit</Button>
                  <Button variant="contained" color="error" onClick={() => handleDelete(data.regno)} startIcon={<DeleteIcon />} sx={{ m: 1, hover: "text-black bg-red-400" }}>Delete</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <Add openPopUp={openPopUp} setOpenPopUp={setOpenPopUp} listOfStudents={listOfStudents} setListOfStudents={setListOfStudents}></Add>
      </TableContainer>
      <ToastContainer />
    </Container>
  )
}
export default StudentList