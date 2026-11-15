//this component dispays an indiviual course
import { useState } from "react";

export default function CourseCard({ id, title, category, status, progress, onDeleteCourse, onUpdateCourse}) {
 
  //determines whic interface is displayed, either edit or the normal courses
  //when is Editing is false, it means that its not in editing mode, instead its just displaying the courses
  const [isEditing, setIsEditing] = useState(false);

  const [editedTitle, setEditedTitle] = useState(title);
  const [editedCategory, setEditedCategory] = useState(category);
  const [editedStatus, setEditedStatus] = useState(status);
  const [editedProgress, setEditedProgress] = useState(progress);

  //this function handles the changing of the status
function handleStatusChange(e) {
  const selectedStatus = e.target.value; //set the status to the input variable

  //set the status to that variable
  setEditedStatus(selectedStatus);
//if the status is completed, automatically set the progress to 100, else set to 0
  if (selectedStatus === "Completed") {
    setEditedProgress(100);
  } else {
    setEditedProgress(0);
  }
}

  function handleSave() {//creates the updated course and sends it to APP
    const updatedCourse = {
      id: id,
      title: editedTitle,
      category: editedCategory,
      status: editedStatus,
      progress: editedStatus === "Completed" ? 100 : editedProgress
    };

    //call the onUpdateCourse from the App.jsx and pass the updated course to the function to be updated.
    onUpdateCourse(updatedCourse);
    setIsEditing(false);
  }

  //NEW: turns the status into a css friendly word, for example "In Progress" becomes "in-progress"
  //toLowerCase makes it small letters and replace swaps the space for a dash
  const statusClass = status.toLowerCase().replace(" ", "-");

  return (
    //CHANGED: the card now gets a second class like is-completed, this is what colours the card border depending on the status
    <div className={`course-card is-${statusClass}`}>
      {isEditing ? ( //if its in editing mode, then bring out a form that displays all the inputs as entered , so the user can change it
        //CHANGED: the edit inputs now have labels above them so the user knows which input is which (edit-form and field are in App.css)
        <div className="edit-form">
          <label className="field">
            <span className="field-label">Course title</span>
            <input
              value={editedTitle}//set the value(what will be displayed)  set it to what the user has already created
              onChange={(e) => setEditedTitle(e.target.value)}
            />
          </label>

          <label className="field">
            <span className="field-label">Category</span>
            <input
              value={editedCategory}
              onChange={(e) => setEditedCategory(e.target.value)}
            />
          </label>

          {/*status and progress sit side by side, same as in the add course form*/}
          <div className="form-grid">
            <label className="field">
              <span className="field-label">Status</span>
              <select
                value={editedStatus}
                //when the status is changed, call the handleStatusChange function, this willset the progress value based on the status
                onChange={handleStatusChange}
              >
                <option value="Planned">Planned</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </label>

            <label className="field">
              <span className="field-label">Progress (%)</span>
              <input
                type="number"
                min="0"
                max="100"
                value={editedProgress}
                disabled={editedStatus !== "In Progress"}
                onChange={(e) => setEditedProgress(Number(e.target.value))}
              />
            </label>
          </div>

          {/*CHANGED: the save and cancel buttons are now inside card-actions, which puts a gap between them*/}
          <div className="card-actions">
            {/*Once the user saves the changes, call the handleSave function, in this function, the edited inputs are set to the props and the function to update is called*/}
            <button className="btn btn-primary" onClick={handleSave}>Save Changes</button>

            {/*is the user chooses to cancel, then set the Edit mode to false, therefore the page displays the courselist as usual*/}
            <button className="btn btn-ghost" onClick={() => setIsEditing(false)}>
              Cancel
            </button>
          </div>
        </div>
      ) : (//else if editing mode is false then display the normal courses as before
        <>
          {/*CHANGED: the status and category used to be plain "Status:" and "Category:" lines, now they are a coloured badge and a small tag at the top of the card*/}
          <div className="card-top">
            <span className="status-badge">{status}</span>
            <span className="category-tag">{category}</span>
          </div>

          <h2 className="card-title">{title}</h2>

          {/*the progress text and the bar are grouped together, the percentage is now on the right side of the word Progress*/}
          <div>
            <div className="progress-row">
              <span>Progress</span>
              <strong>{progress}%</strong>
            </div>
            {/*NEW: aria-label so screen readers know which course this bar belongs to*/}
            <progress value={progress} max={100} aria-label={`${title} progress`}></progress>
          </div>

          {/*CHANGED: the edit and delete buttons are now inside card-actions, this is what spaces them apart.
          btn-ghost is the blue outline button and btn-danger is the red one. The button text was shortened from "Delete Course" to "Delete" so both fit side by side*/}
          <div className="card-actions">
            {/*NEW: the aria-label on edit and delete makes a screen reader say which course the button is for, for example "Edit Data Analysis", instead of just "Edit"*/}
            <button className="btn btn-ghost" aria-label={`Edit ${title}`} onClick={() => setIsEditing(true)}>Edit</button>

            <button className="btn btn-danger" aria-label={`Delete ${title}`} onClick={() => onDeleteCourse(id)}>
              Delete
            </button>
          </div>
        </>
      )}
    </div>
  );
}
