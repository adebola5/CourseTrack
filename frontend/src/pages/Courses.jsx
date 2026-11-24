//this page displays the dashboards and the search and filter functionalities
import { useState, useEffect, useRef } from "react";
import Dashboard from "../components/Dashboard";
export default function Courses({ courses, onDeleteCourse, onUpdateCourse }) {
    //NEW: holds the message for the delete pop up. when its empty the pop up is hidden (same idea as showSuccess in the add course page)
    const [deleteMessage, setDeleteMessage] = useState("");
    const timeoutRef = useRef(null);

    //NEW: shows the pop up with the message it is given, then hides it again after three seconds
    //the reason this lives here and not in the course card is because the card disappears when its course is deleted, and the pop up would disappear with it
    function showDeleteMessage(message) {
        setDeleteMessage(message);

        clearTimeout(timeoutRef.current); //if a pop up is already showing, restart the three seconds

        timeoutRef.current = setTimeout(() => {
            setDeleteMessage("");
        }, 3000);
    }

    useEffect(() => {
        return () => clearTimeout(timeoutRef.current);
    }, []);

//waits for the backend to delete the course before showing success
async function handleDeleteCourse(courseId) {
  await onDeleteCourse(courseId);
  showDeleteMessage("Course deleted successfully!");
}
    return (
        <>
            {/*NEW: the pop up, it uses the same success-notification style as the course added pop up*/}
            {deleteMessage && (
                <div className="info-notification" role="status"> {/*CHANGED: deletions are confirmations so they use the blue info style*/}
                    <span>✓</span>
                    {deleteMessage}
                </div>
            )}

            {/*CHANGED: the dashboard now gets handleDeleteCourse instead of onDeleteCourse, and showDeleteMessage so the cards can show the pop up when a milestone or resource is deleted*/}
            <Dashboard
                courses={courses}
                onDeleteCourse={handleDeleteCourse}
                onUpdateCourse={onUpdateCourse}
                onShowMessage={showDeleteMessage}
            />
        </>
    )
}