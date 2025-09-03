# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Development Commands

### Core Development
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Linting and formatting
npm run lint
npm run format

# Prepare husky hooks (runs automatically)
npm run prepare
```

### Database Operations
```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# View database in Prisma Studio
npx prisma studio

# Reset database (development only)
npx prisma migrate reset
```

### Docker Development
```bash
# Build Docker image
docker build -t ecoh-dashboard .

# Run with Docker Compose (if available)
docker-compose up -d

# PostgreSQL in Docker (from instructions)
docker pull postgres:latest
docker volume create postgres-volume
docker run --name my-postgres --env POSTGRES_PASSWORD=r1101kcn --volume postgres-volume:/var/lib/postgresql/data --publish 5432:5432 --detach postgres
```

## High-Level Architecture

### Application Overview
ECOH Dashboard is a criminal justice case management system built with Next.js 15, designed for managing legal cases, tracking suspects (imputados), victims, and organizational crime networks. The system provides comprehensive case analytics, geographical incident mapping, and timeline tracking.

### Tech Stack
- **Framework**: Next.js 15 with App Router
- **Authentication**: Clerk
- **Database**: PostgreSQL with Prisma ORM
- **Styling**: Tailwind CSS + Shadcn/ui components
- **Charts**: Recharts, Nivo, React Force Graph, D3
- **Maps**: React Leaflet with clustering and drawing capabilities
- **File Handling**: UploadThing for file uploads
- **State Management**: Zustand
- **Forms**: React Hook Form with Zod validation

### Key Directory Structure

#### `/app` - Next.js 15 App Router
- **`/dashboard`** - Main application dashboard with multiple specialized views:
  - `/actividades` - Case activities management
  - `/causas` - Legal cases CRUD and relationships
  - `/imputado` - Suspect management with photo galleries
  - `/organizacion` - Criminal organization networks
  - `/genograma` - Relationship diagrams (family trees)
  - `/geo` - Geographic incident mapping
  - `/reportes` - Analytics and reporting modules
  - `/kanban` - Task management boards
- **`/api`** - API routes for all data operations (30+ endpoints)

#### `/components`
- **UI components** built on Shadcn/ui foundation
- **Charts** - Specialized data visualization components
- **Forms** - Complex multi-step forms for case data entry
- **Maps** - Interactive geographical components
- **Layout** - Navigation, sidebars, headers

#### `/prisma`
- **`schema.prisma`** - Complex database schema with 30+ models for legal case management
- Key models: `Causa` (cases), `Imputado` (suspects), `Victima` (victims), `OrganizacionDelictual` (criminal organizations)

#### `/lib`
- **`prisma.ts`** - Database connection configuration
- **Services** - Business logic for case and suspect management
- **Utils** - Form schemas, validation, API utilities

### Core Domain Models

#### Case Management (`Causa`)
- Central entity representing legal cases
- Links to suspects, victims, organizations, activities
- Tracks case origins (ECOH, SACFI, LEGADA)
- Geographical coordinates and timeline events
- Formalization and procedural tracking

#### Criminal Networks
- **`OrganizacionDelictual`** - Criminal organization entities
- **`CausaOrganizacion`** - Many-to-many relationships between cases and organizations
- **`Genograma`** - Visual relationship mapping with Mermaid diagrams

#### Analytics & Intelligence
- **`CrimenOrganizadoParams`** - Organized crime parameters and scoring
- **`MedidaIntrusiva`** - Intrusive investigation measures
- **Timeline tracking** with `TimelineHito` for case progression
- Geographic clustering and heat maps for incident analysis

### Authentication & Authorization
- Clerk handles user authentication with role-based access
- Middleware protects admin routes and API endpoints
- User context available throughout the application via Clerk providers

### Data Visualization Strategy
The application heavily emphasizes data visualization:
- **Network graphs** for criminal organization relationships
- **Geographic mapping** with clustering for incident locations
- **Timeline visualizations** for case progression
- **Statistical charts** for case analytics and reporting
- **Force-directed graphs** for complex relationship mapping

### File Management
- UploadThing integration for secure file uploads
- Photo galleries for suspect profiles
- PDF generation for case reports and documentation

### Development Patterns

#### Component Architecture
- Server/Client component distinction following Next.js 15 patterns
- Extensive use of React Hook Form with Zod validation
- Shadcn/ui as the component foundation with custom extensions
- Provider pattern for global state (Date ranges, Year selection, Theme)

#### API Design
- RESTful API routes in `/app/api/`
- Consistent error handling and response patterns
- Prisma for all database operations with connection pooling
- File upload endpoints integrated with UploadThing

#### State Management
- Zustand for complex client state
- React Context for user preferences and filters
- Server state via React Query (Tanstack Query)

### Styling and Theming
- Tailwind CSS with custom configuration
- Dark/light theme support via next-themes
- Responsive design with mobile-first approach
- Custom color palette for legal/justice domain

### Key Integration Points

#### Geographic Data
- Leaflet maps with custom markers and clustering
- Drawing tools for case location marking
- Heat maps for incident concentration analysis

#### PDF Generation
- Server-side PDF generation using Puppeteer
- Custom report templates for legal documentation
- Automated case summary generation

#### Data Import/Export
- CSV parsing with Papa Parse
- Excel file handling
- Bulk data import for case migration

This architecture supports a complex criminal justice workflow with emphasis on data visualization, relationship mapping, and comprehensive case tracking across multiple jurisdictions and case types.
