export interface Experience {
  id: number
  title: string
  description: string
  image: string
  price: number
  location: string
  slots: TimeSlot[]
  dates: string[]
  about: string
}

export interface TimeSlot {
  time: string
  available: number
}

export const experiences: Experience[] = [
  {
    id: 1,
    title: "Kayaking",
    description: "Curated small-group experience. Certified guide. Safety first with gear included.",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
    price: 999,
    location: "Udupi",
    about: "Scenic routes, trained guides, and safety briefing. Minimum age 10.",
    dates: ["Oct 22", "Oct 23", "Oct 24", "Oct 25", "Oct 26"],
    slots: [
      { time: "07:00 am", available: 4 },
      { time: "09:00 am", available: 2 },
      { time: "11:00 am", available: 5 },
      { time: "1:00 pm", available: 0 },
    ],
  },
  {
    id: 2,
    title: "Nandi Hills Sunrise",
    description: "Curated small-group experience. Certified guide. Safety first with gear included.",
    image: "https://images.unsplash.com/photo-1495567720989-cebdbdd97913?w=800&q=80",
    price: 899,
    location: "Bangalore",
    about: "Watch the sunrise from the hills with expert guides.",
    dates: ["Oct 22", "Oct 23", "Oct 24", "Oct 25", "Oct 26"],
    slots: [
      { time: "05:00 am", available: 3 },
      { time: "06:00 am", available: 5 },
      { time: "07:00 am", available: 2 },
    ],
  },
  {
    id: 3,
    title: "Coffee Trail",
    description: "Curated small-group experience. Certified guide. Safety first with gear included.",
    image: "https://images.unsplash.com/photo-1472396961693-142e6e269027?w=800&q=80",
    price: 1299,
    location: "Coorg",
    about: "Explore coffee plantations and learn about coffee production.",
    dates: ["Oct 22", "Oct 23", "Oct 24", "Oct 25", "Oct 26"],
    slots: [
      { time: "08:00 am", available: 4 },
      { time: "10:00 am", available: 3 },
      { time: "2:00 pm", available: 5 },
    ],
  },
  {
    id: 4,
    title: "Bunjee Jumping",
    description: "Curated small-group experience. Certified guide. Safety first with gear included.",
    image: "https://images.unsplash.com/photo-1602088113235-229c19758e9f?w=800&q=80",
    price: 999,
    location: "Manali",
    about: "Experience the thrill of bungee jumping with safety equipment.",
    dates: ["Oct 22", "Oct 23", "Oct 24", "Oct 25", "Oct 26"],
    slots: [
      { time: "09:00 am", available: 2 },
      { time: "11:00 am", available: 4 },
      { time: "3:00 pm", available: 3 },
    ],
  },
  {
    id: 5,
    title: "Boat Cruise",
    description: "Curated small-group experience. Certified guide. Safety first with gear included.",
    image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80",
    price: 999,
    location: "Sunderban",
    about: "Scenic boat cruise through beautiful waterways.",
    dates: ["Oct 22", "Oct 23", "Oct 24", "Oct 25", "Oct 26"],
    slots: [
      { time: "07:00 am", available: 5 },
      { time: "10:00 am", available: 3 },
      { time: "4:00 pm", available: 2 },
    ],
  },
  {
    id: 6,
    title: "Kayaking",
    description: "Curated small-group experience. Certified guide. Safety first with gear included.",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
    price: 999,
    location: "Udupi, Karnataka",
    about: "Scenic routes, trained guides, and safety briefing.",
    dates: ["Oct 22", "Oct 23", "Oct 24", "Oct 25", "Oct 26"],
    slots: [
      { time: "07:00 am", available: 4 },
      { time: "09:00 am", available: 2 },
      { time: "11:00 am", available: 5 },
    ],
  },
]

export const promoCodes: Record<string, number> = {
  SAVE10: 0.1,
  FLAT100: 100,
}
