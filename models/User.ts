import mongoose, { Schema, models, model } from "mongoose";

export type UserRole = "user" | "owner";

export interface IUser {
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["user", "owner"], default: "user", required: true },
  },
  { timestamps: true }
);

export const User = models.User || model<IUser>("User", UserSchema);


