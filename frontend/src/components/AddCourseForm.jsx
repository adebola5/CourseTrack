
import { useState } from "react";

export default function AddCourseForm({ onAddCourse }) {
  //stores the values entered into the course form
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("Planned");
  const [progress, setProgress] = useState(0);

  //stores validation errors for individual fields
  const [errors, setErrors] = useState({});

  //stores an error if the course cannot be saved
  const [submitError, setSubmitError] = useState("");

  //tracks whether the course is being saved
  const [submitting, setSubmitting] = useState(false);

  function handleChange(e) {
    const selectedStatus = e.target.value;
    setStatus(selectedStatus);

    if (selectedStatus === "Completed") {
      setProgress(100);
    } else {
      setProgress(0);
    }
  }

  //submits the new course to the backend
  async function handleSubmit(e) {
    e.preventDefault();

    //checks each required field separately
    const newErrors = {};

    if (!title.trim()) {
      newErrors.title = "Please enter a course name.";
    }

    if (!category.trim()) {
      newErrors.category = "Please enter a course category.";
    }

    setErrors(newErrors);
    setSubmitError("");

    //stops the form if any required fields are missing
    if (Object.keys(newErrors).length > 0) {
      return;
    }

    //creates the course data without an ID because the backend generates it
    const newCourse = {
      title: title.trim(),
      category: category.trim(),
      status,
      progress,
    };

    try {
      setSubmitting(true);

      //waits for the API request to finish before clearing the form
      await onAddCourse(newCourse);

      setTitle("");
      setCategory("");
      setStatus("Planned");
      setProgress(0);
      setErrors({});
    } catch (error) {
      //NEW: connection errors and expired sessions are already shown as a pop up by App.jsx, so the message is not repeated here
      if (error.handled) return;

      setSubmitError(error.message || "Could not save the course.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="course-form" onSubmit={handleSubmit} noValidate>
      <div className="form-header">
        <h2>Course details</h2>
        <p>Fields marked with <span className="req">*</span> are required.</p>
      </div>

      {submitError && (
        <p className="form-error" role="alert">
          {submitError}
        </p>
      )}

      <section className="form-section">
        <h3 className="section-title">
          <span className="step">1</span>About the course
        </h3>

        <div className="form-grid">
          <label className="field field-full">
            <span className="field-label">
              Course title<span className="req">*</span>
            </span>
            <input
              value={title}
              aria-required="true"
              aria-invalid={errors.title ? "true" : "false"}
              onChange={(e) => {
                setTitle(e.target.value);
                setErrors((previous) => ({ ...previous, title: "" }));
              }}
              placeholder="e.g. Data Structures"
            />
            {errors.title && (
              <span className="field-error" role="alert">
                {errors.title}
              </span>
            )}
          </label>

          <label className="field field-full">
            <span className="field-label">
              Category<span className="req">*</span>
            </span>
            <input
              value={category}
              aria-required="true"
              aria-invalid={errors.category ? "true" : "false"}
              onChange={(e) => {
                setCategory(e.target.value);
                setErrors((previous) => ({ ...previous, category: "" }));
              }}
              placeholder="e.g. Data Science"
            />
            {errors.category && (
              <span className="field-error" role="alert">
                {errors.category}
              </span>
            )}
            <span className="field-hint">
              Courses with the same category are grouped together in the filters.
            </span>
          </label>
        </div>
      </section>

      <section className="form-section">
        <h3 className="section-title">
          <span className="step">2</span>Status and progress
        </h3>

        <div className="form-grid">
          <label className="field">
            <span className="field-label">Status</span>
            <select value={status} onChange={handleChange}>
              <option value="Completed">Completed</option>
              <option value="In Progress">In Progress</option>
              <option value="Planned">Planned</option>
            </select>
          </label>

          <label className="field">
            <span className="field-label">Progress (%)</span>
            <input
              value={progress}
              type="number"
              min={0}
              max={100}
              disabled={status !== "In Progress"}
              onChange={(e) => setProgress(Number(e.target.value))}
            />
            <span className="field-hint">
              {status === "In Progress"
                ? "Enter a value from 0 to 100."
                : "Set automatically for this status."}
            </span>
          </label>
        </div>
      </section>

      <div className="form-actions">
        <span className="form-note">You can edit or delete it later.</span>
        <button
          className="btn btn-primary btn-lg"
          type="submit"
          disabled={submitting}
        >
          {submitting ? "Adding Course..." : "Add Course"}
        </button>
      </div>
    </form>
  );
}
