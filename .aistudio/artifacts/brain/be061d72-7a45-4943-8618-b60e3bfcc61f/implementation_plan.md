# Basic CRM — Student Project Implementation Plan

A comprehensive, clean, and accessible Customer Relationship Management (CRM) web application designed and built with foundational full-stack principles suitable for a college-level academic project submission. It covers all 8 functional pillars, complete role access (Admin, Sales Manager, Sales Executive), core lead lifecycle workflows, Express API architecture, dual-mode persistence, and submission helpers including an interactive ER diagram, Postman collection exporter, and one-click demo credentials.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> The following project choices were confirmed during Phase 1 clarification:
> - **Backend Persistence Mode**: Dual mode with robust local file/in-memory store pre-seeded with realistic data and seamless optional MongoDB Atlas URI connectivity.
> - **Submission & Academic Tools**: Interactive ER Diagram visualizer, downloadable Postman collection generator, and 1-click test credentials switcher for Admin, Manager, and Executive.
> - **Visual Design Style**: Clean, accessible academic portal layout with structured tables, readable forms, clear feedback alerts, and standard responsive typography.

---

## 1. Overview & Core Concept

- **What It Does**: A complete CRM platform that allows sales teams to capture inbound leads, assign representatives, schedule follow-ups, log call and meeting notes, score lead quality, convert qualified leads into contacts and revenue deals, and track pipeline metrics.
- **Target Audience / Persona**:
  - **Admin**: Full system control, user account provisioning, role management, and global audit.
  - **Sales Manager**: Team assignment, lead distribution, deal pipeline oversight, and conversion reporting.
  - **Sales Executive**: Day-to-day lead management, logging calls/activities, scheduling follow-ups, and converting won deals.
- **Key Value**: Delivers textbook-accurate MERN architecture with clean, readable code, thorough client/server validations, and ready-to-present submission collateral for grading rubrics.

---

## 2. User Experience & Visual Design

### Key User Flows
1. **Authentication & Quick Switch**: Users can register with validation, log in with email/password, or use 1-click demo buttons (`Admin`, `Sales Manager`, `Sales Executive`) to quickly inspect different permission levels.
2. **Lead Intake & Qualification**: Fill out controlled forms with `event.preventDefault()` to create leads (Name, Company, Email, Phone, Source, Status, Quality rating, Estimated Value).
3. **Activity & Follow-Up Tracking**: View a lead's detail page to schedule follow-up reminders (Date, Time, Type: Call/Email/Meeting) and log completed activities with outcome notes.
4. **Lead Conversion**: Convert a Qualified/Hot lead with a single guided action, automatically spawning both a permanent **Contact** and a pipeline **Deal**.
5. **Pipeline & Deal Management**: Track deals across stages (`Prospecting`, `Proposal`, `Negotiation`, `Closed Won`, `Closed Lost`), update stages, and view expected revenue.
6. **Executive Summary Dashboard**: Real-time KPI summary (total leads, conversion rate, pipeline value, win rate, leads by source, and activity counts).
7. **Academic Submission Hub**: Dedicated tab with interactive ER diagram, system architecture breakdown, downloadable Postman collection JSON, and project README.

### Visual Identity & Theme
- **Aesthetic Direction**: Academic portal aesthetic — clean, disciplined, and easy to grade. No overwhelming animations or artificial complexity; clear visual hierarchy with high contrast and readable data tables.
- **Color Palette & Distribution**:
  - Neutral Base (60%): Slate and off-white canvas (`#F8FAFC` background, `#FFFFFF` containers, subtle `#E2E8F0` borders).
  - Structure & Text (30%): Deep slate typography (`#0F172A`), muted neutral labels (`#64748B`).
  - Action & Accent (10%): Royal blue primary (`#2563EB`) for key CTAs and active states, paired with clear semantic cues (green for Won/Hot, amber for In-Progress/Warm, red for Lost/Cold).
- **Typography**: Clean, readable sans-serif (`Plus Jakarta Sans` or system sans) paired with tabular numbers (`tabular-nums`) for currency and date columns.

### Interactive Feedback & States
- **Loading State**: Subtle skeleton rows and spinners during API requests.
- **Empty State**: Clear descriptive notices with a direct CTA button (e.g., "No leads found — Create your first lead").
- **Success & Error State**: Explicit banner alerts and dismissible toast notifications indicating operation results and validation errors.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Dual-Mode Backend Storage (Local JSON / In-Memory + Optional Mongo URI)**
  - *Chosen Approach*: The Express backend runs with an integrated local persistent data store initialized with pre-seeded demo records, while also supporting `MONGODB_URI` environment configuration if the user connects a live MongoDB Atlas cluster.
  - *Why*: Guarantees instant 100% functionality out of the box in the preview sandbox without requiring external database provisioning credentials, while staying true to the Mongoose schema requirements.
  - *Alternatives Considered*: Requiring MongoDB Atlas upfront would fail if credentials are missing or blocked by network policies.

- **Decision 2: React State via Context API Only & Controlled Forms**
  - *Chosen Approach*: `AuthContext` and `CrmContext` provide all state management across routes, and all input forms use standard React `value={...}` and `onChange={...}` controlled state with `event.preventDefault()`.
  - *Why*: Strictly honors the technical requirements from the project specification sheet without introducing external third-party state managers like Redux or Zustand.

- **Decision 3: Express Modular Structure**
  - *Chosen Approach*: Clean separation into `controllers/`, `routes/`, `middleware/` (auth & roles), `models/` (schemas and validation), and `db/`.
  - *Why*: Demonstrates clean, maintainable college-level backend design with clear grading markers.

---

## 4. Technical Architecture & Data Strategy

### Architecture & Component Diagram

```
┌────────────────────────────────────────────────────────────────────────┐
│                          REACT SPA (VITE)                              │
│                                                                        │
│   ┌──────────────────────────────────────────────────────────────┐     │
│   │   App.tsx (BrowserRouter, AuthProvider, CrmProvider, Toast)  │     │
│   └──────────────────────────────┬───────────────────────────────┘     │
│                                  │                                     │
│        ┌─────────────────────────┼─────────────────────────┐           │
│        ▼                         ▼                         ▼           │
│  ┌───────────┐             ┌───────────┐             ┌───────────┐     │
│  │ Dashboard │             │ Lead List │             │ Lead Detail│    │
│  │  Summary  │             │ & Filters │             │ & FollowUp│     │
│  └───────────┘             └───────────┘             └───────────┘     │
│        │                         │                         │           │
│        ▼                         ▼                         ▼           │
│  ┌───────────┐             ┌───────────┐             ┌───────────┐     │
│  │ Deal/Pipe │             │ Contacts  │             │ Academic  │     │
│  │   Board   │             │ Directory │             │ ER & Docs │     │
│  └───────────┘             └───────────┘             └───────────┘     │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │ HTTP API (JWT Bearer Token)
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│                          EXPRESS SERVER                                │
│                                                                        │
│   ┌───────────────────────────┐       ┌────────────────────────────┐   │
│   │  Auth & Role Middleware   │ ───►  │   Controllers & Services   │   │
│   │ (JWT verify, role guards) │       │ (auth, lead, deal, etc.)   │   │
│   └───────────────────────────┘       └──────────────┬─────────────┘   │
│                                                      │                 │
│                                       ┌──────────────▼─────────────┐   │
│                                       │   Mongoose Schemas / DB    │   │
│                                       │ (Dual Local + Mongo Atlas) │   │
│                                       └────────────────────────────┘   │
└────────────────────────────────────────────────────────────────────────┘
```

### Data Models & Relationships

1. **User**: `id`, `name`, `email`, `passwordHash`, `role` (`Admin` | `Sales Manager` | `Sales Executive`), `createdAt`.
2. **Lead**: `id`, `name`, `company`, `email`, `phone`, `source` (`Website`, `Referral`, `Cold Call`, `Social`, `Event`), `status` (`New`, `Contacted`, `Qualified`, `Proposal`, `Converted`, `Lost`), `quality` (`Hot`, `Warm`, `Cold`), `assignedTo` (User ref), `estimatedValue`, `notes`, `createdAt`, `updatedAt`.
3. **Activity**: `id`, `leadId` (ref), `dealId` (optional ref), `type` (`Call`, `Email`, `Meeting`, `Note`), `summary`, `details`, `performedBy` (User ref), `createdAt`.
4. **FollowUp**: `id`, `leadId` (ref), `scheduledDate`, `scheduledTime`, `type` (`Call`, `Demo`, `Follow-up Email`), `status` (`Pending`, `Completed`, `Cancelled`), `notes`, `assignedTo` (User ref), `createdAt`.
5. **Contact**: `id`, `name`, `company`, `email`, `phone`, `leadId` (origin ref), `assignedTo` (User ref), `notes`, `createdAt`.
6. **Deal**: `id`, `title`, `leadId` (ref), `contactId` (ref), `value`, `stage` (`Prospecting`, `Qualified`, `Proposal`, `Negotiation`, `Closed Won`, `Closed Lost`), `expectedCloseDate`, `assignedTo` (User ref), `createdAt`, `updatedAt`.

### API Routes & Authorization Matrix

| Endpoint | Method | Allowed Roles | Description |
| :--- | :--- | :--- | :--- |
| `/api/auth/register` | `POST` | Public | Register new user account |
| `/api/auth/login` | `POST` | Public | Authenticate user & return JWT token |
| `/api/auth/me` | `GET` | All logged-in | Return current user profile |
| `/api/leads` | `GET`, `POST` | All roles | List/Filter/Paginate leads; create new lead |
| `/api/leads/:id` | `GET`, `PUT`, `DELETE` | All (DELETE: Admin/Manager) | Get, update, delete lead record |
| `/api/leads/:id/convert` | `POST` | All roles | Convert lead into Contact & Deal |
| `/api/followups` | `GET`, `POST`, `PATCH` | All roles | List, schedule, complete follow-up items |
| `/api/activities` | `GET`, `POST` | All roles | View activity history, log call/note |
| `/api/contacts` | `GET`, `POST`, `PUT`, `DELETE` | All roles | Manage customer contact directory |
| `/api/deals` | `GET`, `POST`, `PUT`, `DELETE` | All roles | Manage deals and sales pipeline stages |
| `/api/users` | `GET` | All roles (manage: Admin) | List team members for assignment |
| `/api/dashboard/stats` | `GET` | All roles | Aggregate summary metrics & chart data |
| `/api/export/postman` | `GET` | All roles | Download complete Postman v2.1 collection |

---

## 5. Implementation Sequence

1. **Backend Foundation (`server.ts` & modules)**:
   - Setup Express server mounted on port 3000 with Vite middlewares for development.
   - Implement auth middleware with JWT tokens and role verification.
   - Implement data storage engine with seed data for all 6 models.
   - Build complete REST endpoints with query params (`search`, `filter`, `page`, `limit`, `sort`).
2. **Frontend State & Navigation**:
   - Install `react-router-dom` and configure client routes.
   - Build `AuthContext` and `CrmContext` with full API interaction methods.
   - Implement navigation bar with active user role badge and 1-click test user switcher.
3. **Core CRUD & Workflow Pages**:
   - Dashboard with KPI cards, pipeline stage distribution, and quick actions.
   - Leads management with search, status/quality filters, pagination, and Create/Edit modal forms.
   - Lead Detail view with activity timeline, follow-up scheduler, and 1-click conversion modal.
   - Deals Pipeline with visual stage columns and stage-shifting.
   - Contacts Directory with search and company grouping.
4. **Academic Submission Features**:
   - Interactive SVG Entity-Relationship (ER) diagram with entity cardinality and fields.
   - Postman Collection exporter and in-browser API explorer with sample request/response payloads.
   - Quick demo test accounts bar for easy live demonstration.
5. **Verification & Packaging**:
   - Update `metadata.json` and `index.html`.
   - Run compilation and verify complete error-free execution.
