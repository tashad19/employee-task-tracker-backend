import mongoose, { Document, Schema } from "mongoose";

export interface IEmployee extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  role: string;
  email: string;
}

const employeeSchema = new Schema<IEmployee>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
    },
    role: {
      type: String,
      required: [true, "Role is required"],
      trim: true,
      minlength: [2, "Role must be at least 2 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },
  },
  {
    timestamps: true,
  }
);

employeeSchema.set("toJSON", {
  transform: (_doc, ret) => {
    ret._id = ret._id.toString();
    delete ret.__v;
    return ret;
  },
});

export const Employee = mongoose.model<IEmployee>("Employee", employeeSchema);
