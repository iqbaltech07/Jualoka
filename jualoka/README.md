# Jualoka 🛒

Jualoka (Jualan Lokal) is a modern, lightweight, and fast e-commerce platform specifically designed for Micro, Small, and Medium Enterprises (UMKM) in Indonesia to easily create their own online stores and accept orders directly via WhatsApp.

Built focusing on performance, mobile-responsiveness, and an intuitive user experience for both sellers and buyers.

## 🚀 Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router & Turbopack)
- **Language**: TypeScript
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Database**: PostgreSQL (via [Prisma ORM](https://www.prisma.io/))
- **Authentication**: [Better-Auth](https://v1.better-auth.com/) (Passwordless Email OTP & Session Cookies)
- **UI Components**: custom-built utilizing [Radix UI](https://www.radix-ui.com/), [Lucide Icons](https://lucide.dev/), and [Framer Motion](https://www.framer.com/motion/)
- **Data Visualization**: [Recharts](https://recharts.org/)
- **Media Storage**: Vercel Blob

## ✨ Core Features

### For Sellers (Admin Dashboard)
- **One-Click Store Generation**: Create a store and get a unique subpath (`jualoka.my.id/toko/[slug]`).
- **Product Management**: Easily add, edit (including stock & modal costs), and delete products.
- **Real-Time Order Notifications**: Integrated Server-Sent Events (SSE) alert admins instantly when a new order arrives.
- **Smart Analytics & AI Insights**: Track store performance via revenue charts, calculate store health (AOV, Volume, Profitability), and get automated suggestions for products (e.g., "Laris", "Kurang Laku", "Rugi") to help improve sales logic.
- **Customizable Storefront Banner**: Powerful banner editor allowing gradients, custom images, themes, and transparency.
- **Automated Email Notifications**: Receive email briefs when an order is placed.

### For Buyers (Public Storefront)
- **No Login Required**: Customers can browse menus and add items to their cart frictionlessly.
- **WhatsApp Checkout**: The checkout process seamlessly transfers the cart data and customer details into a predefined, formatted WhatsApp message sent directly to the seller's number.
- **Dynamic Stock Validation**: Ensures customers cannot checkout items that are out of stock.

## 🛠️ Getting Started

### Prerequisites
- Node.js (v20+)
- PostgreSQL Database
- Vercel Blob Token (for image uploads)
- SMTP credentials (for email OTP and order notifications)

### Local Setup

1. **Clone the repository and install dependencies:**
   ```bash
   git clone <repo-url>
   cd jualoka
   npm install
   ```

2. **Environment Variables:**
   Duplicate `.env.example` to `.env` and configure your keys:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/jualoka"
   JWT_SECRET="your-super-secret-key"
   
   SMTP_HOST="smtp.gmail.com"
   SMTP_PORT="587"
   SMTP_USER="your-email@gmail.com"
   SMTP_PASS="your-app-password"
   
   BETTER_AUTH_SECRET="your-auth-secret"
   NEXT_PUBLIC_APP_URL="http://localhost:3000"
   
   BLOB_READ_WRITE_TOKEN="vercel_blob_rw_..."
   GEMINI_API_KEY="AIzaSy..."
   ```

3. **Setup the Database:**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

4. **Run the Development Server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to view the app.

---

**Developed with ❤️ to empower local businesses.**
