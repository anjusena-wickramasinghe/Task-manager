import express from "express"
import cors from "cors"
import dotenv from "dotenv"


dotenv.config()
const app = express();

//middleware to handle CORS
app.use(cors({
    origin: process.env.FRONT_END_URL || "http://localhost:5173",
    method: ["GET","POST","PUT","DELETE"],
    allowedHeaders: ["content-type","authorization"],
}))

//middeleware to handle JSON object in req body
app.use(express.json())

app.listen(3000,() =>{
    console.log("server is running on port 3000");
})
