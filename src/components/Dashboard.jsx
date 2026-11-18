//	Dashboard is the one displaying the course cards.
import CourseCard from "./CourseCard";
import { useState } from "react";

{
  /*courses and the onDeleteCourse are from the props that are passed in the App.jsx,not from the CourseCard,jsx */
}
export default function Dashboard({ courses, onDeleteCourse, onUpdateCourse }) {
  // instead of importing the data , since we will now be getting an updated array wharn a new course is added, we will add receive it as a prop instead
  //create states that hold what the user types to search and the filte option
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All"); //the filter option by default is set to display all the courses
  const [categoryFilter, setCategoryFilter] = useState("All"); //the filter for categories is set to all by default to display all categories

 
  //Statistics section
  const totalCourses = courses.length; //gets total length of all courses
  //calculates the length of all courses in each status
  const completedCourses = courses.filter(
    (course) => course.status === "Completed",
  ).length;

  const inProgressCourses = courses.filter(
    (course) => course.status === "In Progress",
  ).length;

  const plannedCourses = courses.filter(
    (course) => course.status === "Planned",
  ).length;

  //get all the available categories
  const categories = [
    "All",
    ...new Set(courses.map((course) => course.category)),
  ];

  // Filtering courses based on search and selected status
  const filteredCourses = courses.filter((course) => {
    //set the result of the search function to if the course title in lowercase matches the searched course also in lowercase
    const matchesSearch = course.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "All" || course.status === statusFilter;

    const matchesCategory =
      categoryFilter === "All" || course.category === categoryFilter;
    //combines the search, category and status together, for an input to be displayed, it has to meet the requirements of both the search and the filter
    return matchesSearch && matchesStatus && matchesCategory;
  });

  //NEW: the list of buttons (chips) for the status filter. this replaces the old status dropdown.
  //value is what we filter by, label is what the user sees, dot is the colour of the small dot and count is how many courses are in that status
  const statusOptions = [
    { value: "All", label: "All Courses", dot: "all", count: totalCourses },
    {
      value: "In Progress",
      label: "In Progress",
      dot: "in-progress",
      count: inProgressCourses,
    },
    {
      value: "Completed",
      label: "Completed",
      dot: "completed",
      count: completedCourses,
    },
    {
      value: "Planned",
      label: "Planned",
      dot: "planned",
      count: plannedCourses,
    },
  ];

  //NEW: puts the search and both filters back to what they are by default
  function clearFilters() {
    setSearchTerm("");
    setStatusFilter("All");
    setCategoryFilter("All");
  }

  //NEW: true if the user has searched or picked a filter, we use it to decide if the "Clear filters" link should show
  const filtersActive =
    searchTerm !== "" || statusFilter !== "All" || categoryFilter !== "All";

  return (
    <main
      id="main-content"
      tabIndex={
        -1
      } /*NEW: id is what the skip link in the navbar jumps to, tabIndex -1 lets it receive focus when that happens*/
    >
      {/*CHANGED: the heading is now a page header and says My Courses, since the Home page already uses My Learning Dashboard*/}
      <header className="page-header">
        <span className="eyebrow">Library</span>
        <h1>My Courses</h1>
        <p className="page-subtitle">
          Search, filter and manage everything you are learning.
        </p>
      </header>

      {/*CHANGED: same stat boxes as before, they just have the stat-card classes now so they get the colours and borders from App.css*/}
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

      {/*NEW: controls holds the two sections side by side, one for search and filter and one for categories*/}
      <div className="controls">
        {/* Search + status filter section */}
        <section className="panel panel-filters">
          <h2 className="panel-title">Search &amp; Filter</h2>
          <p className="panel-hint">
            Find a course by name or by where you are with it.
          </p>

          {/* Search - works the same as before, it just sits inside the section now */}
          <label className="search-field">
            <input
              type="text"
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </label>

          {/*CHANGED: the status dropdown was replaced with buttons. clicking one does setStatusFilter, which is what the dropdown's onChange did before*/}
          <span className="group-label">Status</span>
          <div className="chip-group">
            {statusOptions.map(
              (
                option, //one button for each status in the statusOptions list above
              ) => (
                <button
                  key={option.value}
                  type="button" //type button so it doesnt try to submit anything
                  className={`chip ${statusFilter === option.value ? "active" : ""}`} //the chip that matches the current filter gets the class active so it looks selected
                  aria-pressed={
                    statusFilter === option.value
                  } /*NEW: tells screen readers if this chip is currently selected*/
                  onClick={() => setStatusFilter(option.value)}
                >
                  {/*CHANGED: the coloured dot and the count were removed from the status chips to make them cleaner, the totals are already shown in the stats at the top*/}
                  {option.label}
                </button>
              ),
            )}
          </div>
        </section>

        {/* Categories section - its own section now instead of sitting next to the search */}
        <section className="panel panel-categories">
          <h2 className="panel-title">Categories</h2>
          <p className="panel-hint">Narrow the list down to one subject.</p>

          {/*CHANGED: the category dropdown was replaced with buttons too, it still uses the categories list from above and setCategoryFilter*/}
          <div className="chip-group">
            {categories.map(
              (
                category, //use .map to display the categories
              ) => (
                <button
                  key={category}
                  type="button"
                  className={`chip ${categoryFilter === category ? "active" : ""}`}
                  aria-pressed={
                    categoryFilter === category
                  } /*NEW: same as the status chips*/
                  onClick={() => setCategoryFilter(category)}
                >
                  {category === "All" ? "All categories" : category}
                  {/*NEW: shows how many courses are in each category. for All its the total, for the others we filter the courses by that category and count them*/}
                  <span className="chip-count">
                    {category === "All"
                      ? totalCourses //to count the amount of courses in each category, if category ="all", then display the toatlCourses variable, if not display the
                      : courses.filter((course) => course.category === category)
                          .length}
                    {/*if its not all, then use the .filter to calculate the .length of the courses*/}
                  </span>
                </button>
              ),
            )}
          </div>
        </section>
      </div>

      {/*NEW: shows how many courses are being displayed out of the total. the Clear filters button only shows when filtersActive is true*/}
      <div className="results-bar">
        <span
          role="status"
          aria-live="polite" /*NEW: screen readers announce this line when the numbers change after searching or filtering*/
        >
          Showing <strong>{filteredCourses.length}</strong> of{" "}
          <strong>{totalCourses}</strong> courses
        </span>
        {filtersActive && (
          <button type="button" className="btn-link" onClick={clearFilters}>
            Clear filters
          </button>
        )}
      </div>

      {/* Course list */}
      <div className="course-list">
        {filteredCourses.length > 0 ? ( //if the length of the filtered courses is greater than 0 then display the course list
          filteredCourses.map((course) => (
            <div key={course.id}>
              <CourseCard /*calls the courseCard component and passes the id since its required there*/
                course={course}
                onDeleteCourse={onDeleteCourse}
                onUpdateCourse={onUpdateCourse}
              />
            </div>
          ))
        ) : (
          //else if there are no courses that match the filter conditions, then display no courses found
          //CHANGED: the message has a class now so it gets a dashed box in the css
          <p className="empty-state">No courses found.</p>
        )}
      </div>
    </main>
  );
}
