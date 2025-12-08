import Task from "../models/task.model.js"
import { errorHandler } from "../utils/error.js"

export const createTask = async (req, res, next)=>{
    try{
const {title, description, priority, dueDate, assignedTo, attachments,todoCheckList}=req.body

if(!Array.isArray(assignedTo)){
    return next(errorHandler(400,"assingned to must be an array of user IDs"))
}

const task =await Task.create({
    title, description, priority, dueDate, assignedTo,attachments,todoCheckList,
    createdBy: req.user.id,
})
res.status(201).json({"message":"Task created successfully",task})

    }catch(error){
        next(error)
    }
}