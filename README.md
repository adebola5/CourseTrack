# CourseTrack

**A React-based course management and learning progress tracking application.**

CourseTrack is a web application designed to help learners organise their courses, monitor their learning progress, and manage their educational activities in one place.

The application provides a central dashboard where users can add, manage, search, and filter courses while keeping track of their completion status and overall learning progress.

## Features

- **Course Management:** Add, edit, and delete courses.
- **Course Categories:** Organise courses by category.
- **Progress Tracking:** Assign and update course completion percentages.
- **Course Status:** Track courses as Planned, In Progress, or Completed.
- **Search:** Find courses using the search functionality.
- **Filtering:** Filter courses by category and completion status.
- **Dashboard:** View course statistics and overall learning progress.
- **Data Persistence:** Course information is saved in the browser using localStorage, so data remains available after refreshing the page.
- **Theme Customisation:** Switch between light and dark themes.
- **Accessibility:** Includes a large-text option for improved readability.
- **Responsive Design:** Designed to work across desktop, tablet, and mobile screen sizes.
- **Navigation:** Uses React Router to navigate between application pages.

## Technologies Used

- **React** – Building the user interface using reusable components.
- **JavaScript (ES6+)** – Application logic and functionality.
- **HTML5** – Application structure.
- **CSS3** – Styling, layouts, responsive design, and themes.
- **React Router** – Client-side navigation.
- **Vite** – Development environment and build tool.
- **localStorage** – Persisting course data and user interface preferences.
- **Git and GitHub** – Version control and source code hosting.

## Getting Started

Follow these instructions to run CourseTrack locally.

### Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org/)
- npm (included with Node.js)
- Git

### Installation

1. Clone the repository:

   ```bash
   git clone YOUR_REPOSITORY_URL
   ```

2. Navigate into the project directory:

   ```bash
   cd CourseTrack
   ```

3. Install the project dependencies:

   ```bash
   npm install
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

5. Open the local URL displayed in your terminal (usually `http://localhost:5173`) in your browser.

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Starts the development server. |
| `npm run build` | Builds the application for production. |
| `npm run preview` | Previews the production build locally. |
| `npm run lint` | Runs ESLint to check for code quality issues. |

## Project Structure

```text
CourseTrack/
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── AddCourseForm.jsx
│   │   ├── CourseCard.jsx
│   │   ├── Dashboard.jsx
│   │   └── Navbar.jsx
│   ├── pages/
│   │   ├── AddCourse.jsx
│   │   └── Home.jsx
│   ├── App.jsx
│   ├── App.css
│   ├── index.css
│   └── main.jsx
├── .gitignore
├── eslint.config.js
├── index.html
├── package.json
├── package-lock.json
└── vite.config.js
```

## Data Storage

CourseTrack currently uses the browser's localStorage to save course information and selected interface preferences.

This allows users to retain their courses and preferences when they refresh the application. Data is stored locally in the browser rather than in a remote database.

## Future Improvements

Planned enhancements include:

- Learning goals and course completion deadlines.
- Study session tracking and study-time records.
- Learning analytics and insights into study habits.

## Project Status

**Frontend development:** Active

CourseTrack is an ongoing learning and development project. Additional functionality and improvements will be introduced as development continues.

---

**Built with React and JavaScript.**
