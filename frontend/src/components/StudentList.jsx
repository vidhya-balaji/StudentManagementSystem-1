import { Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from "@mui/material"
import { useNavigate } from "react-router-dom";
import DeleteIcon from '@mui/icons-material/Delete';
import axios from "axios";
import AddIcon from '@mui/icons-material/Add';
import Add from "./Add";
import { useState } from "react";
function StudentList(props) {
  const navigate = useNavigate();
  const listOfStudents = props.listOfStudents;
  const setListOfStudents = props.setListOfStudents;
  const [openPopUp, setOpenPopUp] = useState(false);
  function handleEdit(editRegNo) {
    console.log(editRegNo);
    axios.post("https://student-management-system-backend-nu.vercel.app/edit", { editRegNo }).then((res) => {
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

  function handleDelete(deleteid) {
    var temp = listOfStudents.filter((data) => {
      if (data.regno === deleteid)
        return false;
      else
        return true;
    })
    setListOfStudents(temp)
  }
  function handleNewRecord() {
    setOpenPopUp(true);
  }
  return (
    <TableContainer sx={{ width: "80%", position: "absolute", left: "10%", top: "10%" }} component={Paper}>
      <Typography textAlign="center" marginBottom={'20px'} color={'primary'} fontFamily={"sans-serif"} fontWeight={"bold"} fontSize={"34px"}>Students Management System</Typography>
      <TextField label="Search...." sx={{ width: '40%', margin: '20px' }} />
      <Button onClick={handleNewRecord} color="primary" variant="contained" sx={{ height: '50px', margin: '20px' }} endIcon={<AddIcon />}>Add</Button>
      <Table sx={{ minWidth: 800 }} aria-label="simple table">
        <TableHead sx={{ background: "#2196f3" }}>
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
                <Button variant="contained" color="primary" onClick={() => handleEdit(data.regno)} sx={{ m: 1, hover: "text-black bg-blue-400" }}>Edit</Button>
                <Button variant="contained" color="error" onClick={() => handleDelete(data.regno)} startIcon={<DeleteIcon />} sx={{ m: 1, hover: "text-black bg-red-400" }}>Delete</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Add openPopUp={openPopUp} setOpenPopUp={setOpenPopUp} listOfStudents={listOfStudents} setListOfStudents={setListOfStudents}></Add>
    </TableContainer>
  )
}
export default StudentList