//This page displays the course statistics
import { Link } from "react-router-dom";
export default function HomePage({ courses }) {

    //Statistics section
    const totalCourses = courses.length; //gets total length of all courses
    //calculates the length of all courses in each status
    const completedCourses = courses.filter(
        (course) => course.status === "Completed"
    ).length

    const inProgressCourses = courses.filter(
        (course) => course.status === "In Progress"
    ).length

    const plannedCourses = courses.filter(
        (course) => course.status === "Planned"
    ).length

    //NEW: works out the average progress of all the courses so we can show it in one bar
    //reduce adds up the progress of every course, then we divide by the number of courses
    //if there are no courses, we set it to 0 so we dont divide by zero
    const overallProgress = totalCourses > 0
        ? Math.round(courses.reduce((sum, course) => sum + course.progress, 0) / totalCourses)
        : 0;

    return (
        <main id="main-content" tabIndex={-1} /*NEW: id is what the skip link in the navbar jumps to, tabIndex -1 lets it receive focus when that happens*/>
            {/*NEW: page header. the eyebrow is the small text above the title, the subtitle is the short line under it. all styled in App.css*/}
            <header className="page-header">
                <span className="eyebrow">Overview</span>
                <h1>My Learning Dashboard</h1>
                <p className="page-subtitle">Everything you are learning, finishing and planning, at a glance.</p>

                {/*NEW: quick links to the other pages. Link works like an <a> tag but moves to the page without reloading the app*/}
                <div className="quick-links">
                    <Link to="/courses" className="btn btn-primary">View my courses</Link>
                    <Link to="/add-course" className="btn btn-ghost">Add a course</Link>
                    <Link to="/study-planner" className="btn btn-ghost">Plan a study session</Link>
                </div>
            </header>

            {/*CHANGED: each stat box now has the class stat-card, this is what gives it the border and shadow in the css.
            the second class (stat-total, stat-completed...) is what gives each box its own colour*/}
            <div className="dashboard-stats">
                <div className="stat-card stat-total">
                    <h3>Total Courses</h3>
                    <p>{totalCourses}</p>
                </div>

                <div className="stat-card stat-completed">
                    <h3>Completed</h3>
                    <p>{completedCourses}</p>
                </div>

                <div className="stat-card stat-progress">
                    <h3>In Progress</h3>
                    <p>{inProgressCourses}</p>
                </div>

                <div className="stat-card stat-planned">
                    <h3>Planned</h3>
                    <p>{plannedCourses}</p>
                </div>
            </div>

            {/*NEW: panel that shows the overall progress using the overallProgress value we calculated above*/}
            <section className="panel overview">{/*this page represents the full cprogress bar, and the average progress*/}
                <h2 className="panel-title">Overall progress</h2>
                <p className="panel-hint">Average progress across all of your courses</p>
                <div className="progress-row">
                    <span>Completion</span>
                    <strong>{overallProgress}%</strong>
                </div>
                {/*NEW: aria-label tells screen readers what this bar is for, since a bar has no text of its own*/}
                {/*this represent the graph*/}
                <progress value={overallProgress} max={100} aria-label="Overall progress"></progress>
            </section>
        </main>
    )
}
