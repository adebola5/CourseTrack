//this page displays the dashboards and the search and filter functionalities
import Dashboard from "../components/Dashboard";
export default function Courses({ courses, onDeleteCourse, onUpdateCourse }) {
    return (
        <Dashboard
            courses={courses}
            onDeleteCourse={onDeleteCourse}
            onUpdateCourse={onUpdateCourse}
        />
    )
}