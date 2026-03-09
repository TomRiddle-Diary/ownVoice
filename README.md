# WriteCraft - Logical Writing Skills Platform

WriteCraft is a SaaS application that helps users improve their logical writing skills using the PREP method (Point, Reason, Example, Point) without relying on AI to write for them.

## Features

- ✍️ **Structured Drafting**: Use drag-and-drop to organize ideas into the PREP framework
- 🤖 **AI Feedback**: Get instant feedback on grammar, logic, and completeness
- 📚 **Comparative Learning**: Compare your drafts with ideal versions side-by-side
- 📝 **Multiple Categories**: Support for Tech Blogs, Proposals, Self-PR, and Essays

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **Drag & Drop**: @hello-pangea/dnd
- **AI Integration**: OpenAI API (GPT-4o)

## Getting Started

### Prerequisites

- Node.js 20.x or higher
- PostgreSQL database
- OpenAI API key

### Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   Copy `.env.example` to `.env` and fill in your credentials:
   ```bash
   # Database
   DATABASE_URL="postgresql://user:password@localhost:5432/writecraft?schema=public"

   # NextAuth
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"

   # OpenAI
   OPENAI_API_KEY="sk-..."
   ```

   To generate a secure NEXTAUTH_SECRET:
   ```bash
   openssl rand -base64 32
   ```

3. **Set up the database**:
   ```bash
   # Generate Prisma Client
   npx prisma generate

   # Run migrations (or push schema for development)
   npx prisma db push

   # Optional: Open Prisma Studio to view data
   npx prisma studio
   ```

4. **Run the development server**:
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
writecraft/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/[...nextauth]/  # NextAuth.js routes
│   │   │   ├── feedback/            # AI feedback endpoint
│   │   │   └── model/               # Ideal text generation
│   │   ├── dashboard/               # User dashboard
│   │   ├── editor/[id]/             # PREP editor with drag-and-drop
│   │   ├── layout.tsx               # Root layout
│   │   └── page.tsx                 # Landing page
│   ├── components/
│   │   └── ui/                      # shadcn/ui components
│   ├── lib/
│   │   ├── auth.ts                  # NextAuth configuration
│   │   ├── openai.ts                # OpenAI client
│   │   └── prisma.ts                # Prisma client
│   └── types/
│       └── next-auth.d.ts           # NextAuth type extensions
├── prisma/
│   └── schema.prisma                # Database schema
└── .env                             # Environment variables
```

## Database Schema

The application uses three main models:

- **User**: User accounts and authentication
- **Post**: Writing projects with PREP structure
- **Bullet**: Individual bullet points for ideas

## Core Features Explained

### 1. Structured Drafting (PREP Method)

Users can:
- Add multiple bullet points representing their ideas
- Drag and drop bullets into the PREP framework:
  - **Point (Opening)**: Main statement
  - **Reason**: Why the point matters
  - **Example**: Evidence or illustration
  - **Point (Closing)**: Reinforced conclusion

### 2. Writing & AI Feedback

The AI feedback system analyzes:
- Grammar and typos
- Logical consistency (Does the Example support the Reason?)
- Completeness based on PREP structure
- Overall clarity and coherence

Feedback is returned within 5 seconds using GPT-4o.

### 3. Comparative Learning

Users can generate an "Ideal Version" based on their PREP structure to:
- See how professional writers structure similar content
- Learn effective transitions and phrasing
- Understand the difference between good and great writing

## API Endpoints

### POST /api/feedback
Analyzes user's draft and provides constructive feedback.

**Request**:
```json
{
  "content": "User's written draft...",
  "structure": {
    "point1": [...],
    "reason": [...],
    "example": [...],
    "point2": [...]
  }
}
```

**Response**:
```json
{
  "feedback": "Detailed feedback on grammar, logic, and completeness..."
}
```

### POST /api/model
Generates an ideal version based on PREP structure.

**Request**:
```json
{
  "structure": { ... },
  "category": "Tech Blog"
}
```

**Response**:
```json
{
  "modelText": "Well-crafted example paragraph..."
}
```

## Development

### Adding New Features

1. Create UI components in `src/components/`
2. Add API routes in `src/app/api/`
3. Update database schema in `prisma/schema.prisma`
4. Run `npx prisma db push` to update the database

### Styling

This project uses Tailwind CSS and shadcn/ui. To add new UI components:

```bash
npx shadcn@latest add [component-name]
```

## Deployment

### Environment Setup

1. Set up a PostgreSQL database (e.g., on Railway, Supabase, or Vercel Postgres)
2. Configure environment variables in your hosting platform
3. Run database migrations: `npx prisma migrate deploy`

### Recommended Platforms

- **Vercel**: Optimized for Next.js apps
- **Railway**: Easy PostgreSQL hosting
- **Supabase**: PostgreSQL with additional features

## Performance Considerations

- AI feedback is optimized to return within 5 seconds
- Drag-and-drop uses @hello-pangea/dnd for smooth interactions
- Skeleton loaders provide instant feedback while waiting for API responses

## License

MIT License - feel free to use this project for learning and development.

## Support

For issues or questions, please open an issue in the GitHub repository.
