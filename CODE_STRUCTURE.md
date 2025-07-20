# Smart Beverage Kiosk - Code Structure

## Overview
Clean, production-ready codebase for Raspberry Pi beverage dispensing kiosk with web admin interface.

## Architecture

### Backend (`server/`)
```
server/
├── index.ts           # Express server with CORS configuration for Pi connectivity
├── routes.ts          # API endpoints (kiosk + admin) with WebSocket support
├── storage.ts         # Database abstraction layer (PostgreSQL via Drizzle)
├── db.ts             # Database connection and configuration
├── vite.ts           # Development server integration
└── services/
    ├── orderService.ts      # Order processing and fulfillment logic
    ├── inventoryService.ts  # Stock management and alerts
    └── hardwareService.ts   # GPIO control for Pi hardware
```

### Frontend (`client/`)
```
client/src/
├── App.tsx           # Main app with routing (Kiosk / Admin)
├── pages/
│   ├── kiosk.tsx     # Touch-optimized kiosk interface
│   ├── admin.tsx     # Web-based admin dashboard
│   └── not-found.tsx # 404 page
├── components/
│   ├── kiosk/        # Touch-first UI components
│   │   ├── DrinkSelection.tsx
│   │   ├── Cart.tsx
│   │   ├── AgeVerification.tsx
│   │   ├── Payment.tsx
│   │   ├── Dispensing.tsx
│   │   └── LanguageToggle.tsx
│   ├── admin/        # Admin dashboard components
│   │   ├── Dashboard.tsx
│   │   ├── BeverageManagement.tsx
│   │   ├── OrderManagement.tsx
│   │   ├── InventoryManagement.tsx
│   │   └── SystemSettings.tsx
│   └── ui/           # Reusable shadcn/ui components
├── hooks/
│   ├── useCart.ts        # Shopping cart state management
│   ├── useLanguage.ts    # i18n support (EN/SK)
│   ├── useWebSocket.ts   # Real-time admin updates
│   ├── use-toast.ts      # Toast notifications
│   └── use-mobile.tsx    # Mobile responsiveness
└── lib/
    ├── queryClient.ts    # API client with CORS support
    ├── kioskUtils.ts     # Formatting utilities (price, volume, etc.)
    ├── translations.ts   # Multilingual text content
    └── utils.ts          # General utilities
```

### Database Schema (`shared/`)
```
shared/schema.ts - Drizzle ORM schemas:
├── beverages         # Product catalog with GPIO pins
├── orders           # Transaction records
├── systemLogs       # Application logging
└── inventoryLogs    # Stock tracking audit trail
```

### Deployment (`deployment/`)
```
deployment/
├── raspberry-pi-setup.sh  # Automated Pi setup script
└── README.md              # Deployment instructions
```

## Key Features

### 🍺 Kiosk Interface
- **Touch-optimized**: Large buttons for 7" Raspberry Pi display
- **Multilingual**: English/Slovak language support
- **Age verification**: Camera and ID scanning integration
- **Payment processing**: Simulated card/cash handling
- **Real-time dispensing**: GPIO-controlled hardware integration

### 🎛️ Admin Dashboard
- **Live monitoring**: Real-time order updates via WebSocket
- **Inventory management**: Stock tracking with low-stock alerts
- **Product configuration**: Beverage setup with hardware mapping
- **Analytics**: Sales reports and system statistics
- **System logs**: Comprehensive logging and debugging

### 🔧 Hardware Integration
- **GPIO control**: Solenoid valves and flow sensors
- **Production/development modes**: Hardware simulation for development
- **Cross-platform**: Works on Pi and development machines

## Technology Stack

### Core
- **TypeScript**: End-to-end type safety
- **React 18**: Modern frontend with hooks
- **Express.js**: RESTful API server
- **PostgreSQL**: Reliable database with Neon hosting
- **Drizzle ORM**: Type-safe database operations

### UI/UX
- **Tailwind CSS**: Utility-first styling
- **shadcn/ui**: Accessible component library
- **Framer Motion**: Smooth animations
- **Radix UI**: Unstyled accessible primitives

### State & Data
- **Zustand**: Lightweight state management
- **TanStack Query**: Server state and caching
- **Wouter**: Minimal routing
- **Zod**: Runtime type validation

### Development
- **Vite**: Fast build tool and dev server
- **esbuild**: Production bundling
- **tsx**: TypeScript execution

## Production Deployment

### Raspberry Pi Configuration
- **Environment**: `NODE_ENV=production`, `HARDWARE_MODE=production`
- **API URL**: Points to production Replit deployment
- **Kiosk mode**: Fullscreen Chromium browser
- **Process management**: PM2 for auto-restart

### Cloud Infrastructure
- **Hosting**: Replit Deployments
- **Database**: Neon PostgreSQL serverless
- **CORS**: Configured for Pi IP ranges
- **Monitoring**: Built-in system status checks

## Development Workflow

1. **Local development**: `npm run dev` starts both frontend and backend
2. **Database changes**: `npm run db:push` pushes schema updates
3. **Production build**: `npm run build` creates optimized bundle
4. **Pi deployment**: Run `deployment/raspberry-pi-setup.sh` on target device

## Quality Assurance

- **Type safety**: Shared schemas between frontend/backend
- **Error handling**: Comprehensive try/catch blocks
- **Logging**: Structured system and inventory logs
- **Validation**: Zod schemas for all API endpoints
- **Testing**: Real hardware tested in production environment