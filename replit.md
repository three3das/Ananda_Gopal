# Kidread - Russian Reading Game App

## Overview

This is a child-friendly Russian reading game built with React, TypeScript, Express.js, and Drizzle ORM. The app teaches children to read Russian words by matching them with corresponding pictures. It features an interactive game interface with audio pronunciation, visual feedback, and progress tracking. The game now includes 40 common Russian words with emoji-based picture representations.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Full-Stack Architecture
- **Frontend**: React 18 with TypeScript, using Vite as the build tool
- **Backend**: Express.js server with TypeScript
- **Database**: PostgreSQL with Drizzle ORM (configured for Neon Database)
- **UI Framework**: shadcn/ui components with Radix UI primitives
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **State Management**: TanStack React Query for server state
- **Routing**: Wouter for client-side routing
- **Animations**: Framer Motion for smooth UI transitions

### Monorepo Structure
The project uses a monorepo structure with shared types and schemas:
- `client/` - React frontend application
- `server/` - Express.js backend API
- `shared/` - Shared TypeScript types and database schemas
- `migrations/` - Database migration files

## Key Components

### Frontend Components
- **Game**: Main game interface with word display and picture selection
- **GameHeader**: Progress tracking and navigation
- **GameMenu**: Icon-based navigation between 5 game modes (🖼️ ➕ 🗑️ ✏️ 🎲)
- **WordDisplay**: Interactive letter buttons with audio pronunciation
- **PictureGrid**: Grid of picture options for word matching
- **MissingLetterGame**: Fill-in-the-blank letter challenges with drag & drop
- **ExtraLetterGame**: Remove unwanted letters with trash can interaction
- **SpellWordGame**: Letter sequence spelling from picture cues
- **MixGame**: Random game type selector that varies each word
- **CelebrationOverlay**: Success animations and feedback
- **Audio Hook**: Russian audio files with Web Speech API fallback

### Backend Architecture
- **Express Server**: RESTful API with middleware for logging and error handling
- **Storage Layer**: PostgreSQL database with Drizzle ORM for persistent storage
- **Route Handlers**: CRUD operations for words, game progress, and answer tracking
- **Development Server**: Integrated Vite development server with HMR

### Database Schema
- **Words Table**: Stores 40 Russian words including simple nouns like animals, household items, nature elements, and transportation
- **User Answers Table**: Tracks all user answers with timestamps for monthly filtering
- **Game Progress Table**: Tracks user progress through game sessions
- **Shared Types**: TypeScript interfaces generated from Drizzle schemas

## Data Flow

1. **Game Initialization**: Frontend fetches word list from `/api/words`
2. **Word Selection**: Random word chosen from available words
3. **Distractor Generation**: Backend provides incorrect options via `/api/words/:id/distractors`
4. **User Interaction**: Picture selection triggers validation and feedback
5. **Progress Tracking**: Game state managed locally with optional backend sync
6. **Audio Feedback**: Web Speech API provides Russian pronunciation

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: Neon PostgreSQL database connection
- **drizzle-orm**: Type-safe database ORM with PostgreSQL dialect
- **@tanstack/react-query**: Server state management and caching
- **framer-motion**: Animation library for smooth UI transitions
- **@radix-ui/***: Accessible UI component primitives

### Development Tools
- **Vite**: Fast build tool with TypeScript support
- **ESBuild**: Production build bundling for server code
- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: Pre-built component library

### Audio System
- **Unified Audio Function**: Single `playLetterSound` function in `useAudio` hook used across all games
- **Russian Audio Files**: Located in `/client/public/audio/letters/рос/` with uppercase filenames (А.mp3, Б.mp3, etc.)
- **Web Speech API Fallback**: Browser-native Russian text-to-speech when audio files unavailable
- **Consistent Implementation**: All games use the same audio logic for letter pronunciation

## Deployment Strategy

### Build Process
- **Frontend**: Vite builds React app to `dist/public/`
- **Backend**: ESBuild bundles Express server to `dist/index.js`
- **Database**: Drizzle migrations run via `npm run db:push`

### Environment Configuration
- **DATABASE_URL**: PostgreSQL connection string (required)
- **NODE_ENV**: Environment mode (development/production)
- **REPL_ID**: Replit-specific development features

### Development Workflow
- **Hot Module Replacement**: Vite provides instant frontend updates
- **Server Restart**: tsx enables TypeScript execution with auto-restart
- **Database Sync**: Drizzle push for schema synchronization

### Production Considerations
- Server-side rendering disabled (CSR only)
- Static asset serving from Express in production
- Error handling with proper HTTP status codes
- Request logging and performance monitoring

## Game Features

### Game Modes
- **Picture Matching Mode**: Classic word-to-picture matching with emoji representations
- **Missing Letter Mode**: Fill-in-the-blank style gameplay where children identify missing letters
- **Extra Letter Mode**: Identify and remove the extra letter inserted into a word
- **Spell Word Mode**: Look at picture and spell the word by selecting letters from 10 available options
- **Mix Mode**: Each new word randomly selects one of the four game types for varied learning experience
- **Game Menu**: Toggle between five different game types via top navigation buttons with intuitive icons

### Educational Design
- **Child-Friendly Interface**: Large buttons, bright colors, emoji icons
- **Russian Language Support**: Cyrillic characters with phonetic audio
- **Progressive Difficulty**: Starts with simple 3-letter words
- **Immediate Feedback**: Visual and audio responses to user actions
- **Smart Progression**: Words answered correctly are excluded for 30 days to focus on challenging vocabulary

### Interactive Elements
- **Clickable Letters**: Each letter plays pronunciation sound in all game modes
- **Picture Matching**: Visual word-to-image association
- **Missing Letter Challenges**: Choose correct letter from 4 options to complete words
- **Extra Letter Removal**: Click on incorrect letters to identify and remove them
- **Word Spelling**: Select letters in sequence to spell words based on pictures
- **Mixed Game Experience**: Random game type selection for each word in mix mode
- **Celebration Animations**: Positive reinforcement for correct answers with auto-progression
- **Error Handling**: Gentle audio feedback without text interruptions
- **Persistent Sessions**: Progress saved across page reloads using localStorage
- **Automatic Flow**: Game automatically advances to next word after celebration

### Accessibility
- **Keyboard Navigation**: Full keyboard support for interactions
- **Screen Reader Support**: Semantic HTML and ARIA labels
- **Mobile Responsive**: Touch-friendly interface for tablets
- **High Contrast**: Clear visual distinctions for readability