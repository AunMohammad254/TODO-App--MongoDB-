const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [200, "Description cannot exceed 200 characters"],
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    status: {
      type: String,
      enum: {
        values: ["Pending", "In Progress", "Completed"],
        message: "Status must be Pending, In Progress, or Completed",
      },
      default: "Pending",
    },
    dueDate: {
      type: Date,
      validate: {
        validator: function (v) {
          return !v || v >= new Date();
        },
        message: "Due date cannot be in the past",
      },
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    collection: 'tasks' // Explicit collection name for MongoDB Compass
  }
);

// Pre-save middleware to update completedAt when task is completed
taskSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'Completed') {
    this.completedAt = new Date();
    this.completed = true;
  } else if (this.isModified('status') && this.status !== 'Completed') {
    this.completedAt = undefined;
    this.completed = false;
  }
  next();
});

// Comprehensive indexes for better query performance and MongoDB Compass visibility
taskSchema.index({ userId: 1, createdAt: -1 }, { name: 'user_tasks_by_date' });
taskSchema.index({ userId: 1, status: 1 }, { name: 'user_tasks_by_status' });
taskSchema.index({ userId: 1, priority: 1 }, { name: 'user_tasks_by_priority' });
taskSchema.index({ userId: 1, dueDate: 1 }, { name: 'user_tasks_by_due_date' });
taskSchema.index({ userId: 1, completed: 1, createdAt: -1 }, { name: 'user_tasks_completion_status' });
taskSchema.index({ status: 1, priority: 1, dueDate: 1 }, { name: 'task_management_index' });
taskSchema.index({ dueDate: 1 }, { 
  name: 'due_date_index',
  partialFilterExpression: { dueDate: { $exists: true } }
});
taskSchema.index({ 
  title: 'text', 
  description: 'text' 
}, { 
  name: 'task_text_search',
  weights: { title: 10, description: 5 }
});
taskSchema.index({ completedAt: -1 }, { 
  name: 'completed_tasks_by_date',
  partialFilterExpression: { completedAt: { $exists: true } }
});

module.exports = mongoose.model("Task", taskSchema);
