
import { useState } from "react";

//the props are received from its parent StudyPlanner
export default function StudySessionForm({
  courses,
  onAddSession,
  onUpdateSession,
  editingSession,
  onCancelEdit,
}) {
  //stores all the information entered into the form
  const [formData, setFormData] = useState(() => ({
    //uses the existing session values when editing, otherwise starts with empty fields
    courseId: editingSession ? String(editingSession.courseId) : "",
    date: editingSession?.date ?? "",

    //the backend may return 09:30:00, but the time input expects 09:30
    startTime: editingSession?.startTime?.slice(0, 5) ?? "",

    duration: editingSession?.duration ?? 60,
    description: editingSession?.description ?? "",
  }));

  //stores an error if the session cannot be saved
  const [submitError, setSubmitError] = useState("");

  //tracks whether the form is currently submitting
  const [isSubmitting, setIsSubmitting] = useState(false);

  //updates the specific form field that the user changes
  function handleChange(e) {
    const { name, value } = e.target;

    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  }

  //submits the form to create or update a study session
  async function handleSubmit(e) {
    e.preventDefault();

    //prevents another submission while a request is already running
    if (isSubmitting) return;

    const sessionData = {
      courseId: Number(formData.courseId),
      date: formData.date,
      startTime: formData.startTime,
      duration: Number(formData.duration),
      description: formData.description.trim(),
    };

    try {
      setSubmitError("");
      setIsSubmitting(true);

      //updates the selected session if the user is editing
      if (editingSession) {
        await onUpdateSession({
          ...sessionData,
          id: editingSession.id,
        });
      } else {
        //creates a new session if the user is adding
        await onAddSession(sessionData);
      }

      //clears the form only after the backend confirms success
      setFormData({
        courseId: "",
        date: "",
        startTime: "",
        duration: 60,
        description: "",
      });
    } catch (error) {
      //keeps the entered information if the request fails
      //NEW: connection errors and expired sessions are already shown as a pop up by App.jsx, so the message is not repeated here
      if (error.handled) return;

      setSubmitError(error.message || "Could not save the study session.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="planner-form" onSubmit={handleSubmit}>
      <div className="form-header">
        <h2>
          {editingSession ? "Edit Study Session" : "Schedule a Study Session"}
        </h2>
        <p>
          Fields marked with <span className="req">*</span> are required.
        </p>
      </div>

      {/*displays an error if the session could not be saved*/}
      {submitError && (
        <p className="form-error" role="alert">{submitError}</p>
      )}

      <div className="form-section">
        <div className="form-grid">
          <label className="field field-full">
            <span className="field-label">
              Course<span className="req">*</span>
            </span>

            <select
              name="courseId"
              value={formData.courseId}
              onChange={handleChange}
              required
            >
              <option value="">Select a course</option>

              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.title}
                </option>
              ))}
            </select>
          </label>

          <label className="field field-full">
            <span className="field-label">
              Study Date<span className="req">*</span>
            </span>

            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
            />
          </label>

          <label className="field">
            <span className="field-label">
              Start Time<span className="req">*</span>
            </span>

            <input
              type="time"
              name="startTime"
              value={formData.startTime}
              onChange={handleChange}
              required
            />
          </label>

          <label className="field">
            <span className="field-label">
              Duration (min)<span className="req">*</span>
            </span>

            <input
              type="number"
              name="duration"
              min="15"
              max="1440"
              step="15"
              value={formData.duration}
              onChange={handleChange}
              required
            />
          </label>

          <label className="field field-full">
            <span className="field-label">
              What do you plan to study?<span className="req">*</span>
            </span>

            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe your study activity..."
              required
            />
          </label>
        </div>
      </div>

      <div className="form-actions">
        <button
          className="btn btn-primary"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting
            ? "Saving..."
            : editingSession
              ? "Save Changes"
              : "Schedule Session"}
        </button>

        {editingSession && (
          <button
            className="btn btn-ghost"
            type="button"
            onClick={onCancelEdit}
            disabled={isSubmitting}
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
