import express from "express"
import cors from "cors"
import mongoose from "mongoose"
import dotenv from "dotenv"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

dotenv.config()

const app = express()
const SECRET = "hello123"

app.use(express.json())
app.use(cors())

mongoose.connect(process.env.MONGO_URI)

app.listen(process.env.PORT, () => console.log("server started"))

const userSchema = mongoose.Schema({
    name: String,
    email: String,
    password: String
})

const listSchema = mongoose.Schema({
    task: String,
    email: String
})

const userModel = mongoose.model("User", userSchema)
const listModel = mongoose.model("List", listSchema)

const authenticate = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization
        const token = authHeader.split(" ")[1]
        const user = jwt.verify(token, SECRET)
        req.user = user
        next()
    }
    catch {
        res.json({ message: "Unauthorized" })
    }
}

app.post("/users/register", async (req, res) => {
    const hashpassword = await bcrypt.hash(req.body.password, 10)
    req.body.password = hashpassword
    const user = await userModel.create(req.body)
    res.json(user)
})

app.post("/users/login", async (req, res) => {
    const { email, password } = req.body
    const user = await userModel.findOne({ email })
    if (user) {
        const chkPassword = await bcrypt.compare(password, user.password)
        if (chkPassword) {
            const obj = {
                id: user._id,
                name: user.name,
                email: user.email
            }
            const token = jwt.sign(obj, SECRET, { expiresIn: "1h" })
            res.json({ success: true, ...obj, token })
        }
        else {
            res.json({ success: false, message: "Invalid Password" })
        }
    }
    else {
        res.json({ success: false, message: "User not found" })
    }
})

app.get("/lists", authenticate, async (req, res) => {
    const lists = await listModel.find({ email: req.user.email })
    res.json(lists)
})

app.post("/lists", authenticate, async (req, res) => {
    const list = await listModel.create({
        task: req.body.task,
        email: req.user.email
    })
    res.json(list)
})

app.delete("/lists/:id", authenticate, async (req, res) => {
    await listModel.deleteOne({
        _id: req.params.id,
        email: req.user.email
    })
    res.json({ message: "Task deleted" })
})