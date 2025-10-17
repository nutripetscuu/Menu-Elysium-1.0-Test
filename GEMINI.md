# Project: Elysium Restaurant Menu

## Project Overview

This is a Next.js application that serves as a digital menu for a Japanese restaurant called "Elysium". The application is built with a modern tech stack, including:

*   **Framework**: Next.js 15 with the App Router
*   **Language**: TypeScript
*   **Styling**: Tailwind CSS with shadcn/ui components
*   **Backend**: Supabase (PostgreSQL) for the database, authentication, and storage
*   **AI**: Genkit for AI-powered features
*   **Deployment**: Vercel

The main purpose of this application is to display the restaurant's menu to customers in an elegant and user-friendly way. It also includes an admin panel for the restaurant staff to manage the menu, promotions, and other settings.

## Building and Running

### Prerequisites

*   Node.js (version 20 or higher)
*   npm

### Installation

1.  Install the dependencies:

    ```bash
    npm install
    ```

### Environment Variables

Create a `.env.local` file in the root of the project and add the following environment variables:

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### Running the Development Server

To run the development server, use the following command:

```bash
npm run dev
```

The application will be available at `http://localhost:9002`.

### Building for Production

To build the application for production, use the following command:

```bash
npm run build
```

### Other Scripts

*   `npm run lint`: Lint the code using Next.js's built-in ESLint configuration.
*   `npm run typecheck`: Run the TypeScript compiler to check for type errors.
*   `npm run genkit:dev`: Start the Genkit development server.

## Development Conventions

*   **Coding Style**: The project follows the standard TypeScript and React conventions. The code is formatted using Prettier.
*   **Testing**: There are no testing frameworks configured in the project yet.
*   **Commits**: There is no specific commit message convention enforced.
*   **API**: The application uses an API abstraction layer in `src/lib/api` to interact with the Supabase backend.
*   **Authentication**: The admin panel uses Supabase Auth for authentication. The authentication flow is documented in `docs/ADMIN_PANEL_ARCHITECTURE.md`.
*   **Database**: The database schema is defined in `src/lib/supabase/client.ts` and in the migration files in the `supabase/migrations` directory.
*   **Admin Panel**: The architecture for the admin panel is documented in `docs/ADMIN_PANEL_ARCHITECTURE.md`.
