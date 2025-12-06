import mongoose  from "mongoose";

const userschema = new mongoose.Schema(
    {
    name:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:true,
        unique:true,
    },
    password:{
        type:String,
        required:true,
    },
    profileImageUrl:{
        type:String,
        default:"https://i.imgur.com/HeIi0wU.png"
    },
    role:{
        type:String,
        enum:["admin","user"],
        default:"user",
    },
    },
    {timestamps:true}
)

const user= mongoose.model("user",userschema)
export default user;