"School schedule maker" is a web application that makes it easy for teachers and school staff to generate new schedules with just a few clicks.

## Motivation

As a teacher, I have to create a new schedule every year for my school. This is very difficult for a few reasons:

- It's done by hand.
- I have to fulfill every teacher's wishes and also follow general school guidelines when it comes to classes.
- The schedule often changes (sometimes on weekly basis) because teachers have emergencies and can't make it to class.

I want this application to help me create a new schedule on a daily basis (if needed).
Every generated schedule should fulfill all HARD requirements, and try to fulfill SOFT requirements as well.

## Pages

1. Schedule page
   - clearly shows the current schedule in a table
   - the table has following columns: #, teacher, class, 1-8 grouped columns for Monday, 1-8 grouped columns for Tuesday... 1-8 grouped columns for Friday
   - cells contain the grade name
   - has an button to generate a new schedule based on the current rules
   - button is disabled under certain conditions (if there is unsufficient data in the db)
2. Grades page
   - displays a table of grades
   - has an option to add, edit or delete a grade
3. Teachers page
   - displays a table of teachers
   - has an option to add, edit or delete a teacher
4. Subjects page
   - displays a table of subjects
   - has an option to add, edit or delete a subject
5. Rules page
   - displays a table of rules
   - has an option to add, edit or delete a rule

## The application flow

1. Teacher signs in.
2. Takes a look at the current schedule.
3. Adds a new rule or edits an existing one.
4. Generates a new schedule.
5. Downloads, prints or exports the schedule.

## Logic

When system is generating a schedule, it needs to follow rules. There are hard rules (which have to be followed without exceptions) and soft rules (which should followed if possible).
