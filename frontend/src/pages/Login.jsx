
//this page displays the login form

import { Link, useNavigate } from "react-router-dom";
import LoginForm from "../components/LoginForm";
import { apiRequest } from "../services/api";

export default function Login({ onLogin }) {
  //onLogin comes from App.jsx and saves the user's login details
  const navigate = useNavigate();

  //this function receives the email and password from LoginForm
  async function handleLogin(credentials) {
    //sends the login details to the backend
    const data = await apiRequest("/api/Auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });

    //gets a display name from the email address
    const userName = data.email.split("@")[0];

    //saves the token and username in the main App component
    onLogin(data.token, userName);

    //takes the user to their courses after successful login
    navigate("/courses");
  }

  return (
    <main
      id="main-content"
      tabIndex={-1} /*allows the skip link in the navbar to move focus to this page*/
    >
      {/*keeps the login page narrow and centered*/}
      <div className="auth-wrap">
        <header className="page-header">
          <span className="eyebrow">Welcome back</span>
          <h1>Log in to CourseTrack</h1>
          <p className="page-subtitle">
            Pick up where you left off with your courses and study sessions.
          </p>
        </header>

        {/*displays the login form and passes it the login function*/}
        <LoginForm onLogin={handleLogin} />

        {/*provides a link for users who do not have an account yet*/}
        <p className="auth-switch">
          New to CourseTrack? <Link to="/register">Create an account</Link>
        </p>
      </div>
    </main>
  );
}
