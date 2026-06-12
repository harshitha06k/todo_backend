import express from "express"
import cors from "cors"
import mongoose from "mongoose"
import dotenv from "dotenv"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
dotenv.config()
const app = express()
app.use(express.json())
app.use(cors())
const SECRET = "hello123"
app.listen(process.env.PORT,()=>{console.log("server started")})
mongoose.connect(process.env.MONGO_URI)
const userSchema = mongoose.Schema({
    name:"String",
    email:"String",
    password: "String",
})
const userModel = mongoose.model("User", userSchema)

const listSchema = mongoose.Schema({
    task:String
})
const listModel = mongoose.model("List",listSchema)

app.post("/users/register",async (req,res)=>{
    const hashpassword = await bcrypt.hash(req.body.password,10)
     req.body.password = hashpassword
     const user = await userModel.create(req.body)
     res.json(user)
})

app.post("/users/login", async (req, res) => {
    const { email, password } = req.body
    const user = await userModel.findOne({ email })
    if(user) {
        const chkPassword = await bcrypt.compare(password,user.password)
        if(chkPassword) {
            const obj = {
                id: user._id,
                name: user.name,
                email: user.email
        }
        const token = jwt.sign(obj,SECRET,{expiresIn: "1h"})
        res.json({success: true,...obj,token})
        }
        else {
             res.json({success: false,message: "Invalid Password"})

        }

    }
    else {
         res.json({success: false,message: "User not found"})
    }
})


app.get("/lists",async (req,res)=>{
    const lists = await listModel.find()
    res.json(lists)
})

app.post("/lists",async (req,res)=>{
    const list = await listModel.create(req.body)
    res.json(list)
})

app.delete("/lists/:id",async (req,res)=>{
    await listModel.deleteOne({_id: req.params.id})
    res.json({message: "task deleted"})
})