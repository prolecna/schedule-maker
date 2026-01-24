1. Read the copilot instructions and `AGENTS.md` to get familiar with general instructions.
2. Read the `SPEC.md` file to understand what project you're working on.
3. Create the navigation sidebar on the left side of the screen. It should be visible on every page. It should have the following pages: schedule, grades, teachers, subjects and rules. All routes should be protected and visible only to signed in users.
   - Created `Sidebar` component with navigation links using lucide-react icons.
   - Updated protected layout to include sidebar with new header structure.
   - Created placeholder pages for schedule, grades, teachers, subjects, and rules under `/protected`.
   - Moved all routes to root using `(dashboard)` route group.
4. Update the theme switcher to be a switch component (only 2 options are light and dark).
   - Added `@radix-ui/react-switch` and created Switch UI component.
   - Replaced dropdown theme switcher with a simple switch toggle between light/dark.
5. Using the supabase MCP server, get familiar with the database and all of its tables. Implement the database service which should be able to read the schedule, grades, teachers, subjects and rules. Implement only "get all" methods to start with.
   - Created `types/db.ts` with TypeScript types generated from Supabase schema.
   - Created `services/db-service.ts` with getGrades, getTeachers, getSubjects, getRules, and getScheduleSlots functions.
6.
