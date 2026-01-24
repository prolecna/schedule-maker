# School Schedule Maker

A web application that helps teachers and school staff generate school schedules with ease. Instead of manually creating schedules, this app allows you to define rules (hard requirements and soft preferences) and automatically generates schedules that fulfill them.

## Features

- **Schedule Generation** - Automatically generate schedules based on defined rules
- **Grade Management** - Add, edit, and delete school grades
- **Teacher Management** - Manage teacher information
- **Subject Management** - Configure available subjects
- **Rules System** - Define hard rules (must follow) and soft rules (try to follow)
- **Authentication** - Secure login with Supabase Auth

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Database:** Supabase
- **Styling:** Tailwind CSS + Radix UI
- **Authentication:** Supabase Auth

## Getting Started

### Prerequisites

- Node.js 18+
- PNPM
- A Supabase project ([create one here](https://database.new))

### Installation

1. Clone the repository

   ```bash
   git clone <repository-url>
   cd schedule-maker
   ```

2. Install dependencies

   ```bash
   pnpm install
   ```

3. Set up environment variables

   Copy `.env.example` to `.env.local` and fill in your Supabase credentials:

   ```bash
   cp .env.example .env.local
   ```

   Required variables:

   ```
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-supabase-anon-key
   ```

4. Run the development server

   ```bash
   pnpm dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser
