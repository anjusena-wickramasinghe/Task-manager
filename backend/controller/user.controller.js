import User from "../models/user.model.js";
import Task from "../models/task.model.js"; // Make sure you import Task
import { errorHandler } from "../utils/error.js";

export const getUsers = async (req, res, next) => {
    try {
        // Find all users with role "user", exclude password
        const users = await User.find({ role: "user" }).select("-password");

        // Map users to include task counts
        const usersWithTaskCounts = await Promise.all(
            users.map(async (user) => {
                const pendingTasks = await Task.countDocuments({
                    assignedTo: user._id, // fixed typo: assingnedTo → assignedTo
                    status: "pending",
                });

                const inProgressTasks = await Task.countDocuments({
                    assignedTo: user._id,
                    status: "in-progress", // match enum exactly
                });

                const completedTasks = await Task.countDocuments({
                    assignedTo: user._id,
                    status: "completed",
                });

                return {
                    ...user._doc,
                    pendingTasks,
                    inProgressTasks,
                    completedTasks,
                };
            })
        );

        res.status(200).json({ success: true, users: usersWithTaskCounts });
    } catch (error) {
        next(error);
    }
};

export const getUserById = async (req, res, next)=>{
    try{
const user = await User.findById(req.params.id).select("-password")

if(!user){
    return next(errorHandler(404,"user not found!"))
}
res.status(200).json(user)
    }catch(error){
        next(error)
    }
}
