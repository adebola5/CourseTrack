
//this component holds the registration form. Register.jsx decides what happens once the form is submitted

import { useState } from "react";

export default function RegisterForm({ onRegister }) {

  //stores the email entered by the user
  const [email, setEmail] = useState("");

  //stores the password entered by the user
  const [password, setPassword] = useState("");

  //stores the password entered again for confirmation
  const [confirmPassword, setConfirmPassword] = useState("");

  //controls whether the passwords are visible or hidden
  const [showPassword, setShowPassword] = useState(false);

  //stores validation errors for individual fields
  const [errors, setErrors] = useState({});

  //stores general errors, such as an email address that is already registered
  const [formError, setFormError] = useState("");

  //tracks whether the registration form is being submitted
  const [submitting, setSubmitting] = useState(false);

  //checks the entered details and returns any validation errors

  function validate() {
    const newErrors = {};

    //checks whether the email field is empty
    if (!email.trim()) {
      newErrors.email = "Please enter your email address.";
    } else if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      newErrors.email = "Please enter a valid email address.";
    }

    //checks whether the password has at least 8 characters
    if (password.length < 8) {
      newErrors.password = "Your password must be at least 8 characters.";
    }

    //checks whether the password contains an uppercase letter
    else if (!/[A-Z]/.test(password)) {
      newErrors.password = "Your password must contain at least one uppercase letter.";
    }

    //checks whether the password contains a special character
    else if (!/[^a-zA-Z0-9]/.test(password)) {
      newErrors.password = "Your password must contain at least one special character, such as @ or !.";
    }

    //checks whether both password entries match
    if (confirmPassword !== password) {
      newErrors.confirmPassword = "The passwords do not match.";
    }

    return newErrors;
  }


  //runs when the user submits the registration form
  async function handleSubmit(e) {

    //prevents the browser from refreshing the page
    e.preventDefault();

    //checks the entered details
    const newErrors = validate();

    //updates the field errors
    setErrors(newErrors);

    //clears any previous general error
    setFormError("");

    //stops registration if validation errors were found
    if (Object.keys(newErrors).length > 0) {
      return;
    }

    //shows that the registration request is running
    setSubmitting(true);

    try {

      //sends the email and password to the registration function in Register.jsx
      //confirmPassword is not sent because it is only used for frontend validation
      await onRegister({
        email: email.trim(),
        password: password
      });

      //clears the form after successful registration
      setEmail("");
      setPassword("");
      setConfirmPassword("");

    } catch (error) {

      //displays an error returned by the registration function or backend
      //NEW: connection errors and expired sessions are already shown as a pop up by App.jsx, so the message is not repeated here
      if (error.handled) return;

      setFormError(error.message);

    } finally {

      //allows the submit button to be used again
      setSubmitting(false);
    }
  }

  return (
    //noValidate disables the browser's default validation messages
    <form className="auth-card" onSubmit={handleSubmit} noValidate>

      <div className="form-header">
        <h2>Create your account</h2>
        <p>Fields marked with <span className="req">*</span> are required.</p>
      </div>

      {/*section 1 contains the user's email address*/}
      <section className="form-section">

        <h3 className="section-title">
          <span className="step">1</span>
          Your details
        </h3>

        {/*displays general registration errors*/}
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

        </div>
      </section>

      {/*section 2 contains the password and password confirmation fields*/}
      <section className="form-section">

        <h3 className="section-title">
          <span className="step">2</span>
          Create a password
        </h3>

        <div className="form-grid">

          {/*password input field*/}
          <label className="field">

            <span className="field-label">
              Password<span className="req">*</span>
            </span>

            {/*keeps the show/hide button inside the password input area*/}
            <div className="password-wrap">

              <input
                type={showPassword ? "text" : "password"}
                value={password}
                autoComplete="new-password"
                aria-required="true"
                aria-invalid={errors.password ? "true" : "false"}

                //updates the password state whenever the user types
                onChange={(e) => setPassword(e.target.value)}
              />

              {/*switches between showing and hiding the password*/}
              <button
                type="button"
                className="password-toggle"
                aria-pressed={showPassword}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>

            </div>

            {/*shows the password error or the password length requirement*/}
            {errors.password ? (
              <span className="field-error" role="alert">
                {errors.password}
              </span>
            ) : (
              <span className="field-hint">
                Use at least 8 characters.
              </span>
            )}

          </label>

          {/*password confirmation field*/}
          <label className="field">

            <span className="field-label">
              Confirm password<span className="req">*</span>
            </span>

            <input
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              autoComplete="new-password"
              aria-required="true"
              aria-invalid={errors.confirmPassword ? "true" : "false"}

              //updates the confirmation password whenever the user types
              onChange={(e) => setConfirmPassword(e.target.value)}
            />

            {/*displays an error if the two passwords do not match*/}
            {errors.confirmPassword && (
              <span className="field-error" role="alert">
                {errors.confirmPassword}
              </span>
            )}

          </label>

        </div>
      </section>

      {/*contains the registration button*/}
      <div className="form-actions">

        <button
          className="btn btn-primary btn-lg auth-submit"
          type="submit"
          disabled={submitting}
        >
          {/*changes the button text while the registration request is running*/}
          {submitting ? "Creating account..." : "Create account"}
        </button>

      </div>
    </form>
  );
}
