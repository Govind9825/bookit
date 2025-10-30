import { Schema, model, models } from "mongoose";

export interface ITimeSlot {
  date: string;
  time: string;
  available: number;
}

export interface IExperience {
  title: string;
  description: string;
  image: string;
  price: number;
  location: string;
  about: string;
  dates: string[];
  slots: ITimeSlot[];
  createdAt: Date;
  updatedAt: Date;
}

const TimeSlotSchema = new Schema<ITimeSlot>({
  date: { type: String, required: true },
  time: { type: String, required: true },
  available: { type: Number, required: true },
});

const ExperienceSchema = new Schema<IExperience>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String, required: true },
    price: { type: Number, required: true },
    location: { type: String, required: true },
    about: { type: String, required: true },
    dates: { type: [String], required: true },
    slots: { type: [TimeSlotSchema], required: true },
  },
  { timestamps: true }
);

export const Experience = models.Experience || model<IExperience>("Experience", ExperienceSchema);


