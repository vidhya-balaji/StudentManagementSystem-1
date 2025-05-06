const express = require("express")
const cors = require("cors")
const mongoose=require("mongoose")
const UserModel=require("./models/Users")
const registermodel=require("./models/register")

const app = express();
app.use(express.urlencoded({ extended: true }))
//app.use(cors())

app.use(cors({origin:"https://student-management-system-frontend-three.vercel.app",credentials:true,exposedHeaders:['X-Total-Count'],methods:['GET','POST','PATCH','DELETE']}))

mongoose.connect("mongodb+srv://vidhyabalajinina:vidhyabalaji15@cluster0.ivefj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0").then(()=>console.log("Database connected successfully"))
.catch((e)=>console.log("Database connection failed"+e))
const userdata=[
    {username:'vidhya@gmail.com',password:'Pass1234%'},
    {username:'demo@gmail.com',password:'helloWorld@123'},
]
app.post('/edit',function(req,res)
{
    console.log(res);
    res.send(true);
})
app.post('/add',function(req,res)
{
    console.log(res);
    res.send(true);
})
app.post('/register',function(req,res)
{
registermodel.create(req.body).then(registeruser=>{
    res.json(registeruser)
}).catch(err=>
{
    res.json(err);
}
)
})
app.get("/login",function(req,res)
{
    console.log(UserModel.find({}));
    console.log(req.query);
    console.log(req.query.UserName);
    userdata.map((data)=>
    {
        if(data.username===req.query.UserName&&data.password===req.query.password)
        {
            res.send(true)
        }
        else
        {
            res.send(req.query)
        }
    })

    
})
app.listen("5000", function () {
    console.log("Server Successfully started in Port 5000........");

})
app.get("/",(req,res)=>{
    res.status(200).json({message:'running'})
})