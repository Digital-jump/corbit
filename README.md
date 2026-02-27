# CORBIT - Multi-Company Workforce OS

## Architecture Overview

CORBIT is designed as a multi-tenant SaaS platform. Due to the runtime environment (single container, single port), we are adapting the "Subdomain" requirement to a "Path-based" or "Header-based" routing strategy for the prototype, while maintaining the *internal architecture* of a subdomain system.

### Database Architecture: Isolated Tenancy
We use a **Database-per-Tenant** simulation using `better-sqlite3`.
1. **System Database (`system.db`)**: Holds global information:
   - Tenants (Companies)
   - Global User Lookup (email -> tenant mapping)
   - Billing/Subscription Status
2. **Tenant Databases (`tenant_<uuid>.db`)**: Holds isolated company data:
   - Employees
   - Attendance
   - Payroll
   - Chat/Tasks

### Tech Stack
- **Frontend**: React 19, Tailwind CSS (Dark Emerald Theme), Lucide Icons, Recharts
- **Backend**: Express.js, Better-SQLite3
- **Auth**: JWT (HttpOnly Cookies)

## Directory Structure
- `/server`: Backend logic
  - `/db`: Database connection & schema management
  - `/middleware`: Auth & Tenant resolution
  - `/routes`: API endpoints
- `/src`: Frontend logic
  - `/components`: Reusable UI
  - `/pages`: Application views
  - `/lib`: Utilities & API clients
