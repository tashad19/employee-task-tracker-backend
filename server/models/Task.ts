import mongoose, { Document, Schema } from "mongoose";

export interface ITask extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  status: "Pending" | "In Progress" | "Completed";
  employeeId: mongoose.Types.ObjectId;
  dueDate?: Date;
}

const taskSchema = new Schema<ITask>(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      minlength: [3, "Title must be at least 3 characters"],
    },
    description: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["Pending", "In Progress", "Completed"],
      default: "Pending",
    },
    employeeId: {
      type: Schema.Types.ObjectId,
      ref: "Employee",
      required: [true, "Employee assignment is required"],
    },
    dueDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

taskSchema.set("toJSON", {
  transform: (_doc, ret) => {
    ret._id = ret._id.toString();
    if (ret.employeeId) {
      ret.employeeId = ret.employeeId.toString();
    }
    if (ret.dueDate) {
      ret.dueDate = ret.dueDate.toISOString().split("T")[0];
    }
    delete ret.__v;
    return ret;
  },
});

export const Task = mongoose.model<ITask>("Task", taskSchema);
