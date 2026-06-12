import express from "express"
import cors from "cors"
import mongoose from "mongoose"
import dotenv from "dotenv"
dotenv.config()
const app = express()
app.use(express.json())
app.use(cors())
app.listen(process.env.PORT,()=>{console.log("server started")})
mongoose.connect(process.env.MONGO_URI)

const listSchema = mongoose.Schema({
    task:String
})
const listModel = mongoose.model("List",listSchema)

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