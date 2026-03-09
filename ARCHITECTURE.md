# WriteCraft - Architecture Overview

## Application Flow

```
Landing Page (/) 
    ↓
Dashboard (/dashboard)
    ↓
Editor (/editor/[id])
    ↓
API Routes (/api/feedback, /api/model)
```

## Key Components

### 1. Landing Page (`src/app/page.tsx`)
- Hero section with value proposition
- Feature cards explaining PREP method, AI feedback, and comparative learning
- Call-to-action buttons

### 2. Dashboard (`src/app/dashboard/page.tsx`)
- Project list view
- Create new project form
- Category selection (Blog, Proposal, Self-PR, Essay)

### 3. Editor (`src/app/editor/[id]/page.tsx`)
The core of the application with three main sections:

#### Left Panel: Ideas & Structure
- **Bullet Points Pool**: Add and manage idea bullets
- **PREP Structure Builder**: Drag-and-drop interface with four zones:
  - Point (Opening) - Blue
  - Reason (Why) - Green
  - Example (Evidence) - Yellow
  - Point (Closing) - Purple

#### Right Panel: Writing & Feedback
- **Draft Editor**: Textarea for writing content
- **AI Feedback Display**: Shows analysis results
- **Action Buttons**: Get feedback, Compare with ideal

#### Bottom: Comparison View
- Side-by-side comparison of user draft vs ideal version
- Helps users learn by example

## State Management

The editor uses React useState for:
- `bullets`: Array of idea bullets
- `prepStructure`: Organized PREP sections
- `content`: User's written draft
- `feedback`: AI-generated feedback
- `modelText`: Ideal version for comparison
- Loading states for async operations

## Drag & Drop Implementation

Uses `@hello-pangea/dnd` (fork of react-beautiful-dnd):

```typescript
<DragDropContext onDragEnd={onDragEnd}>
  <Droppable droppableId="bullets">
    {/* Bullet pool */}
  </Droppable>
  
  <Droppable droppableId="point1">
    {/* PREP section */}
  </Droppable>
  {/* ... more sections */}
</DragDropContext>
```

**Drag Logic**:
- Bullets can be moved between any sections
- Items can be reordered within sections
- State updates trigger re-renders automatically

## API Routes

### POST /api/feedback
**Purpose**: Analyze user's draft and provide feedback

**Flow**:
1. Receives content + PREP structure
2. Constructs prompt for OpenAI
3. Calls GPT-4o with structured prompt
4. Returns feedback within 5 seconds

**Prompt Strategy**:
- Include PREP structure for context
- Ask for grammar, logic, and completeness analysis
- Request actionable, specific feedback

### POST /api/model
**Purpose**: Generate ideal version based on structure

**Flow**:
1. Receives PREP structure + category
2. Constructs educational prompt
3. Generates model text (150-250 words)
4. Returns for comparison view

**Prompt Strategy**:
- Create example that follows PREP perfectly
- Show professional language and transitions
- Make it educational, not just a template

## Database Schema

### User Model
```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  posts     Post[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### Post Model
```prisma
model Post {
  id          String   @id @default(cuid())
  title       String
  category    String
  content     String?  @db.Text
  structure   Json?    # Stores PREP mapping
  bullets     Bullet[]
  feedback    String?  @db.Text
  userId      String
  user        User     @relation(...)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

### Bullet Model
```prisma
model Bullet {
  id      String @id @default(cuid())
  text    String
  order   Int    @default(0)
  postId  String
  post    Post   @relation(...)
}
```

## Authentication (NextAuth.js)

**Setup**:
- Credentials provider (can be extended)
- JWT strategy for sessions
- Custom callbacks for user ID in session

**Extension Points**:
- Add Google/GitHub OAuth
- Implement email verification
- Add password hashing (bcryptjs ready)

## UI Components (shadcn/ui)

All components are from shadcn/ui for consistency:
- `Button`: Primary actions
- `Card`: Content containers
- `Input/Textarea`: Form fields
- `Badge`: Status indicators
- `Skeleton`: Loading states
- `Dialog`: Modals
- `Select`: Dropdowns

**Styling Approach**:
- Tailwind CSS utility classes
- Consistent color scheme (Gray scale + accent colors)
- Responsive design (mobile-first)

## Performance Optimizations

### Loading States
- Skeleton components during API calls
- Optimistic UI updates where possible
- Disabled buttons during processing

### API Response Time
- Target: < 5 seconds for feedback
- GPT-4o with max_tokens limit
- Streaming could be added for better UX

### Client-Side Optimizations
- Drag operations use CSS transforms
- React memo could be added for bullet items
- Debouncing for autosave (future)

## Future Enhancements

### Short-term
- [ ] Save posts to database
- [ ] Load existing posts
- [ ] User authentication flow
- [ ] Post deletion/archiving

### Medium-term
- [ ] Autosave drafts
- [ ] Version history
- [ ] Export to various formats
- [ ] Collaborative editing

### Long-term
- [ ] AI writing assistant (not writing for you)
- [ ] Progress tracking and analytics
- [ ] Community examples library
- [ ] Mobile app

## File Structure

```
writecraft/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/[...nextauth]/route.ts  # Auth endpoints
│   │   │   ├── feedback/route.ts            # Feedback API
│   │   │   └── model/route.ts               # Model text API
│   │   ├── dashboard/
│   │   │   └── page.tsx                     # Dashboard UI
│   │   ├── editor/[id]/
│   │   │   └── page.tsx                     # Main editor
│   │   ├── globals.css                      # Global styles
│   │   ├── layout.tsx                       # Root layout
│   │   └── page.tsx                         # Landing page
│   ├── components/
│   │   └── ui/                              # shadcn components
│   ├── lib/
│   │   ├── auth.ts                          # NextAuth config
│   │   ├── openai.ts                        # OpenAI client
│   │   └── prisma.ts                        # Database client
│   └── types/
│       └── next-auth.d.ts                   # Type extensions
├── prisma/
│   └── schema.prisma                        # Database schema
├── .env                                     # Environment vars
├── .env.example                             # Env template
├── package.json                             # Dependencies
├── README.md                                # Full documentation
├── SETUP.md                                 # Quick start guide
└── ARCHITECTURE.md                          # This file
```

## Development Workflow

1. **Feature Planning**: Define user story
2. **Database**: Update Prisma schema if needed
3. **API**: Create/update API routes
4. **UI**: Build components with shadcn/ui
5. **Integration**: Connect frontend to backend
6. **Testing**: Manual testing + error handling
7. **Documentation**: Update relevant docs

## Contributing Guidelines

1. Follow TypeScript best practices
2. Use shadcn/ui components consistently
3. Keep API responses under 5 seconds
4. Write clear commit messages
5. Update documentation for new features

## Resources

- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [shadcn/ui](https://ui.shadcn.com)
- [OpenAI API](https://platform.openai.com/docs)
- [NextAuth.js](https://next-auth.js.org)
