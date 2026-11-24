
//this component holds the login form. Login.jsx decides what happens once the form is submitted

import { useState } from "react";

export default function LoginForm({ onLogin }) {

  //stores the email entered by the user
  const [email, setEmail] = useState("");

  //stores the password entered by the user
  const [password, setPassword] = useState("");

  //controls whether the password is shown as normal text or hidden as dots
  const [showPassword, setShowPassword] = useState(false);

  //stores validation errors for individual fields
  const [errors, setErrors] = useState({});

  //stores general errors, such as incorrect login details
  const [formError, setFormError] = useState("");

  //tracks whether the form is currently being submitted
  const [submitting, setSubmitting] = useState(false);

  //checks the inputs and returns an object containing any validation errors
  function validate() {
    const newErrors = {};

    //checks whether the email field is empty
    if (!email.trim()) {
      newErrors.email = "Please enter your email address.";
    }

    //checks whether the password field is empty
    if (!password) {
      newErrors.password = "Please enter your password.";
    }

    return newErrors;
  }

  //runs when the user submits the login form
  async function handleSubmit(e) {

    //prevents the browser from refreshing the page
    e.preventDefault();

    //checks whether the entered details are valid
    const newErrors = validate();

    //updates the field errors
    setErrors(newErrors);

    //clears any previous general error
    setFormError("");

    //stops the form if validation errors were found
    if (Object.keys(newErrors).length > 0) {
      return;
    }

    //shows that the form is being submitted
    setSubmitting(true);

    try {
      //passes the email and password to the login function in Login.jsx
      await onLogin({
        email: email.trim(),
        password: password
      });

      //clears the fields after a successful login
      setEmail("");
      setPassword("");

    } catch (error) {

      //displays an error returned by the login function or backend
      //NEW: connection errors and expired sessions are already shown as a pop up by App.jsx, so the message is not repeated here
      if (error.handled) return;

      setFormError(error.message);

    } finally {

      //allows the submit button to be used again
      setSubmitting(false);
    }
  }

  return (
    //noValidate disables the browser's default validation messages because we display our own
    <form className="auth-card" onSubmit={handleSubmit} noValidate>

      <div className="form-header">
        <h2>Log in</h2>
        <p>Fields marked with <span className="req">*</span> are required.</p>
      </div>

      <section className="form-section">

        {/*displays general errors returned during login*/}
        {formError && (
          <p className="form-error" role="alert">
            {formError}
          </p>
        )}

        <div className="form-grid">

          {/*email input field*/}
          <label className="field field-full">

            <span className="field-label">
              Email address<span className="req">*</span>
            </span>

            <input
              type="email"
              value={email}
              autoComplete="email"
              placeholder="e.g. student@university.edu"
              aria-required="true"
              aria-invalid={errors.email ? "true" : "false"}

              //updates the email state whenever the user types
              onChange={(e) => setEmail(e.target.value)}
            />

            {/*displays the email validation error when one exists*/}
            {errors.email && (
              <span className="field-error" role="alert">
                {errors.email}
              </span>
            )}

          </label>

          {/*password input field*/}
          <label className="field field-full">

            <span className="field-label">
              Password<span className="req">*</span>
            </span>

            {/*keeps the show/hide button inside the password input area*/}
            <div className="password-wrap">

              <input
                type={showPassword ? "text" : "password"}
                value={password}
                autoComplete="current-password"
                aria-required="true"
                aria-invalid={errors.password ? "true" : "false"}

                //updates the password state whenever the user types
                onChange={(e) => setPassword(e.target.value)}
              />

              {/*switches the password between visible and hidden*/}
              <button
                type="button"
                className="password-toggle"
                aria-pressed={showPassword}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>

            </div>

            {/*displays the password validation error when one exists*/}
            {errors.password && (
              <span className="field-error" role="alert">
                {errors.password}
              </span>
            )}

          </label>

        </div>
      </section>

      {/*contains the form submission button*/}
      <div className="form-actions">

        <button
          className="btn btn-primary btn-lg auth-submit"
          type="submit"
          disabled={submitting}
        >
          {/*changes the button text while the login request is running*/}
          {submitting ? "Logging in..." : "Log in"}
        </button>

      </div>
    </form>
  );
}
