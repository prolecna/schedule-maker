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

11. I think the db model is a little complex when it comes to users. I want to merge profiles and teachers tables together. The result would be 1 "users" table with columns: id (from supabase auth), full_name (text), role (text - teacher, admin, etc), school_id, specialty_subject_id.

Create a plan to implement this change (db level, code level, etc).

- Database migrations:
  - Created `users` table with columns: `id` (UUID), `auth_id` (nullable FK to auth.users), `full_name`, `role`, `school_id`, `specialty_subject_id`.
  - Migrated data from `profiles` (users with accounts) and `teachers` (including virtual teachers without accounts).
  - Updated `schedule_slots.teacher_id` and `rules.updated_by` foreign keys to reference `users.id`.
  - Updated RLS policy on `schedule_slots` to use `users` table instead of `profiles`.
  - Dropped old `profiles` and `teachers` tables.
  - Added unique index on `(full_name, specialty_subject_id)` to prevent duplicate teachers.
- Updated TypeScript types (`types/db.ts`):
  - Removed `Profile`, `Teacher`, `TeacherWithProfile` types.
  - Added `User`, `UserWithSubject` types.
- Updated DatabaseService (`services/db-service.ts`):
  - Renamed `getCurrentUserProfile()` → `getCurrentUser()` (queries by `auth_id`).
  - `getTeachers()` now queries `users` with `specialty_subject_id IS NOT NULL`.
  - Added `getUsers()`, `getUsersWithoutSubject()`, `createUser()`, `updateUser()`.
  - Removed `getProfiles()`, `getAvailableProfiles()`, `createTeacher()`.
- Updated components:
  - Dashboard layout uses `getCurrentUser()`.
  - Teachers page uses `UserWithSubject` type directly (no more nested `profile`). Removed Role column as it's now redundant.
  - `AddTeacherDrawer` creates new users or updates existing users' `specialty_subject_id`.
  - `CompleteProfileForm` moved to `components/complete-profile-form/` folder:
    - Added server action (`actions.ts`) for fetching subjects by school ID.
    - Form now requires subject selection (fetched via server action when school changes).
    - Auto-selects school if only one school exists.
    - Uses `useTransition` for loading state when fetching subjects.
    - Inserts into `users` table with `auth_id` and `specialty_subject_id`.
- Added user-friendly error message for duplicate name+subject constraint violation.

12. Add a new column to Teachers table: "Actions". It should have 2 buttons for editing and deleting a teacher. The edit button should open the drawer (same as when creating a new teacher) and fill in the fields. After saving, the row should be updated in the db (users table) and the table should be refreshed. On delete, there should be a warning dialog (are you sure). After confirming, delete the row in the users table in db.

- Added "Actions" column to Teachers table with edit/delete buttons (`teacher-actions.tsx`).
- Extended `AddTeacherDrawer` with `teacher`, `trigger`, and `onSuccess` props for edit mode support.
- Added `deleteTeacher` server action with confirmation dialog (uses `Dialog` instead of `AlertDialog` to close on outside click).
- Added Sonner toast notifications for success/error feedback.
- Changed default mode to "Create new" (can switch to "Select existing").
- UI: compact buttons, custom toast styling (accent bg, thumbs-up icon), fade-only dialog animation.

13. Implemenet the /grades page. It should fetch all grades from db and display them as a list of cards. Each card should be a nice square (with rounded corners) that displays the grade in following format: 5₂ (level = 5, group = 2) - use subscript for this. It should also display the number of students (this is secondary info).

- Grades displayed as square cards with level+group (e.g., 5₂) and student count.

14. Implemenet the /subjects page. It should fetch all subjects from db and display them as a list of cards. Each card should display the name of the subject (primary info) and the name of the teacher for that subject, if any (secondary info).

- Created /subjects page that fetches all subjects from the database and displays them as cards.
- Each card shows the subject name and, if assigned, the teacher(s) as secondary info.
- Supports multiple teachers per subject and displays all assigned teachers.
- Added client-side filtering for assigned/unassigned subjects and improved teacher label UX (expands on hover).

15. Implement the /rules page. It should display a table of rules fetched from the db. Columns are: name, rule type, hard rule (checkbox), parameters (prettified and expandible JSON).

- Created /rules page that fetches all rules from the database and displays them in a styled table.
- Columns: name, rule type (as tag), hard rule (checkbox), and parameters (expandable, prettified JSON).
- Shows empty state if no rules exist. Matches Teachers table layout for consistency.

16. Remove the num_of_students column from grades table in db. Remove the usage of this field in application code.
    The reason for this removal is because this data is not available when importing from an excel file.

- Removed the num_of_students column from grades table.
- Removed the usage of this field in application code.

17. Modify the supabase database in order to allow support for multiple schools per user. Update the application code accordingly.

- DB Migration: Created the user_schools join table and user_school_role enum, migrating per-school role out of the legacy users columns.
- Added "active_school_id" field to "users" table and adjusted the app logic to use it
- RLS Policies: Rewrote SELECT/UPDATE/DELETE policies (for subjects, grades, rules, schools, user_schools) to use a JOIN-based predicate that compares users.auth_id = auth.uid().
- Types & Services: Updated db.ts and refactored db-service.ts (getCurrentUser, getUserSchools, getTeachers, updateUserActiveSchool).
  - `getCurrentUser` now returns user info, the school he belongs to and his active school ID
- UI Updates: Redesigned the choose-school experience; Improved the school selection component in sidebar navigation.
