# Smart Beverage Dispensing Kiosk System

## Overview

This is a multilingual beverage-dispensing kiosk system designed for a Raspberry Pi 4B with a 7" touch display. The system provides a touchscreen interface for beverage selection and dispensing, with comprehensive admin management capabilities. It's built as a modern web application with both customer-facing kiosk functionality and administrative controls.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **React-based**: Built with React 18, TypeScript, and Vite for fast development
- **Touch-optimized UI**: Designed specifically for 7" touchscreen displays
- **Multilingual Support**: English and Slovak language support via translation system
- **Component Library**: Uses shadcn/ui components with Radix UI primitives
- **State Management**: Zustand for client-side state (cart, language preferences)
- **Styling**: Tailwind CSS with custom design system

### Backend Architecture
- **Node.js/Express**: RESTful API server with TypeScript
- **WebSocket Support**: Real-time communication for admin panel updates
- **Service Layer**: Modular services for orders, inventory, and hardware control
- **Database ORM**: Drizzle ORM with PostgreSQL dialect
- **Session Management**: Express sessions with PostgreSQL storage

### Hardware Integration
- **GPIO Control**: Simulated hardware service for valve and flow sensor control
- **Flow Sensors**: YF-S301 sensors for accurate volume measurement
- **Solenoid Valves**: 12V valves for beverage dispensing control
- **Camera Module**: For age verification functionality

## Key Components

### Database Schema
- **Beverages**: Product catalog with multilingual names, pricing, and hardware pins
- **Orders**: Transaction records with items, status, and payment information
- **System Logs**: Application logging for debugging and monitoring
- **Inventory Logs**: Stock tracking and audit trail

### API Endpoints
- **Kiosk API**: `/api/beverages`, `/api/orders`, `/api/verify-age`
- **Admin API**: `/api/admin/*` for beverage management, inventory, and system monitoring
- **WebSocket**: Real-time updates for admin dashboard

### Core Services
- **Order Service**: Handles order creation, processing, and fulfillment
- **Inventory Service**: Stock management and low-stock alerts
- **Hardware Service**: GPIO control for valves and flow sensors
- **Storage Service**: Database abstraction layer

## Data Flow

1. **Customer Interaction**: Touch interface for beverage selection and cart management
2. **Age Verification**: Camera-based age estimation for alcoholic beverages
3. **Payment Processing**: Simulated card/cash payment handling
4. **Order Fulfillment**: Hardware control for precise beverage dispensing
5. **Real-time Updates**: WebSocket notifications to admin panel
6. **Inventory Tracking**: Automatic stock deduction and logging

## External Dependencies

### Database
- **Neon PostgreSQL**: Serverless PostgreSQL database
- **Connection Pooling**: @neondatabase/serverless for efficient connections

### UI Components
- **Radix UI**: Accessible component primitives
- **Lucide React**: Icon library for consistent iconography
- **React Hook Form**: Form handling with validation
- **Zod**: Schema validation for type safety

### Development Tools
- **Vite**: Fast build tool with HMR
- **TypeScript**: Type safety across the entire stack
- **Tailwind CSS**: Utility-first CSS framework
- **Drizzle Kit**: Database migrations and schema management

## Deployment Strategy

### Development Environment
- **Local Development**: Vite dev server with Express backend
- **Hot Module Replacement**: Instant updates during development
- **Mock Hardware**: Simulated GPIO for development without Raspberry Pi

### Production Environment
- **Raspberry Pi Deployment**: Optimized for ARM architecture
- **Kiosk Mode**: Fullscreen browser configuration
- **Process Management**: PM2 or similar for application lifecycle
- **Database**: Neon PostgreSQL for managed database hosting

### Build Process
- **Frontend Build**: Vite builds optimized React application
- **Backend Build**: esbuild bundles Node.js server
- **Static Assets**: Served from Express in production
- **Environment Variables**: Database URL and configuration management

### Key Design Decisions

1. **Monorepo Structure**: Shared types and schemas between frontend and backend
2. **TypeScript First**: End-to-end type safety for better maintainability
3. **Touch-First UI**: Large buttons and touch targets for kiosk environment
4. **Real-time Admin**: WebSocket integration for live system monitoring
5. **Modular Services**: Separated concerns for easier testing and maintenance
6. **Hardware Abstraction**: Service layer allows for easy hardware simulation and testing