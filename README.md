# BookIt - Experience Booking Platform

A complete fullstack web application for browsing and booking travel experiences with real-time slot management and promo code validation.

## Features

- Browse curated travel experiences with images and descriptions
- View available dates and time slots with real-time availability
- Complete booking flow with user information collection
- Promo code validation (SAVE10 for 10% off, FLAT100 for ₹100 off)
- Booking confirmation with reference ID
- Responsive design for mobile and desktop
- Real-time slot management to prevent double-booking

## Tech Stack

**Frontend:**
- Next.js 16 with TypeScript
- React 19
- TailwindCSS v4
- SWR for data fetching

**Backend:**
- Next.js API Routes
- In-memory database (easily replaceable with PostgreSQL/MongoDB)

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
\`\`\`bash
git clone <repository-url>
cd bookit
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Run the development server:
\`\`\`bash
npm run dev
\`\`\`

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

\`\`\`
bookit/
├── app/
│   ├── api/
│   │   ├── experiences/          # Experience endpoints
│   │   ├── bookings/             # Booking endpoints
│   │   └── promo/                # Promo validation
│   ├── experience/[id]/          # Experience details page
│   ├── checkout/                 # Checkout page
│   ├── result/                   # Booking confirmation page
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Home page
│   └── globals.css               # Global styles
├── components/
│   ├── header.tsx                # Header component
│   ├── experience-card.tsx        # Experience card
│   └── experience-grid.tsx        # Grid layout
├── lib/
│   └── db.ts                     # Database layer
├── data/
│   └── experiences.ts            # Mock data
└── public/                       # Static assets
\`\`\`

## API Endpoints

### Experiences
- `GET /api/experiences` - Get all experiences
- `GET /api/experiences/:id` - Get experience details

### Bookings
- `POST /api/bookings` - Create a new booking
  - Body: `{ experienceId, date, time, quantity, fullName, email, subtotal, taxes, discount }`
  - Returns: Booking object with unique reference ID

### Promo Codes
- `POST /api/promo/validate` - Validate promo code
  - Body: `{ code, subtotal }`
  - Returns: Discount amount and type

## Available Promo Codes

- `SAVE10` - 10% discount on total
- `FLAT100` - ₹100 flat discount

## Booking Flow

1. **Home Page** - Browse all available experiences
2. **Details Page** - Select date, time, and quantity
3. **Checkout Page** - Enter user info and apply promo codes
4. **Confirmation Page** - View booking confirmation with reference ID

## Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "New Project" and import your repository
4. Click "Deploy"

The application will be live at your Vercel URL.

### Deploy to Other Platforms

**Railway:**
\`\`\`bash
railway link
railway up
\`\`\`

**Render:**
1. Connect your GitHub repository
2. Create a new Web Service
3. Set build command: `npm run build`
4. Set start command: `npm start`

## Development

### Running Tests
\`\`\`bash
npm run test
\`\`\`

### Building for Production
\`\`\`bash
npm run build
npm start
\`\`\`

## Future Enhancements

- PostgreSQL/MongoDB integration for persistent storage
- User authentication and account management
- Payment gateway integration (Stripe)
- Email notifications for bookings
- Admin dashboard for experience management
- Review and rating system
- Wishlist functionality

## License

MIT

## Support

For issues or questions, please open an issue on GitHub or contact support.
