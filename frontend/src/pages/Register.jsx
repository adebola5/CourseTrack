
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import RegisterForm from "../components/RegisterForm";
import { apiRequest } from "../services/api";

export default function Register() {
  const navigate = useNavigate();

  //tracks whether the account was created successfully
  const [accountCreated, setAccountCreated] = useState(false);

  //sends the registration details to the backend
  async function handleRegister(newUser) {
    await apiRequest("/api/Auth/register", {
      method: "POST",
      body: JSON.stringify(newUser),
    });

    //shows the confirmation only after successful registration
    setAccountCreated(true);
  }

  //takes the user to login after they acknowledge the message
  function handleContinueToLogin() {
    navigate("/login");
  }

  return (
    <main id="main-content" tabIndex={-1}>
      <div className="auth-wrap auth-wrap-wide">
        <header className="page-header">
          <span className="eyebrow">Get started</span>
          <h1>Create your account</h1>
          <p className="page-subtitle">
            Sign up to keep track of your courses, milestones and study sessions.
          </p>
        </header>

        <RegisterForm onRegister={handleRegister} />

        <p className="auth-switch">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>

      {/*shows a confirmation after the backend creates the account*/}
      {accountCreated && (
        <div
          className="modal-overlay" /*CHANGED: the inline styles were moved into App.css so the pop up follows the theme (dark and light)*/
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="account-created-title"
          aria-describedby="account-created-message"
        >
          <div className="modal-card modal-success"> {/*modal-success gives it the green success colours*/}
            <h2 id="account-created-title">
              ✓ Account created successfully!
            </h2>

            <p id="account-created-message">
              Your CourseTrack account has been created.
              Please log in with your registered email address and password
              to verify that your account has been created successfully.
            </p>

            <button
              className="btn btn-primary btn-lg"
              type="button"
              onClick={handleContinueToLogin}
            >
              Continue to Login
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
