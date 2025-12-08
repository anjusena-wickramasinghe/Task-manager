import mongoose from "mongoose";

// Example todoschema (you need to define it before using)
const todoschema = new mongoose.Schema({
    task: { type: String, required: true },
    completed: { type: Boolean, default: false },
});

const taskschema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
        },
        priority: {
            type: String,
            enum: ["low", "medium", "high"],
            default: "low",
        },
        status: {
            type: String,
            enum: ["pending", "in-progress", "completed"],
            default: "pending",
        },
        dueDate: {
            type: Date,
            required: true,
        },
        assignedTo: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User", // Make sure it matches your User model
            },
        ],
        createdBy: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],
        attachments: [
            {
                type: String,
            },
        ],
        todoChecklist: [todoschema],
        progress: { type: Number, default: 0 },
    },
    { timestamps: true }
);

const Task = mongoose.model("Task", taskschema);

export default Task;
