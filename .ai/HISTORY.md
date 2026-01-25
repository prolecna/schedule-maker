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
6. Using the database service, fetch all teachers and display them on the /teachers page in a nice-looking table from Radix UI.
   - Added shadcn/ui Table component.
   - Added `getCurrentUserProfile` method to DatabaseService to fetch the current user's profile (including school_id).
   - Updated `/teachers` page to fetch teachers from the database and display them in a styled table with columns for Name, Role, and Specialty Subject.
7. Currently, the sign up form in this application takes an email and password. On submit, it creates a new user in the Supabase system. I want to add onto that - after the user is created, I want to proceed to the "next step" form that has following inputs:
   - Full name (required text input with max-length of 30 chars)
   - Role (dropdown with autoselected only option of "Teacher")
   - School (dropdown with options from the "schools" table in db)

On submit, the data is used to create a new row in the "profiles" table in Supabase db.

- Added shadcn/ui Select component for dropdowns.
- Added `getSchools` method to DatabaseService.
- Created `CompleteProfileForm` component with full name input (max 30 chars with counter), role dropdown (pre-selected "Teacher"), and school dropdown.
- Created `/auth/complete-profile` page that fetches schools and redirects if profile already exists.
- Updated `/auth/confirm` route to redirect to `/auth/complete-profile` after email verification.

8. Make sure the user cannot visit any pages if he is only a Supabase user, but he doesn't have a profile in the "profiles" table.
   - Already implemented in the dashboard layout - checks for profile existence and redirects to `/auth/complete-profile` if not found.
9. Display the logged in user's School name above the navigation sidebar on the left.
   - Added `getSchoolById` method to DatabaseService.
   - Updated Sidebar component to accept `schoolName` prop and display it above the navigation.
   - Updated dashboard layout to fetch the school and pass its name to the Sidebar.
10. Display a "Add teacher" button on the right side of the "Teachers" h1 tag. When clicked, it should open a drawer from the right side of the screen with a form. The form inputs are:

- School (readonly label with the school of the currently logged in user)
- Full name (required dropdown field that lists profiles from the db + an option to create a new teacher (without a profile) which should convert the input into a text field - you should also be able to switch back to dropdown mode)
- Specialty (list of "subjects" from db)

On submit, it should add a new row to the "teachers" table in db. If user selected an existing profile, it should add it to the "profile_id" field (and also fetch the full_name from the profile and copy it to the "full_name" field in newly created teachers row). Otherwise, if user input the full name instead (no existing profile), it should only fill the "full_name" field in db.

- Added `vaul` library and created shadcn/ui Drawer component (slides from right).
- Added `getAvailableProfiles` method to DatabaseService to fetch profiles not yet linked to teachers.
- Created `AddTeacherDrawer` component in `components/add-teacher-drawer/` folder with:
  - Server action (`actions.ts`) for lazy-loading drawer data only when opened.
  - School name display (readonly label).
  - Profile selection dropdown with toggle to switch to "create new" mode (text input for full name).
  - Subject selection as a flat scrollable list with styled bordered buttons and custom scrollbar.
- Added partial unique index on `teachers.profile_id` in Supabase to prevent duplicate profile links.
- Added error handling for unique constraint violations with user-friendly message.
- Hides "Select existing" toggle when no available profiles exist.
- Clears cached data after successful submission to refresh available profiles.
