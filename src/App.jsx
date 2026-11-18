import courseData from './data/courses'
import Navbar from './components/Navbar'
import { Route, Routes } from 'react-router-dom'
import { useState, useEffect } from 'react'
import HomePage from './pages/Home'
import Courses from './pages/Courses'
import AddCourse from './pages/AddCourse'
import './App.css'

function App() {

  //instead of importing the array directly into dashboard, we ae storing them in react state
  const [courses, setCourses] = useState(() => {
    const savedCourses = localStorage.getItem("courses");

    return savedCourses ? JSON.parse(savedCourses) : courseData;//courseData represents the courses from the courses.js file
  });

  useEffect(() => {
    localStorage.setItem("courses", JSON.stringify(courses));
  }, [courses]);
  function handleAddCourse(newCourse) {
    //this function appends the existing course list with the new course and creates a new array list
    setCourses((prevCourses) => [...prevCourses, newCourse]);
  }

  function handleDeleteCourse(courseId) {
    setCourses((prevCourses) =>
      prevCourses.filter((course) => course.id !== courseId)
    );
  }

  //the function to update a course without deleting it 
  function handleUpdateCourse(updatedCourse) {
    setCourses((prevCourses) =>
      prevCourses.map((course) =>
        course.id === updatedCourse.id ? updatedCourse : course
      )
    );
  }

  return (
    <div>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage courses={courses} />} />
        <Route path="/courses" element={
          <Courses
            courses={courses}
            onDeleteCourse={handleDeleteCourse}
            onUpdateCourse={handleUpdateCourse}
          />} />

        <Route path="/add-course" element={
          <AddCourse 
          onAddCourse={handleAddCourse}
        />} />
        <Route path="*" element={<h1>404 Page not found</h1>} />
      </Routes>
      </div>

  )
}

export default App
