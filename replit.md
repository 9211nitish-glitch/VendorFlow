# Vendor Task Management System

## Overview

This is a comprehensive vendor task management platform built with React + TypeScript frontend, Node.js + Express backend, and MySQL database. The system handles two distinct user roles: administrators who create and manage tasks, and vendors who complete assigned tasks. The platform includes authentication, task management, referral systems, package subscriptions, payment processing via Razorpay, and media file handling.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Library**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens and CSS variables
- **State Management**: TanStack Query for server state, React Context for authentication
- **Routing**: Wouter for lightweight client-side routing
- **Layout Structure**: Role-based layouts (AdminLayout, VendorLayout) with sidebar navigation

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Authentication**: JWT-based authentication with role-based access control
- **File Upload**: Multer middleware for handling media files (images/videos)
- **API Design**: RESTful endpoints with consistent response structure
- **Background Tasks**: Cron service for automated task expiration handling
- **Middleware**: CORS, authentication, file upload, and error handling

### Database Design
- **Database**: MySQL with connection pooling via mysql2
- **Schema Management**: Custom table creation scripts (no ORM used)
- **Key Tables**: users, tasks, packages, payments, referrals, user_packages
- **Relationships**: Foreign key constraints for data integrity
- **Authentication**: Bcrypt for password hashing with salt rounds

### User Management & Authorization
- **Role System**: Admin and Vendor roles with distinct permissions
- **First User Logic**: First registered user automatically becomes admin
- **Referral System**: 5-level deep referral chain with commission calculations
- **User Status**: Active/blocked status management by admins

### Task Management System
- **Task Lifecycle**: Available → In Progress → Completed/Missed
- **Timer System**: Configurable time limits for task completion
- **Assignment Logic**: Admin can assign to specific vendors or make available to all
- **Media Support**: File upload capabilities for task descriptions and submissions
- **Automated Processing**: Cron jobs mark expired tasks as missed

### Payment & Subscription System
- **Payment Gateway**: Razorpay integration for handling payments
- **Package System**: Stars Flock-based packages with Onsite and Online categories
- **Package Categories**: 
  - Onsite: New Star Bundle (₹4,999), Rising Star Starter (₹9,999), Shining Star Pack (₹19,999), Superstar Elite Plan (₹34,999), Legendary Star Package (₹49,999)
  - Online: Fresh Face Trial (₹1,100), Fresh Face Star (₹4,999), Next Level Creator (₹9,999), Influence Empire (₹19,999), SuperStar Pro Package (₹34,999), Legendary Creator Kit (₹49,999)
- **Commission Structure**: Multi-level referral commissions (10%, 5%, 4%, 3%, 2%)
- **Transaction Tracking**: Complete payment lifecycle management

### Security Measures
- **JWT Tokens**: Secure authentication with configurable secret
- **Password Security**: Bcrypt hashing with proper salt rounds
- **File Upload Security**: Type validation and size limits
- **Role-based Access**: Middleware enforcement of permissions
- **Input Validation**: Express-validator for request sanitization

### Development Architecture
- **Monorepo Structure**: Shared schema definitions between frontend and backend
- **Type Safety**: Full TypeScript coverage with shared interfaces
- **Development Tools**: Vite with HMR, ESBuild for production builds
- **Code Organization**: Controller-Service-Model pattern for backend

## External Dependencies

### Core Framework Dependencies
- **React 18**: Frontend framework with hooks and modern patterns
- **Express.js**: Backend web framework
- **TypeScript**: Type-safe development across the stack
- **Vite**: Frontend build tool and development server

### Database & Storage
- **MySQL**: Primary database via mysql2 driver
- **Google Cloud Storage**: Media file storage (@google-cloud/storage)
- **Multer**: File upload handling middleware

### Authentication & Security
- **JSON Web Tokens**: Authentication via jsonwebtoken
- **Bcrypt**: Password hashing and validation
- **Express Validator**: Input validation and sanitization

### Payment Processing
- **Razorpay**: Payment gateway integration for subscriptions
- **Crypto**: Built-in Node.js module for signature verification

### UI & Styling
- **Tailwind CSS**: Utility-first CSS framework
- **Radix UI**: Headless component primitives (@radix-ui/react-*)
- **Lucide React**: Icon library for consistent iconography
- **TanStack Query**: Server state management and caching

### File Upload & Media
- **Uppy**: File upload library (@uppy/*) for enhanced user experience
- **Sharp**: Image processing (likely for optimization)

### Background Processing
- **Node-cron**: Scheduled task processing for expired tasks
- **Nanoid**: Unique identifier generation for referral codes

### Development & Build Tools
- **ESBuild**: Fast JavaScript bundler for production
- **PostCSS**: CSS processing with autoprefixer
- **Class Variance Authority**: Type-safe variant handling for components

### Utility Libraries
- **Wouter**: Lightweight routing for React
- **Date-fns** or similar: Date manipulation (inferred from timer functionality)
- **Zod**: Runtime type validation for shared schemas