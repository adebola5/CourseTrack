
//navigation bar
import { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import Logo from './Logo'; //NEW: the CourseTrack logo

export default function Navbar({ isLoggedIn, userName, onLogout }) {

  //stores the selected colour theme, using the saved setting or light mode by default
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");

  //stores whether the user has selected larger text
  const [largeText, setLargeText] = useState(() => localStorage.getItem("largeText") === "true");

  //updates the whole application whenever the colour theme changes
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("theme", theme);
  }, [theme]);

  //updates the text size whenever the user changes this setting
  useEffect(() => {
    if (largeText) {
      //makes the application text larger
      document.documentElement.dataset.text = "large";
    } else {
      //removes the larger text setting
      delete document.documentElement.dataset.text;
    }

    //saves the selected text size
    localStorage.setItem("largeText", largeText);
  }, [largeText]);

  //displays the navigation links and display settings
  return (
    <>
      {/*allows keyboard users to skip the navigation and go directly to the page content*/}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      {/*contains the main navigation links*/}
      <nav aria-label="Main navigation">

        {/*takes logged-in users home and logged-out users to the login page*/}
        <h2>
          {/*CHANGED: the link now has the logo next to the name. brand is the class that lines them up, and "Track" is light blue (both are in App.css)*/}
          <Link to={isLoggedIn ? "/" : "/login"} className="brand">
            <Logo />
            <span>Course<span className="brand-accent">Track</span></span>
          </Link>
        </h2>

        <div className="nav-right">

          {/*contains the links displayed in the navigation bar*/}
          <div className="nav-links">

            {/*shows different links depending on the login status*/}
            {isLoggedIn ? (
              <>
                <NavLink to="/" end>Home</NavLink>
                <NavLink to="/courses">My Courses</NavLink>
                <NavLink to="/add-course">Add Course</NavLink>
                <NavLink to="/study-planner">Plan a study session</NavLink>
                <NavLink to="/ai-assistant">AI Assistant</NavLink>
              </>
            ) : (
              <>
                <NavLink to="/login">Login</NavLink>
                <NavLink to="/register">Register</NavLink>
              </>
            )}

          </div>

          {/*groups the display settings buttons together*/}
          <div className="nav-tools" role="group" aria-label="Display settings">

            {/*changes the text size between normal and larger*/}
            <button
              type="button"
              className="tool-btn"
              aria-pressed={largeText}
              onClick={() => setLargeText(!largeText)}
            >
              Larger text
            </button>

            {/*switches between light and dark mode*/}
            <button
              type="button"
              className="tool-btn"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {/*shows the theme the user can switch to*/}
              {theme === "dark" ? "Light mode" : "Dark mode"}
            </button>

          </div>

          {/*shows the account information and logout button only when logged in*/}
          {isLoggedIn && (
            <div className="nav-account" role="group" aria-label="Account">

              {/*displays the username when one is available*/}
              {userName && (
                <span className="nav-user" title={userName}>
                  Signed in as <strong>{userName}</strong>
                </span>
              )}

              {/*calls the logout function passed from App.jsx*/}
              <button
                type="button"
                className="tool-btn"
                onClick={onLogout}
              >
                Log out
              </button>

            </div>
          )}

        </div>
      </nav>
    </>
  );
}
