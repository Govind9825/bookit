import mongoose, { Schema, model, models } from "mongoose";

export interface IBooking {
  userId: mongoose.Types.ObjectId;
  userName: string;
  userEmail: string;
  experienceId: mongoose.Types.ObjectId | string;
  experienceTitle: string;
  date: string;
  time: string;
  quantity: number;
  subtotal: number;
  taxes: number;
  discount: number;
  total: number;
  ref: string;
  status: "confirmed" | "cancelled";
  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema = new Schema<IBooking>(
  {
    userId: { type: Schema.Types.ObjectId, required: true, index: true },
    userName: { type: String, required: true },
    userEmail: { type: String, required: true, index: true },
    experienceId: { type: Schema.Types.ObjectId, required: true },
    experienceTitle: { type: String, required: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    quantity: { type: Number, required: true },
    subtotal: { type: Number, required: true },
    taxes: { type: Number, required: true },
    discount: { type: Number, required: true },
    total: { type: Number, required: true },
    ref: { type: String, required: true, unique: true },
    status: { type: String, enum: ["confirmed", "cancelled"], default: "confirmed", index: true },
  },
  { timestamps: true }
);

// In dev with hot reload, an older compiled model might have a different schema.
// To avoid "Cast to Number" issues from an outdated model, drop it before redefining.
if (models.Booking) {
  delete (models as any).Booking;
}
export const Booking = model<IBooking>("Booking", BookingSchema);


