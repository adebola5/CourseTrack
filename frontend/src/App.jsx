
import Navbar from './components/Navbar'
import { Link, Route, Routes } from 'react-router-dom'
import { useState, useEffect } from 'react'
import HomePage from './pages/Home'
import Courses from './pages/Courses'
import AddCourse from './pages/AddCourse'
import StudyPlanner from './pages/StudyPlanner'
import Login from './pages/Login'
import Register from './pages/Register'
import AiAssistant from './pages/AiAssistant'
import ProtectedRoute from './components/ProtectedRoute'
import {
  apiRequest,
  API_EVENT,
  CONNECTION_ERROR_TITLE,
  CONNECTION_ERROR_MESSAGE,
  SESSION_EXPIRED_MESSAGE,
} from './services/api'
import './App.css'

function App() {
  //stores the courses belonging to the logged-in user
  const [courses, setCourses] = useState([]);

  //stores all study sessions belonging to the logged-in user
  const [studySessions, setStudySessions] = useState([]);

  //tracks whether courses and their related data are being loaded
  const [coursesLoading, setCoursesLoading] = useState(false);

  //stores an error if the courses or study sessions cannot be loaded
  const [coursesError, setCoursesError] = useState("");

  //loads the saved login token when the application starts
  const [token, setToken] = useState(() => localStorage.getItem("token"));

  //checks whether a token exists to determine if the user is logged in
  const isLoggedIn = !!token;

  //loads the logged-in user's name from localStorage
  const [userName, setUserName] = useState(() => localStorage.getItem("userName") || "");

  //NEW: stores the pop up that is showing (connection error or session expired). null means no pop up
  //it looks like { type: "error", title: "...", message: "..." }
  const [notification, setNotification] = useState(null);

  //NEW: listens for the events api.js sends when the connection fails or the session expires
  useEffect(() => {
    function handleApiEvent(event) {
      //the server could not be reached, show the friendly error pop up
      if (event.detail.type === "connection-error") {
        setNotification({
          type: "error",
          title: CONNECTION_ERROR_TITLE,
          message: CONNECTION_ERROR_MESSAGE,
        });
      }

      //the login session has expired. api.js already removed the token from localStorage, here we clear the same details from state.
      //isLoggedIn then becomes false and ProtectedRoute sends the user to the login page by itself
      if (event.detail.type === "session-expired") {
        setCourses([]);
        setStudySessions([]);
        setToken(null);
        setUserName("");

        setNotification({
          type: "info",
          message: SESSION_EXPIRED_MESSAGE,
        });
      }
    }

    window.addEventListener(API_EVENT, handleApiEvent);

    //stops listening when App is removed
    return () => window.removeEventListener(API_EVENT, handleApiEvent);
  }, []);

  //loads the logged-in user's courses and study sessions whenever the token changes
  useEffect(() => {
    let isCurrentRequest = true;

    async function loadCourses() {
      //if nobody is logged in, clear the user's data
      if (!token) {
        setCourses([]);
        setStudySessions([]);
        setCoursesError("");
        setCoursesLoading(false);
        return;
      }

      setCoursesLoading(true);
      setCoursesError("");

      try {
        //gets all courses belonging to the logged-in user
        const data = await apiRequest("/api/Courses");

        //loads milestones, resources and study sessions for each course
        const loadedData = await Promise.all(
          data.map(async (course) => {
            //retrieves all three types of related data at the same time
            const [milestones, resources, sessions] = await Promise.all([
              apiRequest(`/api/courses/${course.id}/milestones`),
              apiRequest(`/api/courses/${course.id}/resources`),
              apiRequest(`/api/courses/${course.id}/study-sessions`),
            ]);

            //returns the course with its saved milestones and resources
            return {
              course: {
                ...course,
                milestones,
                resources,
              },
              sessions,
            };
          })
        );

        if (isCurrentRequest) {
          //separates the courses from the study sessions
          const loadedCourses = loadedData.map((item) => item.course);

          //combines all study sessions from the different courses into one array
          const loadedSessions = loadedData.flatMap((item) => item.sessions);

          //updates the application with the retrieved data
          setCourses(loadedCourses);
          setStudySessions(loadedSessions);
        }
      } catch (error) {
        if (isCurrentRequest) {
          setCourses([]);
          setStudySessions([]);
          //CHANGED: connection errors and expired sessions are already shown as a pop up, so only other errors are shown here
          setCoursesError(error.handled ? "" : error.message);
        }
      } finally {
        if (isCurrentRequest) {
          setCoursesLoading(false);
        }
      }
    }

    loadCourses();

    //prevents an old request from updating the state after the user changes
    return () => {
      isCurrentRequest = false;
    };
  }, [token]);

  //adds a new course through the backend API
  async function handleAddCourse(newCourse) {
    const createdCourse = await apiRequest("/api/Courses", {
      method: "POST",
      body: JSON.stringify({
        title: newCourse.title,
        category: newCourse.category,
        status: newCourse.status,
        progress: newCourse.progress,
      }),
    });

    //uses the ID generated by the backend
    setCourses((prevCourses) => [
      ...prevCourses,
      {
        ...createdCourse,
        milestones: [],
        resources: [],
      },
    ]);
  }

  //deletes a course through the backend API
  async function handleDeleteCourse(courseId) {
    await apiRequest(`/api/Courses/${courseId}`, {
      method: "DELETE",
    });

    //removes the course and its sessions from the application state
    setCourses((prevCourses) =>
      prevCourses.filter((course) => course.id !== courseId)
    );

    setStudySessions((prevSessions) =>
      prevSessions.filter((session) => session.courseId !== courseId)
    );
  }

  //updates an existing course through the backend API
  async function handleUpdateCourse(updatedCourse) {
    const courseData = {
      title: updatedCourse.title,
      category: updatedCourse.category,
      status: updatedCourse.status,
      progress: updatedCourse.progress,
    };

    await apiRequest(`/api/Courses/${updatedCourse.id}`, {
      method: "PUT",
      body: JSON.stringify(courseData),
    });

    //updates the course while preserving its milestone and resource arrays
    setCourses((prevCourses) =>
      prevCourses.map((course) =>
        course.id === updatedCourse.id
          ? {
              ...course,
              ...courseData,
              milestones: updatedCourse.milestones ?? course.milestones,
              resources: updatedCourse.resources ?? course.resources,
            }
          : course
      )
    );
  }

  //saves the token and username after a successful login
  function handleLogin(newToken, newUserName) {
    //clears any previously displayed user's data
    setCourses([]);
    setStudySessions([]);

    localStorage.setItem("token", newToken);
    localStorage.setItem("userName", newUserName);

    setToken(newToken);
    setUserName(newUserName);

    //NEW: removes any pop up that is still showing, for example the session expired message
    setNotification(null);
  }

  //removes the login details when the user logs out
  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("userName");

    //clears the current user's data from the application state
    setCourses([]);
    setStudySessions([]);
    setToken(null);
    setUserName("");
    setNotification(null);
  }

  //adds a new study session through the backend API
  async function handleAddStudySession(newSession) {
    const createdSession = await apiRequest(
      `/api/courses/${newSession.courseId}/study-sessions`,
      {
        method: "POST",
        body: JSON.stringify({
          date: newSession.date,
          startTime: newSession.startTime,
          duration: newSession.duration,
          description: newSession.description,
        }),
      }
    );

    //adds the session returned by the backend, including its database ID
    setStudySessions((prevSessions) => [
      ...prevSessions,
      createdSession,
    ]);
  }

  //deletes a study session through the backend API
  async function handleDeleteStudySession(sessionId) {
    //finds the session so we can identify its course
    const session = studySessions.find(
      (item) => item.id === sessionId
    );

    if (!session) {
      throw new Error("Study session could not be found.");
    }

    await apiRequest(
      `/api/courses/${session.courseId}/study-sessions/${sessionId}`,
      {
        method: "DELETE",
      }
    );

    //removes the session from the screen after the API confirms deletion
    setStudySessions((prevSessions) =>
      prevSessions.filter((item) => item.id !== sessionId)
    );
  }

  //updates an existing study session through the backend API
  async function handleUpdateStudySession(updatedSession) {
    await apiRequest(
      `/api/courses/${updatedSession.courseId}/study-sessions/${updatedSession.id}`,
      {
        method: "PUT",
        body: JSON.stringify({
          date: updatedSession.date,
          startTime: updatedSession.startTime,
          duration: updatedSession.duration,
          description: updatedSession.description,
        }),
      }
    );

    //updates the session after the API confirms the change
    setStudySessions((prevSessions) =>
      prevSessions.map((session) =>
        session.id === updatedSession.id
          ? updatedSession
          : session
      )
    );
  }

  return (
    <div>
      {/*shows the navigation options based on whether the user is logged in*/}
      <Navbar
        isLoggedIn={isLoggedIn}
        userName={userName}
        onLogout={handleLogout}
      />

      {/*NEW: the pop up for connection errors and expired sessions. error uses the red style and info uses the blue style (both are in App.css).
      it stays until the user closes it with the x button, or logs in again*/}
      {notification && (
        <div
          className={notification.type === "error" ? "error-notification" : "info-notification"}
          role={notification.type === "error" ? "alert" : "status"}
        >
          <span aria-hidden="true">{notification.type === "error" ? "!" : "i"}</span>

          <div className="notification-text">
            {notification.title && <strong>{notification.title}</strong>}
            <p>{notification.message}</p>
          </div>

          <button
            type="button"
            className="notification-close"
            aria-label="Dismiss notification"
            onClick={() => setNotification(null)}
          >
            &times;
          </button>
        </div>
      )}

      {/*shows the loading message while courses and their data are retrieved*/}
      {isLoggedIn && coursesLoading && (
        <p role="status" className="app-status">Loading your courses...</p>
      )}

      {/*shows an error if the user's data cannot be retrieved (CHANGED: it now has a class so it is styled)*/}
      {isLoggedIn && coursesError && (
        <p role="alert" className="app-status app-status-error">{coursesError}</p>
      )}

      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute isLoggedIn={isLoggedIn}>
              <HomePage courses={courses} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/courses"
          element={
            <ProtectedRoute isLoggedIn={isLoggedIn}>
              <Courses
                courses={courses}
                onDeleteCourse={handleDeleteCourse}
                onUpdateCourse={handleUpdateCourse}
              />
            </ProtectedRoute>
          }
        />

        <Route
          path="/add-course"
          element={
            <ProtectedRoute isLoggedIn={isLoggedIn}>
              <AddCourse onAddCourse={handleAddCourse} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/study-planner"
          element={
            <ProtectedRoute isLoggedIn={isLoggedIn}>
              <StudyPlanner
                courses={courses}
                studySessions={studySessions}
                onAddSession={handleAddStudySession}
                onUpdateSession={handleUpdateStudySession}
                onDeleteSession={handleDeleteStudySession}
              />
            </ProtectedRoute>
          }
        />

        <Route
          path="/ai-assistant"
          element={
            <ProtectedRoute isLoggedIn={isLoggedIn}>
              <AiAssistant />
            </ProtectedRoute>
          }
        />

        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="*"
          element={
            <main id="main-content" tabIndex={-1}>
              <h1>404 Page not found</h1>
              <p>
                <Link to="/" className="text-link">
                  Go back home
                </Link>
              </p>
            </main>
          }
        />
      </Routes>
    </div>
  );
}

export default App;
