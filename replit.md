# Workout Generator 2.0

## Overview

Workout Generator 2.0 is a full-stack web application designed for generating personalized cycling workouts based on FTP (Functional Threshold Power) training zones. The application provides a modern, dark-themed interface for creating science-based training sessions across different workout types including recovery, endurance, tempo, threshold, VO2max, and anaerobic workouts. Users can customize workout duration, difficulty, and receive structured training plans with detailed step-by-step instructions.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The frontend is built using **React 18** with **TypeScript** and styled with **TailwindCSS**. The application follows a component-based architecture with:

- **UI Components**: Leverages shadcn/ui component library built on Radix UI primitives for consistent, accessible design
- **Form Management**: Uses React Hook Form with Zod validation for type-safe form handling
- **State Management**: React Query (TanStack Query) for server state management and caching
- **Build System**: Vite for fast development and optimized production builds
- **Styling**: TailwindCSS with CSS custom properties for theming and dark mode support

The frontend implements a single-page application (SPA) architecture with component composition patterns. Key architectural decisions include using controlled components for forms, lifting state up for workout data sharing between components, and implementing custom hooks for reusable logic.

### Backend Architecture
The backend uses **Express.js** with **TypeScript** in an ESM (ES Modules) configuration. The architecture follows a modular pattern with:

- **Router Pattern**: Centralized route registration in `/api` namespace
- **Storage Abstraction**: Interface-based storage layer supporting both in-memory and database implementations
- **Middleware Stack**: Custom logging, JSON parsing, and error handling middleware
- **Development Integration**: Vite middleware integration for seamless full-stack development

The storage layer uses an interface pattern (IStorage) allowing for easy swapping between MemStorage (in-memory) and future database implementations. The Express server is configured with proper error handling and request logging.

### Database Design
The application uses **Drizzle ORM** with **PostgreSQL** for data persistence:

- **Schema Definition**: Type-safe schema definitions in `/shared/schema.ts`
- **Migration System**: Drizzle Kit for database migrations and schema changes
- **Connection**: Neon Database serverless PostgreSQL connection
- **Type Safety**: Full TypeScript integration with inferred types from schema

The current schema includes a users table with UUID primary keys, unique usernames, and password fields. The shared schema approach ensures type consistency between frontend and backend.

### Authentication & Session Management
The application is prepared for session-based authentication using:

- **Session Storage**: PostgreSQL-backed sessions with connect-pg-simple
- **User Management**: Basic user schema with username/password authentication
- **Type Safety**: Zod schemas for user input validation

### Development & Build Pipeline
The application uses a modern development setup with:

- **Hot Reload**: Vite HMR for frontend, tsx watch mode for backend
- **Type Checking**: Shared TypeScript configuration across client/server/shared code
- **Path Aliases**: Configured path mapping for clean imports
- **Build Process**: Separate client (Vite) and server (esbuild) build processes
- **Database Operations**: Drizzle Kit commands for schema management

The monorepo structure with `/client`, `/server`, and `/shared` directories provides clear separation of concerns while enabling code sharing for types and schemas.

## External Dependencies

### Core Framework Dependencies
- **@neondatabase/serverless**: Serverless PostgreSQL driver for Neon Database
- **drizzle-orm**: Type-safe ORM with PostgreSQL dialect
- **express**: Web application framework for Node.js
- **react**: Frontend library with TypeScript support
- **vite**: Build tool and development server

### UI & Styling Dependencies
- **@radix-ui/***: Comprehensive collection of accessible UI primitives
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Type-safe variant API for component styling
- **lucide-react**: Icon library for consistent iconography

### Form & Validation Dependencies
- **react-hook-form**: Performant form library with minimal re-renders
- **@hookform/resolvers**: Resolver integrations for validation libraries
- **zod**: Type-safe schema validation
- **drizzle-zod**: Integration between Drizzle ORM and Zod validation

### State Management Dependencies
- **@tanstack/react-query**: Server state management and caching
- **connect-pg-simple**: PostgreSQL session store for Express sessions

### Development Dependencies
- **typescript**: Type system for JavaScript
- **tsx**: TypeScript execution engine for Node.js
- **drizzle-kit**: Database migration and introspection tool
- **@replit/vite-plugin-***: Replit-specific development plugins

The application integrates with Neon Database for PostgreSQL hosting and is configured for deployment on platforms supporting Node.js applications.