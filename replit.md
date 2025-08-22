# HealthAI - AI-Powered Health Analysis Platform

## Overview

HealthAI is a modern web application that provides AI-powered analysis of blood test results and health metrics. The platform features a mobile-first design with comprehensive health tracking capabilities, including blood analysis interpretation, biomarker monitoring, health profile management, and AI-powered health consultations. Built with React and Express, it offers a seamless user experience for managing personal health data and receiving intelligent insights.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript in a single-page application (SPA) architecture
- **Routing**: Client-side routing using Wouter for lightweight navigation
- **State Management**: TanStack React Query for server state management with optimistic updates
- **UI Framework**: Shadcn/ui components built on Radix UI primitives with Tailwind CSS for styling
- **Mobile-First Design**: Responsive design optimized for mobile devices with bottom navigation and modal-based interactions
- **Form Handling**: React Hook Form with Zod validation for type-safe form processing
- **File Upload**: Uppy integration for file uploads with progress tracking and preview capabilities

### Backend Architecture
- **Runtime**: Node.js with Express.js server framework
- **Language**: TypeScript with ES modules for modern JavaScript features
- **API Design**: RESTful API architecture with JSON responses
- **Database Integration**: Drizzle ORM with PostgreSQL database using Neon serverless database
- **Storage**: Google Cloud Storage integration for file storage with custom ACL (Access Control List) management
- **Development Server**: Vite integration for hot module replacement in development

### Data Storage Solutions
- **Primary Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Schema Management**: Drizzle migrations for version-controlled database schema changes
- **Object Storage**: Google Cloud Storage for file uploads (blood test images, documents)
- **In-Memory Storage**: Fallback MemStorage implementation for development and testing
- **Data Models**: Comprehensive health data models including users, health profiles, blood analyses, biomarkers, chat sessions, and health metrics

### Authentication and Authorization
- **Current Implementation**: Demo mode with default user (user-1) for development
- **Future-Ready**: Object ACL system designed for user-based access control with configurable access groups and permissions
- **Session Management**: Prepared for cookie-based session management with secure authentication

### External Service Integrations
- **Cloud Storage**: Google Cloud Storage with Replit sidecar authentication for seamless file management
- **AI Services**: Framework ready for AI integration for blood analysis interpretation and health consultations
- **File Processing**: Uppy dashboard for advanced file upload handling with progress tracking and validation
- **Development Tools**: Replit-specific integrations for development environment optimization

### Key Design Patterns
- **Repository Pattern**: IStorage interface with multiple implementations for flexible data access
- **Component Composition**: Modular UI components with clear separation of concerns
- **Hook-Based Architecture**: Custom React hooks for reusable stateful logic
- **Type Safety**: End-to-end TypeScript with shared types between client and server
- **Responsive Design**: Mobile-first approach with adaptive layouts and touch-friendly interfaces
- **Error Handling**: Comprehensive error boundaries and user-friendly error messaging