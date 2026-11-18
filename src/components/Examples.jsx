
import { useState } from "react";
import CourseCard from "./CourseCard";

export default function Dashboard({
    courses,
    onDeleteCourse,
    onUpdateCourse
}) {
    //create states that hold what the user types to search and the filte option
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");//the filter option by default is set to display all the courses
    const [categoryFilter, setCategoryFilter] = useState("All");//the filter for categories is set to all by default to display all categories

    // Filtering courses based on search and selected status
    const filteredCourses = courses.filter((course) => {
        //set the result of the search function to if the course title in lowercase matches the searched course also in lowercase
        const matchesSearch = course.title
            .toLowerCase()
            .includes(searchTerm.toLowerCase());

        const matchesStatus =
            statusFilter === "All" || course.status === statusFilter;

        const matchesCategory = 
            categoryFilter ==="All" || course.category === categoryFilter;
        return matchesSearch && matchesStatus && matchesCategory;
    });

    return (
        <main>
            <h1>My Learning Dashboard</h1>

            {/* Search */}
            <input
                type="text"
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />

            {/* Status filter */}
            <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
            >
                <option value="All">All Courses</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Planned">Planned</option>
            </select>

            {/* Status filter */}
            <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
            >
                <option value="All">All categories</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Planned">Planned</option>
            </select>

            {/* Course list */}
            <div className="course-list">
                {filteredCourses.length > 0 ? (//if the length of the filtered courses is greater than 0 then display the course list 
                    filteredCourses.map((course) => (
                        <div key={course.id}>
                            <CourseCard /*calls the courseCard component and passes the id since its required there*/
                                id={course.id}
                                title={course.title}
                                category={course.category}
                                status={course.status}
                                progress={course.progress}
                                onDeleteCourse={onDeleteCourse}
                                onUpdateCourse={onUpdateCourse}
                            />
                        </div>
                    ))
                ) : (//else if there are no courses that match the filter conditions, then display no courses found
                    <p>No courses found.</p>
                )}
            </div>
        </main>
    );
}
