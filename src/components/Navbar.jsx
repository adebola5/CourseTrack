//Navigation bar
import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
export default function Navbar(){
    //NEW: two states for the display settings. they start from what was saved in the browser (localStorage), if nothing was saved the theme is dark and the text is normal size
    const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");
    //this is for the text, if the larger text is choosen then set it
    const [largeText, setLargeText] = useState(() => localStorage.getItem("largeText") === "true");

    //NEW: whenever the theme changes, put it on the <html> tag as data-theme (the css reads this to switch the colours) and save it
   //the useEffect is triggered by a change in the theme, light or dark mode
    useEffect(() => {
        document.documentElement.dataset.theme = theme;
        localStorage.setItem("theme", theme);
    }, [theme]);

    //NEW: same idea for the text size. data-text="large" makes the whole app's text bigger, removing it puts it back to normal
    useEffect(() => {
        if (largeText) {
          //if the user selected larger text, then make all the texts large
            document.documentElement.dataset.text = "large";
        } else {
          //if its not choosen, then
            delete document.documentElement.dataset.text;
        }
        localStorage.setItem("largeText", largeText);//set the text largeText to the largeText object
    }, [largeText]);

    //the navbar component represents the navigation links and basically the headers of the pages, along with the links
     return (
    <>
      {/*NEW: skip link. its hidden until someone presses Tab, then they can jump straight to the page content instead of tabbing through the whole navbar. it points to the id="main-content" on each page*/}
      <a href="#main-content" className="skip-link">Skip to main content</a>

      <nav aria-label="Main navigation"> {/*nav is necessary to indicate that is navigation links. aria-label tells screen readers what this nav is*/}
        <h2>CourseTrack</h2>{/*this will show up everytime with the navigation links*/}

        <div className="nav-right">
          <div className="nav-links">
            <NavLink to="/" end>Home</NavLink>
            <NavLink to="/courses">My Courses</NavLink>
            <NavLink to="/add-course">Add Course</NavLink>
          </div>

          {/*NEW: the display settings buttons. aria-pressed tells screen readers if the button is switched on or off*/}
          {/*the buttons for the color mode and the large text option*/}
          <div className="nav-tools" role="group" aria-label="Display settings">
            <button
              type="button"
              className="tool-btn"
              aria-pressed={largeText}
              //once clicked set it to the opposite of the current largeText value
              onClick={() => setLargeText(!largeText)} //flips between true and false each time its clicked
            >
              Larger text
            </button>

            {/*the button shows the mode you will switch to, not the one you are in*/}
            <button
              type="button"
              className="tool-btn"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {/*if the theme is dark, display a text saying light mode*/}
              {theme === "dark" ? "Light mode" : "Dark mode"}
            </button>
          </div>
        </div>
      </nav>
    </>
  );
}
