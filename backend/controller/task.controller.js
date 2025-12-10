import mongoose from "mongoose";
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

export const updateTaskStatus = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return next(errorHandler(404, "Task not found!"));
    }

    // Check if the logged-in user is assigned to the task
    const isAssigned = task.assignedTo.some(
      (userId) => userId.toString() === req.user.id.toString()
    );

    // Only assigned users or admins can update
    if (!isAssigned && req.user.role !== "admin") {
      return next(errorHandler(403, "Unauthorized!"));
    }

    // Update status
    task.status = req.body.status || task.status;

    // If completed, mark all checklist items as completed
    if (task.status === "completed") {
      task.todoChecklist.forEach((item) => {
        item.completed = true;
      });
    }

    await task.save();

    res.status(200).json({ message: "Task status updated", task });
  } catch (error) {
    next(error);
  }
}

export const updateTaskChecklist = async (req, res, next) => {
  try {
    const { todoChecklist } = req.body;

    const task = await Task.findById(req.params.id);

    if (!task) {
      return next(errorHandler(404, "Task not found!"));
    }

    // Only assigned users or admins can update
    const isAssigned = task.assignedTo.some(
      (userId) => userId.toString() === req.user.id.toString()
    );
    if (!isAssigned && req.user.role !== "admin") {
      return next(errorHandler(403, "Not authorized to update checklist"));
    }

    // Ensure todoChecklist is always an array and contains required 'title'
    if (!Array.isArray(todoChecklist)) {
      return next(errorHandler(400, "todoChecklist must be an array"));
    }

    for (let i = 0; i < todoChecklist.length; i++) {
      if (!todoChecklist[i].title) {
        return next(errorHandler(400, `Checklist item at index ${i} must have a title`));
      }
      if (typeof todoChecklist[i].completed !== "boolean") {
        todoChecklist[i].completed = false; // default if missing
      }
    }

    task.todoChecklist = todoChecklist;

    // Calculate progress
    const completedCount = task.todoChecklist.filter(item => item.completed).length;
    const totalItems = task.todoChecklist.length;
    task.progress = totalItems > 0 ? Math.round((completedCount / totalItems) * 100) : 0;

    // Update status based on progress
    if (task.progress === 100) {
      task.status = "completed";
    } else if (task.progress > 0) {
      task.status = "In Progress";
    } else {
      task.status = "pending";
    }

    await task.save();

    const updatedTask = await Task.findById(req.params.id).populate(
      "assignedTo",
      "name email profileImageUrl"
    );

    res.status(200).json({
      message: "Task checklist updated successfully",
      task: updatedTask
    });

  } catch (error) {
    next(error);
  }
}
export const getDashboardData = async (req, res, next) => {
  try {
    // ====== BASIC STATISTICS ======
    const totalTasks = await Task.countDocuments();
    const pendingTasks = await Task.countDocuments({ status: "pending" });
    const completedTasks = await Task.countDocuments({ status: "completed" });

    // overdue: not completed + due date passed
    const overdueTasks = await Task.countDocuments({
      status: { $ne: "completed" },
      dueDate: { $lt: new Date() },
    });

    // ====== TASK DISTRIBUTION (BY STATUS) ======
    const taskStatuses = ["pending", "in progress", "completed"];

    const taskDistributionRaw = await Task.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    const taskDistribution = taskStatuses.reduce((acc, status) => {
      const formattedKey = status.replace(/\s+/g, "");
      acc[formattedKey] =
        taskDistributionRaw.find((item) => item._id === status)?.count || 0;
      return acc;
    }, {});

    taskDistribution["All"] = totalTasks;

    // ====== PRIORITY LEVEL DISTRIBUTION ======
    const taskPriorities = ["Low", "Medium", "High"];

    const taskPriorityLevelRaw = await Task.aggregate([
      { $group: { _id: "$priority", count: { $sum: 1 } } },
    ]);

    const taskPriorityLevel = taskPriorities.reduce((acc, priority) => {
      acc[priority] =
        taskPriorityLevelRaw.find((item) => item._id === priority)?.count || 0;
      return acc;
    }, {});

    // ====== RECENT TASKS ======
    const recentTasks = await Task.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select("title status priority dueDate createdAt");

    // ====== RESPONSE ======
    res.status(200).json({
      statistics: {
        totalTasks,
        pendingTasks,
        completedTasks,
        overdueTasks,
      },
      charts: {
        taskDistribution,
        taskPriorityLevel,
      },
      recentTasks,
    });
  } catch (error) {
    next(error);
  }
}

export const userDashboardData = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const userObjectId = new mongoose.Types.ObjectId(userId)

    console.log(userObjectId)

    // ===================== BASIC STATISTICS =====================
    const totalTasks = await Task.countDocuments({
      assignedTo: userId,
    });

    const pendingTasks = await Task.countDocuments({
      assignedTo: userId,
      status: "pending",
    });

    const completedTasks = await Task.countDocuments({
      assignedTo: userId,
      status: "completed",
    });

    const overdueTasks = await Task.countDocuments({
      assignedTo: userId,
      status: { $ne: "completed" },
      dueDate: { $lt: new Date() },
    });

    // ===================== TASK DISTRIBUTION =====================
    const taskStatuses = ["pending", "in progress", "completed"];

    const taskDistributionRaw = await Task.aggregate([
      {
        $match: { assignedTo: userObjectId },
      },
      {
        $group: { _id: "$status", count: { $sum: 1 } },
      },
    ]);
    console.log(taskDistributionRaw)

    const taskDistribution = taskStatuses.reduce((acc, status) => {
      const formattedKey = status.replace(/\s+/g, "");
      acc[formattedKey] =
        taskDistributionRaw.find((item) => item._id === status)?.count || 0;

      return acc;
    }, {});

    taskDistribution["All"] = totalTasks;

    // ===================== PRIORITY LEVEL DISTRIBUTION =====================
    const taskPriorities = ["Low", "Medium", "High"];

    const taskPriorityLevelRaw = await Task.aggregate([
      {
        $match: { assignedTo: userObjectId },
      },
      {
        $group: { _id: "$priority", count: { $sum: 1 } },
      },
    ]);

    const taskPriorityLevel = taskPriorities.reduce((acc, priority) => {
      acc[priority] =
        taskPriorityLevelRaw.find((item) => item._id === priority)?.count || 0;
      return acc;
    }, {});

    // ===================== RECENT TASKS =====================
    const recentTasks = await Task.find({ assignedTo: userObjectId })
      .sort({ createdAt: -1 })
      .limit(10)
      .select("title status priority dueDate createdAt");

    // ===================== RESPONSE =====================
    res.status(200).json({
      statistics: {
        totalTasks,
        pendingTasks,
        completedTasks,
        overdueTasks,
      },
      charts: {
        taskDistribution,
        taskPriorityLevel,
      },
      recentTasks,
    });
  } catch (error) {
    next(error);
  }
};
