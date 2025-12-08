import Task from "../models/task.model.js";
import { errorHandler } from "../utils/error.js";

// Create Task
export const createTask = async (req, res, next) => {
  try {
    const {
      title,
      description,
      priority,
      dueDate,
      assignedTo,
      attachments,
      todoChecklist
    } = req.body;

    if (!Array.isArray(assignedTo)) {
      return next(errorHandler(400, "assignedTo must be an array of user IDs"));
    }

    const task = await Task.create({
      title,
      description,
      priority,
      dueDate,
      assignedTo,
      attachments,
      todoChecklist,
      createdBy: req.user.id,
    });

    res.status(201).json({ message: "Task created successfully", task });
  } catch (error) {
    next(error);
  }
};

// Get Tasks
export const getTasks = async (req, res, next) => {
  try {
    const { status } = req.query;

    let filter = {};
    if (status) filter.status = status;

    let tasks;

    if (req.user.role === "admin") {
      tasks = await Task.find(filter).populate("assignedTo", "name email profileImageUrl");
    } else {
      tasks = await Task.find({ ...filter, assignedTo: req.user.id }).populate(
        "assignedTo",
        "name email profileImageUrl"
      );
    }

    tasks = tasks.map(task => {
      const checklist = Array.isArray(task.todoChecklist) ? task.todoChecklist : [];
      const completedCount = checklist.filter(item => item.completed).length;

      return { ...task._doc, completedCount };
    });

    // Status summary
    const baseFilter = req.user.role === "admin" ? {} : { assignedTo: req.user.id };

    const allTasks = await Task.countDocuments(baseFilter);
    const pendingTasks = await Task.countDocuments({ status: "pending", ...baseFilter });
    const inProgressTasks = await Task.countDocuments({ status: "in-progress", ...baseFilter });
    const completedTasks = await Task.countDocuments({ status: "completed", ...baseFilter });

    res.status(200).json({
      tasks,
      statusSummary: {
        all: allTasks,
        pending: pendingTasks,
        inProgress: inProgressTasks,
        completed: completedTasks,
      },
    });
  } catch (error) {
    next(error);
  }
}
export const getTaskById = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id).populate(
      "assignedTo",
      "name email profileImageUrl"
    );

    if (!task) {
      return next(errorHandler(404, "Task not found!"));
    }

    res.status(200).json(task);
  } catch (error) {
    next(error);
  }
}

export const updateTask = async (req, res, next) => {
  try {
    // Fix: correct req.params.id
    const task = await Task.findById(req.params.id);

    if (!task) {
      return next(errorHandler(404, "Task not found!"));
    }

    // Update fields
    task.title = req.body.title || task.title;
    task.description = req.body.description || task.description;
    task.priority = req.body.priority || task.priority;
    task.dueDate = req.body.dueDate || task.dueDate;
    task.todoChecklist = req.body.todoChecklist || task.todoChecklist;
    task.attachments = req.body.attachments || task.attachments;

    // AssignedTo validation
    if (req.body.assignedTo) {
      if (!Array.isArray(req.body.assignedTo)) {
        return next(errorHandler(400, "assignedTo must be an array of user IDs"));
      }
      task.assignedTo = req.body.assignedTo;
    }

    const updatedTask = await task.save();

    return res.status(200).json({
      message: "Task updated successfully!",
      updatedTask
    });
  } catch (error) {
    next(error);
  }
};

export const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return next(errorHandler(404, "Task not found!"));
    }

    await task.deleteOne();

    res.status(200).json({ message: "Task deleted successfully!" });
  } catch (error) {
    next(error);
  }
};
