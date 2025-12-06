import mongoose from "mongoose";

const taskschema = new mongoose.Schema(
    {
        title:{
            type:String,
            required:true
        },
        description:{
            type:string
        },
        priority:{
            type:string,
            enum:["low","medium","high"],
            default:"low",
        },
        status:{
            type:string,
            enum:["pending","in-progress","completed"],
            default:"pending",
        },
        dueDate:{
            type:Date,
            required:true,
        },

        assigenedTo:[{
            type:mongoose.Schema.types.objectId,
            ref:"user",
        },],
        createdBy:[
            {
                type:mongoose.Schema.types.objectId,
                ref:"users",
            },
        ],
        attachments:[
            {
                type:string,
            },
        ],
        todoChecklist:[todoschema],
        progress:{type:Number,default:0},
    },
    {timestamps:true}
)

const Task = mongoose.model("Task",taskschema)

export default Task