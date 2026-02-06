# KLTN Backend

A NestJS backend application for event ticketing and management, featuring user authentication, blockchain wallet integration, and event scheduling.

## Features

- **User Authentication**: JWT-based auth with sign-in with Ethereum (SIWE), roles, and profile management
- **Event Management**: Create and manage events, schedules, ticket types, and categories
- **Blockchain Integration**: Wallet management with ethers.js
- **File Upload**: File handling with configurable storage and temporary file cleanup
- **Email Notifications**: Nodemailer-based mail service with Handlebars templates (verification, password reset)
- **Scheduled Jobs**: Cron-based jobs for event processing and temporary file cleanup
- **Rate Limiting**: Throttling for API protection
- **Database**: TypeORM with MySQL, migrations, and seeding

## Technology Stack

- **Framework**: NestJS 11
- **Runtime**: Node.js
- **Language**: TypeScript
- **Database**: MySQL 8 with TypeORM
- **Auth**: JWT, Argon2 hashing, SIWE (Sign-In with Ethereum)
- **Blockchain**: ethers.js
- **Mail**: Nodemailer + Handlebars
- **Validation**: Zod, class-transformer
- **Logging**: Winston with daily rotate file, Seq support

## Getting Started

### Prerequisites

- **Node.js** 18 or later
- **npm** 9.x or later
- **MySQL** 8.0.x

### Installation

1. **Clone the repository:**

   ```bash
   git clone <repository-url>
   cd kltn_backend
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Set up environment variables:**
   - Copy the example environment file:

   ```bash
   cp .env.example .env
   ```

   - Edit `.env` and configure:

   ```env
   PORT=3333

   DB_HOST=localhost
   DB_PORT=3306
   DB_USERNAME=your_username
   DB_PASSWORD=your_password
   DB_NAME=your_database

   MAIL_HOST=
   MAIL_PORT=
   MAIL_USER=
   MAIL_PASSWORD=
   MAIL_FROM_NAME=TicketVN

   JWT_SECRET=your_jwt_secret
   JWT_EXPIRES_IN=7d

   EVENT_ADMIN_PRIVATE_KEY=
   ```

4. **Configure database and run migrations:**
   - Ensure `src/database/migrations/index.ts` matches your database setup.
   - Generate a migration from entity changes, then run pending migrations:

   ```bash
   make migration_generate MIGRATION_NAME=YourMigrationName
   make migration_run
   ```

   All migration commands (via [Makefile](Makefile)):

   | Command                                                    | Description                            |
   | ---------------------------------------------------------- | -------------------------------------- |
   | `make migration_generate MIGRATION_NAME=YourMigrationName` | Generate migration from entity changes |
   | `make migration_create MIGRATION_NAME=YourMigrationName`   | Create an empty migration file         |
   | `make migration_run`                                       | Run pending migrations                 |
   | `make migration_revert`                                    | Revert the last migration              |

5. **Run the development server:**

   ```bash
   npm run start:dev
   ```

6. **Access the API:**
   The API runs at [http://localhost:3333](http://localhost:3333) with global prefix `api` and default version `1`, e.g. `http://localhost:3333/api/v1/...`.

## Usage

- **Development**: Use `npm run start:dev` for hot-reload.
- **Production**: Run `npm run build` then `npm run start:prod`.

## Project Structure

```
kltn_backend/
├── src/
│   ├── app/                    # App module, exception filters, interfaces
│   ├── blockchain/             # Wallet, ABIs, blockchain module
│   ├── config/                 # Config module and service
│   ├── database/               # TypeORM config, entities, migrations, seedings
│   │   ├── entities/           # User, Event, Wallet, Payment, etc.
│   │   ├── migrations/         # Migration files and runner
│   │   ├── seedings/           # Seed data
│   │   └── ...
│   ├── date-time/              # Date/time utilities
│   ├── environment-variables/  # Env validation and loading
│   ├── event/                  # Event module (controller, service, DTOs, schemas)
│   ├── file/                   # File upload and storage
│   ├── job/                    # Cron jobs and scheduler
│   ├── logger/                 # Winston logger and interceptors
│   ├── notification/           # Mail service and templates
│   ├── pagination/             # Pagination DTOs and utilities
│   ├── security/               # JWT, guards, rate limiting, hashing, encryption
│   ├── shared/                 # Result model, validation pipe, OTP, error utils
│   ├── user/                   # User module: auth, profile, roles
│   ├── main.ts                 # Bootstrap and global config (CORS, versioning, prefix)
│   └── ...
├── test/                       # E2E tests
├── .env.example                # Environment variable template
├── docker-compose.yml          # Docker setup
├── Dockerfile
├── nest-cli.json
├── package.json
├── tsconfig.json
└── README.md
```

## Configuration

### Environment Variables

| Variable                                                      | Description                            |
| ------------------------------------------------------------- | -------------------------------------- |
| `PORT`                                                        | Server port (default: 3333)            |
| `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_NAME` | MySQL connection                       |
| `MAIL_*`                                                      | SMTP settings for notifications        |
| `JWT_SECRET`, `JWT_EXPIRES_IN`                                | JWT configuration                      |
| `EVENT_ADMIN_PRIVATE_KEY`                                     | Admin key for event-related operations |

### API Conventions

- Base path: `/api/v1`
- Global exception filter and request logging
- CORS enabled (configure for production as needed)

## License

This project is licensed under the MIT License.
