# BudgetGamify 🎮💰

A modern zero-based budgeting web application with gamification elements to make financial management engaging and effective.

## Features

### 🎯 Core Budgeting
- **Zero-Based Budgeting**: Allocate every dollar to specific categories
- **Transaction Management**: Add, edit, and categorize expenses
- **Budget Categories**: Pre-built and custom categories with visual icons
- **Real-time Analytics**: Track spending with beautiful charts and insights

### 🎮 Gamification
- **Achievement System**: Unlock badges for financial milestones
- **Level Progression**: Gain XP and level up through good budgeting habits
- **Streak Tracking**: Maintain daily activity streaks
- **Visual Progress**: See your financial journey as a game

### 👥 Collaboration
- **Shareable Budgets**: Collaborate with family or friends
- **Permission Levels**: View-only or edit access for collaborators
- **Real-time Updates**: See changes instantly across all devices

### 🔐 Security & Authentication
- **Multiple Auth Options**: Email/password, Google, GitHub
- **Secure Sessions**: JWT-based authentication with NextAuth.js
- **Data Protection**: All sensitive data encrypted

## Tech Stack

- **Frontend**: Next.js 14+ (App Router), React, TypeScript
- **Styling**: Tailwind CSS, Shadcn UI components
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js v5
- **Deployment**: Vercel-ready

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd budget-gamify
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Update the `.env` file with your configuration:
   ```env
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/budget_gamify"
   
   # NextAuth
   NEXTAUTH_SECRET="your-nextauth-secret-here"
   NEXTAUTH_URL="http://localhost:3000"
   
   # OAuth Providers (optional)
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"
   GITHUB_CLIENT_ID="your-github-client-id"
   GITHUB_CLIENT_SECRET="your-github-client-secret"
   ```

4. **Set up the database**
   ```bash
   # Generate Prisma client
   npm run db:generate
   
   # Push database schema
   npm run db:push
   
   # Seed with default data
   npm run db:seed
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Commands

- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema changes to database
- `npm run db:seed` - Seed database with default achievements
- `npm run db:studio` - Open Prisma Studio for database management
- `npm run db:reset` - Reset database (⚠️ destructive)

## Project Structure

```
budget-gamify/
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── seed.ts               # Database seeding
├── src/
│   ├── app/                  # Next.js App Router pages
│   │   ├── api/             # API routes
│   │   ├── auth/            # Authentication pages
│   │   ├── dashboard/       # Dashboard page
│   │   └── layout.tsx       # Root layout
│   ├── components/          # React components
│   │   └── ui/             # Shadcn UI components
│   └── lib/                # Utility functions
│       ├── auth.ts         # NextAuth configuration
│       ├── prisma.ts       # Prisma client
│       └── utils.ts        # Helper functions
├── .env.example            # Environment variables template
└── README.md              # This file
```

## Features Roadmap

### Phase 1: Foundation ✅
- [x] Project setup with Next.js, Tailwind, Shadcn UI
- [x] Authentication system with NextAuth.js
- [x] Database schema with Prisma
- [x] Basic dashboard with mock data
- [x] Landing page design

### Phase 2: Core Features 🚧
- [ ] Budget creation and management
- [ ] Transaction CRUD operations
- [ ] Category management
- [ ] Real database integration
- [ ] User profile management

### Phase 3: Advanced Features 📋
- [ ] Gamification system implementation
- [ ] Achievement unlocking logic
- [ ] Sharing and collaboration
- [ ] File upload for receipts
- [ ] Advanced analytics and charts

### Phase 4: Polish & Launch 📋
- [ ] Performance optimization
- [ ] Testing implementation
- [ ] Documentation
- [ ] Deployment setup

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Environment Setup

### OAuth Setup (Optional)

**Google OAuth:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`

**GitHub OAuth:**
1. Go to GitHub Settings > Developer settings > OAuth Apps
2. Create a new OAuth App
3. Set Authorization callback URL: `http://localhost:3000/api/auth/callback/github`

### Database Setup

**Local PostgreSQL:**
```bash
# Install PostgreSQL (macOS with Homebrew)
brew install postgresql
brew services start postgresql

# Create database
createdb budget_gamify
```

**Using Docker:**
```bash
docker run --name budget-postgres -e POSTGRES_PASSWORD=password -e POSTGRES_DB=budget_gamify -p 5432:5432 -d postgres:15
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

If you have any questions or need help setting up the project, please open an issue or contact the development team.

---

**Made with ❤️ by the BudgetGamify team**
