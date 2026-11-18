//this page holds the form that shows when a user wants to add a new form.
import { useState } from "react";
export default function AddCourseForm({ onAddCourse }) {
  //onAddCourse is a function beign passed as a prop
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("Planned");
  const [progress, setProgress] = useState(0);

  function handleChange(e) {
    //this function sets the status to be what the user has chosen
    const selectedStatus = e.target.value
    setStatus(selectedStatus);

    //if the status is in progress, leave it as the user set it
    if(selectedStatus === "Completed"){
        setProgress(100);
    }else {//now planned and in progress courses are set to 0
        setProgress(0);
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim() || !category.trim()) {
      alert("Please enter a course title and category.");
      return;
    }
    /*.trim() removes whitespace from the beginning and end.
    ! checks whether the resulting string is empty.
    return stops the function if validation fails. */

    //this is the declaration of a new course object
    const newCourse = {
      id: Date.now(),
      title: title.trim(),
      category: category.trim(),//the .trim makes sure that whitespaces are not saved to the variable
      status: status,
      progress: progress //if the status is not = completed then the progress = 0
    };

    //calls the function to add a new course and passes the new course
    onAddCourse(newCourse);

    //reset the input values to empty values
    setTitle("");
    setCategory("");
    setStatus("Planned");
    setProgress(0);
  }

  //CHANGED: only the layout below was changed, the states and the functions above are exactly as they were
  return (
    <form className="course-form" onSubmit={handleSubmit}> {/*course-form is the card the whole form sits in*/}
      {/*NEW: the header at the top of the form card, the red * is explained here*/}
      <div className="form-header">
        <h2>Course details</h2>
        <p>Fields marked with <span className="req">*</span> are required.</p>
      </div>

      {/*NEW: the form is now split into sections so its easier to read. Section 1 is about what the course is*/}
      <section className="form-section">
        <h3 className="section-title"><span className="step">1</span>About the course</h3>
        <div className="form-grid">
          {/*CHANGED: the label now wraps the input instead of sitting next to it, so the label is above the input and clicking the label also selects the input.
          field-full makes it stretch across both columns*/}
          <label className="field field-full">
            <span className="field-label">Course title<span className="req">*</span></span>
            <input
              value={title}
              aria-required="true" /*NEW: tells screen readers this field is required (the red * is only visual)*/
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Data Structures"
            />
          </label>

          <label className="field field-full">
            <span className="field-label">Category<span className="req">*</span></span>
            <input
              value={category}
              aria-required="true"
              onChange={(e) => setCategory(e.target.value)}
              placeholder="e.g. Data Science"
            />
            {/*NEW: small helper text under the input*/}
            <span className="field-hint">Courses with the same category are grouped together in the filters.</span>
          </label>
        </div>
      </section>

      {/*NEW: Section 2 is about where the learner is at. status and progress sit side by side because they work together*/}
      <section className="form-section">
        <h3 className="section-title"><span className="step">2</span>Status and progress</h3>
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
            {/*NEW: the hint changes depending on the status. if its In Progress the user can type, otherwise the input is disabled and we tell them why*/}
            <span className="field-hint">
              {status === "In Progress" ? "Enter a value from 0 to 100." : "Set automatically for this status."}
            </span>
          </label>
        </div>
      </section>

      {/*NEW: the bottom bar of the form, the button now sits on the right side of it.
      btn-lg just makes the button a bit bigger than the other buttons*/}
      <div className="form-actions">
        <span className="form-note">You can edit or delete it later.</span>
        <button className="btn btn-primary btn-lg" type="submit">Add Course</button>
      </div>
    </form>
  );
}
