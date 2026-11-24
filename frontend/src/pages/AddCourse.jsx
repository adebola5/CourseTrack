//this page displays the form to add new courses
import AddCourseForm from "../components/AddCourseForm";
import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom"; //NEW: for the link back to the courses page

export default function AddCourse({ onAddCourse }) {

  //declare the variables that hold the course added confirmation for the pop up
  const [showSuccess, setShowSuccess] = useState(false);//Controls whether the notification is visible.
  const timeoutRef = useRef(null);

  //this function handles what happens when a course is added successfully
//waits for the backend to save the course before showing success
async function handleAddCourse(newCourse) {
  await onAddCourse(newCourse);

  setShowSuccess(true);

  clearTimeout(timeoutRef.current);

  timeoutRef.current = setTimeout(() => {
    setShowSuccess(false);
  }, 3000);
}

  useEffect(() => {
    return () => clearTimeout(timeoutRef.current);
  }, []);

  return (
    <main
      id="main-content"
      tabIndex={
        -1
      } /*NEW: id is what the skip link in the navbar jumps to, tabIndex -1 lets it receive focus when that happens*/
    >
      {showSuccess && (
        <div className="success-notification" role="status">
          <span>✓</span>
          Course added successfully!
        </div>
      )}
      {/*CHANGED: the plain h2 was replaced with a page header so it matches the other pages*/}
      <header className="page-header">
        {/*NEW: link back to the courses page*/}
        <Link to="/courses" className="text-link back-link">&larr; Back to my courses</Link>
        <br />
        <span className="eyebrow">New entry</span>
        <h1>Add a new course</h1>
        <p className="page-subtitle">
          Fill in the details below and it will appear on your dashboard
          straight away.
        </p>
      </header>

      {/*NEW: form-layout puts the form on the left and the tips panel on the right (on small screens they stack)*/}
      <div className="form-layout">
        {/*calls the component that has the form*/}
        <AddCourseForm onAddCourse={handleAddCourse} />

        {/*NEW: side panel that explains how each status behaves. its only text, nothing here changes how the form works*/}
        <aside className="panel tips-panel">
          <h2 className="panel-title">How status works</h2>
          <p className="panel-hint">Progress follows the status you pick.</p>
          <ul className="tips-list">
            <li className="tip-progress">
              <strong>In Progress</strong>You choose the progress from 0 to 100.
            </li>
            <li className="tip-completed">
              <strong>Completed</strong>Progress is set to 100% for you.
            </li>
            <li className="tip-planned">
              <strong>Planned</strong>Not started yet, so progress stays locked.
            </li>
          </ul>
        </aside>
      </div>
    </main>
  );
}
