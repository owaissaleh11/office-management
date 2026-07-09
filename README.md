# Office Management System 🏢

A comprehensive, production-ready web application for managing office services, tracking employee activities, and handling customer requests. Built with the modern React ecosystem.

## 🚀 Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Language**: TypeScript
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
- **Database**: PostgreSQL on Supabase (via [Prisma ORM](https://www.prisma.io/))
- **Authentication**: [NextAuth.js v5](https://authjs.dev/) (Credentials Provider)
- **Validation**: [Zod](https://zod.dev/) & React Hook Form
- **Icons**: Lucide React

## 🌟 Key Features

1. **Dashboard & Analytics**: Real-time overview of total services, categories, users, and recent activities.
2. **Services Management**: Full CRUD operations for office services with rich details, requirements, and processing times.
3. **Categories Management**: Organize services into logical categories.
4. **Employee Management (Admin Only)**: Secure portal to add, edit, activate/deactivate, and manage employee accounts and roles.
5. **Activity Logs (Admin Only)**: Comprehensive, tamper-proof tracking of every action taken within the system, including IP addresses.
6. **System Settings (Admin Only)**: Global configuration for office details, contact info, and dynamic logo uploading.

## 🔒 Security & Architecture

- **Role-Based Access Control (RBAC)**: Strict differentiation between `ADMIN` and `EMPLOYEE` roles. Sensitive pages and Server Actions are cryptographically protected.
- **Data Protection**: Passwords are hashed using `bcryptjs`.
- **Database Optimization**: Strategic indexes applied to Prisma models for high-performance querying.
- **HTTP Security**: Next.js configured with strict `X-Frame-Options`, `X-Content-Type-Options`, and `Referrer-Policy` headers.

## 💻 Local Setup & Development

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/office-management.git
cd office-management
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Variables
Create a `.env` file in the root directory:
```env
# Database
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres?sslmode=require"

# Next Auth (Generate a secret using: npx auth secret)
AUTH_SECRET="your-super-secret-key"
```

### 4. Database Setup
Push the schema to your SQLite database and generate the Prisma Client:
```bash
npx prisma db push
npx prisma generate
```

### 5. Start Development Server
```bash
npm run dev
```
Navigate to `http://localhost:3000`.

## 📦 Production Deployment

To build the application for production:
```bash
npm run build
npm start
```
*Note: For a true production environment, consider migrating the database from SQLite to PostgreSQL or MySQL by updating the `provider` in `prisma/schema.prisma`.*

## 🎨 UI/UX Highlights
- Fully responsive design (Mobile-first approach).
- Smooth entry animations and transitions.
- Graceful loading states with custom Skeletons.
- Beautiful empty states for tables and searches.
- Protected delete operations using Confirmation Dialogs.
