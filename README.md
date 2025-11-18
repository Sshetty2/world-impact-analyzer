<a href="https://world-impact-analyzer.vercel.app">
  <h1 align="left">World Impact Analyzer</h1>
</a>

<p align="left">
  An AI-powered platform for analyzing historical figures' global impact and influence, combining comprehensive data analysis with an interactive 3D globe visualization and intelligent chat interface.
</p>

<p align="left">
  <a href="https://world-impact-analyzer.vercel.app"><strong>View Demo</strong></a>
</p>

## Overview

World Impact Analyzer is a Next.js application that leverages AI to provide deep insights into historical figures' contributions and influence across time and geography. The platform integrates the Pantheon 2.0 dataset (125,632+ historical figures) with Wikipedia data and advanced LLM analysis to generate comprehensive impact assessments.

### Key Capabilities

- **Interactive 3D Globe**: Explore historical figures on an interactive globe with geographic filtering and visual clustering
- **AI-Powered Analysis**: Generate detailed impact assessments including scores for world impact, reach, innovation, influence, controversy, and longevity
- **Intelligent Chat Interface**: Discuss analysis results with an AI assistant that understands the context of each historical figure
- **Rich Filtering**: Filter by continent, country, domain, era, occupation, gender, HPI score, and more
- **Document Editing**: Create and edit documents with AI-powered suggestions and version control
- **Wikipedia Integration**: Direct integration with Wikipedia API for comprehensive biographical data

## Features

### Analysis Engine

- **Comprehensive Scoring System**
  - World Impact (0-100): Overall global influence
  - Geographic Reach (0-100): Spatial extent of influence
  - Innovation (0-100): Novel contributions to their field
  - Direct Influence (0-100): Impact on contemporaries and successors
  - Controversy (0-100): Level of debate surrounding their work
  - Longevity (0-100): Lasting impact over time

- **Multi-Dimensional Analysis**
  - Timeline of major life events and contributions
  - Geographic impact visualization with world maps
  - Field-specific contributions analysis
  - Personality traits assessment
  - Sentiment analysis of historical perception

- **Smart Caching**: Analysis results are cached in the database to avoid redundant processing

### Interactive Globe Visualization

- **3D Globe Interface** powered by `react-globe.gl` and Three.js
- **125,632+ Historical Figures** from the Pantheon 2.0 dataset
- **Geographic Markers** showing birthplaces with precise latitude/longitude coordinates
- **Double-Click Analysis**: Click any marker to instantly analyze that figure
- **Real-time Filtering**: Apply multiple filters and see results update on the globe
- **Rotation Controls**: Adjustable globe rotation with speed controls

### Advanced Filtering

Filter historical figures by:
- **Geographic**: Continents, countries, and regions
- **Temporal**: Birth year ranges and eras (Ancient, Medieval, Renaissance, etc.)
- **Professional**: Domains (Arts, Science, Politics, etc.) and specific occupations
- **Demographic**: Gender and alive status
- **Impact**: HPI (Historical Popularity Index) score ranges

### Chat System

- **Context-Aware Conversations**: Chat interface understands the analyzed historical figure
- **Streaming Responses**: Real-time streaming for smooth user experience
- **Multi-Tool Support**: Document creation, weather queries, and more
- **Chat History**: Persistent chat sessions with title generation
- **Message Management**: Edit, delete, and vote on messages

### Document Editing

- **Rich Text Editor**: ProseMirror-based editor for text documents
- **Code Editor**: CodeMirror 6 with syntax highlighting (JavaScript, Python)
- **AI Suggestions**: Get AI-powered suggestions for improving your documents
- **Version Control**: Track document changes over time
- **Diff Tracking**: See what changed between versions

## Tech Stack

### Core Framework
- **[Next.js 15](https://nextjs.org)** - React framework with App Router
- **[React 19](https://react.dev)** - UI library
- **[TypeScript](https://www.typescriptlang.org/)** - Type safety
- **[Tailwind CSS](https://tailwindcss.com)** - Utility-first CSS

### AI & LLM
- **[Vercel AI SDK](https://sdk.vercel.ai/docs)** (v4.0.20) - Streaming and AI integration
- **[LangChain](https://js.langchain.com/)** (@langchain/openai v1.0.0) - Structured LLM outputs
- **[OpenAI GPT-4o](https://openai.com/)** - Primary analysis model

### Database
- **[Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres)** (Neon) - Serverless PostgreSQL
- **[Drizzle ORM](https://orm.drizzle.team/)** - Type-safe database access
- **[Drizzle Kit](https://orm.drizzle.team/kit-docs/overview)** - Schema migrations

### Authentication & Storage
- **[NextAuth.js 5.0 beta](https://next-auth.js.org/)** - Authentication
- **[Vercel Blob](https://vercel.com/docs/storage/vercel-blob)** - File storage

### Visualization
- **[react-globe.gl](https://github.com/vasturiano/react-globe.gl)** - 3D globe visualization
- **[Three.js](https://threejs.org/)** via @react-three/fiber - 3D rendering
- **[Recharts](https://recharts.org/)** - Charts and graphs
- **[D3.js](https://d3js.org/)** - Data visualization utilities

### Editors
- **[ProseMirror](https://prosemirror.net/)** - Rich text editing
- **[CodeMirror 6](https://codemirror.net/)** - Code editing

### UI Components
- **[shadcn/ui](https://ui.shadcn.com/)** - Reusable components
- **[Radix UI](https://www.radix-ui.com/)** - Accessible primitives
- **[Lucide Icons](https://lucide.dev/)** - Icon library

### Data Source
- **[Pantheon 2.0 Dataset](https://pantheon.world/)** - 125,632+ historical figures
- **[Wikipedia API](https://www.mediawiki.org/wiki/API:Main_page)** - Biographical content

## Getting Started

### Prerequisites

- **Node.js** 18.17 or later
- **pnpm** (recommended package manager)
- **OpenAI API Key** - For LLM features
- **Vercel Postgres Database** - For data persistence
- **Vercel Blob Storage** (optional) - For file uploads

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/world-impact-analyzer.git
   cd world-impact-analyzer
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**

   Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

   Required environment variables:
   ```env
   # OpenAI Configuration
   OPENAI_API_KEY=your_openai_api_key
   OPENAI_MODEL=gpt-4o-mini                    # Optional: defaults to gpt-4o-mini
   SUMMARIZATION_MODEL=gpt-4o-mini             # Optional: defaults to gpt-4o-mini

   # Authentication
   AUTH_SECRET=your_auth_secret                # Generate with: openssl rand -base64 32

   # Database
   POSTGRES_URL=your_postgres_connection_string
   DATABASE_URL=your_postgres_connection_string  # Should match POSTGRES_URL

   # Storage (Optional)
   BLOB_READ_WRITE_TOKEN=your_blob_token
   ```

4. **Run database migrations**
   ```bash
   pnpm db:migrate
   ```

5. **Start the development server**
   ```bash
   pnpm dev
   ```

6. **Open your browser**

   Navigate to [http://localhost:3000](http://localhost:3000)

### Database Setup

The project uses Drizzle ORM with Vercel Postgres (Neon backend).

**Initial Setup:**
```bash
# Run migrations
pnpm db:migrate

# Open Drizzle Studio to inspect database
pnpm db:studio

# Generate new migrations after schema changes
pnpm db:generate
```

**Pantheon Dataset Ingestion:**

The Pantheon 2.0 dataset is already included in the repository (`person_2025_update.csv`). To ingest it:

```bash
# Create the pantheonPerson table
pnpm tsx lib/db/create-pantheon-table.ts

# Ingest CSV data
pnpm tsx lib/db/ingest-pantheon.ts
```

## Development

### Available Commands

#### Development
- `pnpm dev` - Start development server with Turbo mode
- `pnpm build` - Run migrations and build for production
- `pnpm start` - Start production server

#### Code Quality
- `pnpm lint` - Run ESLint to check code quality
- `pnpm lint:fix` - Auto-fix ESLint issues
- `pnpm format` - Format code using Biome

#### Database
- `pnpm db:migrate` - Run database migrations
- `pnpm db:generate` - Generate migration files from schema changes
- `pnpm db:studio` - Open Drizzle Studio for database inspection
- `pnpm db:push` - Push schema changes to database
- `pnpm db:pull` - Pull schema from database
- `pnpm db:check` - Check for schema inconsistencies

#### Testing
- `pnpm test:queries` - Run comprehensive Pantheon database query tests
- `pnpm db:check-data` - Inspect database values and distributions

### Project Structure

```
world-impact-analyzer/
├── app/
│   ├── (auth)/              # Authentication routes (/login, /register)
│   │   ├── auth.ts          # NextAuth configuration
│   │   ├── auth.config.ts   # Auth provider config
│   │   └── actions.ts       # Auth server actions
│   ├── (chat)/              # Main chat interface
│   │   ├── page.tsx         # Home page with chat
│   │   ├── chat/[id]/       # Individual chat pages
│   │   ├── layout.tsx       # Chat layout with sidebar
│   │   └── actions.ts       # Chat server actions
│   ├── api/
│   │   ├── analyze/         # Analysis API endpoint
│   │   ├── chat/            # Chat streaming endpoint
│   │   ├── pantheon/        # Pantheon data API
│   │   │   ├── people/      # Filtered people endpoint
│   │   │   └── filter-options/  # Filter values endpoint
│   │   ├── document/        # Document operations
│   │   ├── files/upload/    # File upload endpoint
│   │   ├── history/         # Chat history
│   │   ├── suggestions/     # AI suggestions
│   │   └── vote/            # Message voting
├── components/
│   ├── analysis/            # Analysis visualization components
│   │   ├── analysis-panel.tsx
│   │   ├── score-card.tsx
│   │   ├── world-map.tsx
│   │   ├── timeline.tsx
│   │   └── ...
│   ├── ui/                  # shadcn/ui components
│   ├── impact-globe.tsx     # 3D globe visualization
│   ├── pantheon-filters.tsx # Filtering UI
│   └── ...
├── lib/
│   ├── ai/                  # AI integration
│   │   ├── analyze.ts       # Main analysis logic
│   │   ├── summarize.ts     # Wikipedia summarization
│   │   ├── models.ts        # Model configuration
│   │   ├── prompts.ts       # System prompts
│   │   └── types.ts         # TypeScript types
│   ├── db/                  # Database layer
│   │   ├── schema.ts        # Drizzle schema
│   │   ├── queries.ts       # Database queries
│   │   ├── migrate.ts       # Migration runner
│   │   ├── migrations/      # Migration files
│   │   ├── ingest-pantheon.ts
│   │   └── test-pantheon-queries.ts
│   └── ...
├── patches/
│   └── wikipedia@2.4.2.patch  # Wikipedia npm package patch
├── person_2025_update.csv   # Pantheon 2.0 dataset
├── drizzle.config.ts        # Drizzle configuration
├── middleware.ts            # Auth middleware
├── next.config.ts           # Next.js configuration
└── package.json
```

## Architecture

### Route Groups

The application uses Next.js 15 App Router with route groups for logical separation:

1. **(auth)** - Authentication routes (`/login`, `/register`)
2. **(chat)** - Main chat interface and related features
3. **api** - API endpoints for analysis, chat, and data queries

### Database Schema

Key tables:
- **User** - User accounts with email/password
- **Chat** - Chat sessions with title and `analyzedPersonName` foreign key
- **Message** - Chat messages with role and JSON content
- **Vote** - Message upvotes/downvotes
- **Document** - Editable documents with version tracking
- **Suggestion** - AI-generated text suggestions
- **historicalFigureAnalysis** - Cached analysis results (keyed by person name)
- **pantheonPerson** - 125,632+ historical figures with biographical data, coordinates, and Wikipedia slugs

### Analysis Pipeline

When analyzing a historical figure:

1. **Authenticate** - Verify user session via NextAuth
2. **Validate Request** - Check request body using Zod schema
3. **Check Cache** - Look for existing analysis in database
4. **Fetch Wikipedia** - Get biographical content via `wikipedia` npm package
   - Uses Wikipedia slug from Pantheon database (if available)
   - Falls back to name search
5. **Validate Content** - Check for biographical markers using fuzzy matching
6. **Summarize** - Extract structured data using LangChain with structured output
7. **Analyze** - Generate comprehensive impact scores using LangChain
8. **Cache Results** - Store in `historicalFigureAnalysis` table
9. **Stream Response** - Send progress updates to client

### Wikipedia Integration

The app uses the `wikipedia` npm package with a custom patch:

- **Patch Location**: `patches/wikipedia@2.4.2.patch`
- **Purpose**: Adds `User-Agent` header to Wikipedia API requests (required by Wikipedia)
- **Installation**: Automatically applied by pnpm during `pnpm install`

**How it works:**
- Direct Wikipedia API integration (no external services)
- Handles disambiguation pages and missing articles
- Fuzzy matching (threshold: 0.72) for biographical validation
- Better error handling and debugging

### AI Integration

The application uses two LLM approaches:

1. **Vercel AI SDK** (`ai` package) - For streaming chat responses
   - Used in: `/api/chat` endpoint
   - Supports `streamText()` and `streamObject()` for real-time responses

2. **LangChain** (`@langchain/openai`) - For structured outputs
   - Used in: `/api/analyze` endpoint
   - Uses `.withStructuredOutput()` for type-safe analysis
   - Ensures consistent response formats

### State Management

- **Server Components**: Default for data fetching
- **Server Actions**: All mutations (marked with `'use server'`)
- **Client Components**: Interactive UI elements only
- **React Context**: Minimal client-side state (theme, sidebar)

## API Endpoints

### Analysis

**POST /api/analyze**
- Analyzes a historical figure and returns comprehensive impact assessment
- Requires authentication
- Accepts: `{ personName: string, chatId: string, slug?: string }`
- Returns: Streaming response with analysis progress
- Max duration: 60 seconds

### Pantheon Data

**GET /api/pantheon/people**
- Returns filtered list of historical figures
- Query parameters: continents, domains, eras, countries, occupations, genders, hpiMin, hpiMax, alive
- Returns: Array of people with coordinates
- Default limit: 10,000 records

**GET /api/pantheon/filter-options**
- Returns available filter values with counts
- Returns: Distinct values for all filter categories

### Chat

**POST /api/chat**
- Streaming chat endpoint with AI assistant
- Supports tools: document creation, updates, suggestions
- Context-aware when chat has associated analysis

## Testing

The project includes a comprehensive test suite for database queries:

```bash
# Run all tests
pnpm test:queries
```

**Test Coverage:**
- 19 tests covering 125,632+ historical figures
- All filter combinations validated
- Data integrity checks
- Edge case handling

**Test Documentation:** See `lib/db/README-TESTS.md`

## Deployment

### Vercel (Recommended)

1. **Push to GitHub**
   ```bash
   git push origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your repository
   - Configure environment variables
   - Deploy

3. **Set up Vercel Postgres**
   - Create a Postgres database in Vercel dashboard
   - Copy connection string to `POSTGRES_URL`
   - Run migrations via Vercel CLI or deployment hook

4. **Ingest Pantheon Data**
   - After deployment, run ingestion script manually via Vercel CLI
   - Or use a one-time deployment script

### Environment Variables

Ensure all required environment variables are set in Vercel dashboard:
- `OPENAI_API_KEY`
- `AUTH_SECRET`
- `POSTGRES_URL`
- `DATABASE_URL`
- `BLOB_READ_WRITE_TOKEN` (optional)

### Build Configuration

The build automatically runs database migrations:
```json
"build": "tsx lib/db/migrate && next build"
```

## Contributing

Contributions are welcome! Please follow these guidelines:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Make your changes**
4. **Run linting** (`pnpm lint:fix`)
5. **Run tests** (`pnpm test:queries`)
6. **Commit your changes** (`git commit -m 'Add amazing feature'`)
7. **Push to the branch** (`git push origin feature/amazing-feature`)
8. **Open a Pull Request**

### Code Style

- Use TypeScript for all new code
- Follow existing code patterns
- Use Server Actions for mutations
- Keep components small and focused
- Add comments for complex logic

## Troubleshooting

### Wikipedia API Errors

If you get errors from Wikipedia API:
```bash
# Ensure the patch is applied
pnpm install
# The patch should be automatically applied
```

### Database Connection Issues

```bash
# Check environment variables
echo $POSTGRES_URL

# Test connection
pnpm db:studio
```

### Migration Errors

```bash
# Reset and rerun migrations
pnpm db:push
pnpm db:migrate
```

### Build Errors

```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

## License

This project is open source and available under the [MIT License](LICENSE).

## Acknowledgments

- **Pantheon 2.0 Dataset** - Historical figures data from [pantheon.world](https://pantheon.world/)
- **Wikipedia** - Biographical content via Wikipedia API
- **Vercel** - Hosting and infrastructure
- **OpenAI** - LLM capabilities for analysis
- **Next.js Team** - Amazing framework
- **shadcn** - Beautiful UI components

## Support

For questions or issues:
- Open an issue on [GitHub](https://github.com/yourusername/world-impact-analyzer/issues)
- Check existing documentation in CLAUDE.md
- Review API documentation in code comments

---

<p align="center">
  Built with ❤️ using Next.js and AI
</p>
