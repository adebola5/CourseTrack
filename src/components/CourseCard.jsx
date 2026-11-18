//this component dispays an indiviual course
import { useState, useRef } from "react";
//course is singular, we use course because it represeets 1 , the point of this ppage is to represent 1 course but they are then displayed as a whole in the dashboard page
export default function CourseCard({ course, onDeleteCourse, onUpdateCourse }) {
  //array destructuring, extracts the existing properties from the course object, so the rest of your component can continue using
  const { id, title, category, status, progress } = course;
  //determines whic interface is displayed, either edit or the normal courses
  //when is Editing is false, it means that its not in editing mode, instead its just displaying the courses
  const [isEditing, setIsEditing] = useState(false);

  const [editedTitle, setEditedTitle] = useState(title);
  const [editedCategory, setEditedCategory] = useState(category);
  const [editedStatus, setEditedStatus] = useState(status);
  const [editedProgress, setEditedProgress] = useState(progress);

  //this is to determine the id of the next milestone
  const nextMilestoneId = useRef(
    Math.max(0, ...(course.milestones || []).map((m) => Number(m.id) || 0)),
  );

  //states for the milestones.
  //The || [] means that if the course doesn't have any milestones yet (or the property is undefined), we start with an empty array.
  const [milestones, setMilestones] = useState(course.milestones || []); //stores the milestones belonging to the current course
  const [newMilestone, setNewMilestone] = useState(""); //stores the text the user types when adding a new milestone.

  //hold states to edit the milestones without affecting the others
  const [editingMilestoneId, setEditingMilestoneId] = useState(null);
  const [editedMilestoneTitle, setEditedMilestoneTitle] = useState("");

  function handleAddMilestone() {
    // function to add a milestone
    if (!newMilestone.trim()) return;

    const updatedMilestones = [
      //take note that here milestones is an array
      ...milestones, //copies the exisitong milestone
      {
        //A new milestone object is added to the array.
        id: ++nextMilestoneId.current, //generates an id by adding 1 to the previous milestone's id
        title: newMilestone.trim(),
        completed: false, //means the new milestone starts as incomplete.
      },
    ];

    saveMilestones(updatedMilestones); //updates the course.
    setNewMilestone(""); //clears the input.
  }

  //function to update the milestone  to completed
  function handleToggleMilestone(milestoneId) {
    const updatedMilestones = milestones.map((milestone) =>
      milestone.id === milestoneId //checks if the current milestone and the upated milestone matches
        ? { ...milestone, completed: !milestone.completed } //copy the
        : milestone,
    );

    saveMilestones(updatedMilestones);
  }

  //deleting a milestone
  function handleDeleteMilestone(milestoneId) {
    const updatedMilestones = milestones.filter(
      (milestone) => milestone.id !== milestoneId,
    );

    saveMilestones(updatedMilestones);
  }

  //this function is to edit the heading of an exsisting milestone
  function handleEditMilestone(milestone) {
    const updatedMilestones = milestones.map((item) =>
      item.id === milestone.id
        ? { ...item, title: editedMilestoneTitle.trim() }
        : item,
    );

    if (!editedMilestoneTitle.trim()) return;

    saveMilestones(updatedMilestones);
    setEditingMilestoneId(null);
    setEditedMilestoneTitle("");
  }

  function saveMilestones(updatedMilestones) {
    const completedCount = updatedMilestones.filter(
      (milestone) => milestone.completed,
    ).length;

    const calculatedProgress =
      updatedMilestones.length > 0
        ? Math.round((completedCount / updatedMilestones.length) * 100)
        : course.progress;

    setMilestones(updatedMilestones);

    onUpdateCourse({
      ...course,
      milestones: updatedMilestones,
      progress: calculatedProgress,
    });
  }

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

  function handleSave() {
    //creates the updated course and sends it to APP
    const updatedCourse = {
      ...course, //this ...means take all the props and values of this object and copies them into a new object
      title: editedTitle, //but after copying take the title and set it to the newly inputted title.
      category: editedCategory,
      status: editedStatus,
      //the progress is set like this because we want the progress to be based on the completion of the milestones, also to ensure manually editing a course doesn't overwrite milestone-based progress.
      progress:
        milestones.length > 0
          ? Math.round(
              (milestones.filter((m) => m.completed).length /
                milestones.length) *
                100,
            )
          : editedStatus === "Completed"
            ? 100
            : editedProgress, //keep all properties like milestones unchanged since we do not give users the option to change it but, we also dont want to lose the variables
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
              value={editedTitle} //set the value(what will be displayed)  set it to what the user has already created
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
            <button className="btn btn-primary" onClick={handleSave}>
              Save Changes
            </button>

            {/*is the user chooses to cancel, then set the Edit mode to false, therefore the page displays the courselist as usual*/}
            <button
              className="btn btn-ghost"
              onClick={() => setIsEditing(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        //else if editing mode is false then display the normal courses as before
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
            <progress
              value={progress}
              max={100}
              aria-label={`${title} progress`}
            ></progress>
          </div>

          {/* Learning milestones */}
          <section className="milestone-section">
            <h3>Learning Path</h3>

            <div className="milestone-list">
              {milestones.map((milestone) => (
                <div className="milestone-item" key={milestone.id}>
                  {/*this editing mode is only activated when the milestone.is matches the editingMilestoneid*/}
                  {editingMilestoneId === milestone.id ? (//editing mode starts here
                    <>
                      <input
                        value={editedMilestoneTitle}
                        onChange={(e) =>
                          setEditedMilestoneTitle(e.target.value)
                        }
                      />

                      <button
                        className="btn btn-primary"
                        onClick={() => handleEditMilestone(milestone)}
                      >
                        Save
                      </button> 
                        {/*the options to save or cancel the changes are also here*/}
                      <button
                        className="btn btn-ghost"
                        onClick={() => setEditingMilestoneId(null)}
                      >
                        Cancel
                      </button>
                    </>
                    //editing mode ends here
                  ) : (//else if editing mode is not set, then
                    <>
                      <label className="milestone-label">
                        <input
                          type="checkbox" //creates a checkbox
                          checked={milestone.completed} //determines whether it is checked based on the milestone's completion status.
                          onChange={() => handleToggleMilestone(milestone.id)}//calls the method that handl;es this change
                        />

                        <span
                          className={
                            //if the milestone is completed then change the classname to this, it will go to css where the display will be changed to be crossed out when it becomes complete
                            milestone.completed ? "milestone-completed" : ""
                          }
                        >
                          {milestone.title}
                        </span>
                      </label>

                      <div className="milestone-actions">
                      {/*this button is for when the milestone is edited, it sets the is and */}
                        <button
                          className="btn btn-ghost"
                          onClick={() => {
                            setEditingMilestoneId(milestone.id);
                            setEditedMilestoneTitle(milestone.title);
                          }}
                        >
                          Edit
                        </button>

                        <button //this button handles what happens when a user deletes a milestone
                          className="btn btn-danger"
                          onClick={() => handleDeleteMilestone(milestone.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>

            <div className="add-milestone">
              <input
                type="text"
                placeholder="Add a learning milestone..."
                value={newMilestone}
                onChange={(e) => setNewMilestone(e.target.value)}
                onKeyDown={(e) => {
                  //if the user clicks enter, then call the function that will create the milestone
                  if (e.key === "Enter") handleAddMilestone();
                }}
              />

              <button className="btn btn-primary" onClick={handleAddMilestone}>
                Add
              </button>
            </div>
          </section>

          {/*CHANGED: the edit and delete buttons are now inside card-actions, this is what spaces them apart.
          btn-ghost is the blue outline button and btn-danger is the red one. The button text was shortened from "Delete Course" to "Delete" so both fit side by side*/}
          <div className="card-actions">
            {/*NEW: the aria-label on edit and delete makes a screen reader say which course the button is for, for example "Edit Data Analysis", instead of just "Edit"*/}
            <button
              className="btn btn-ghost"
              aria-label={`Edit ${title}`}
              onClick={() => setIsEditing(true)}
            >
              Edit
            </button>

            <button
              className="btn btn-danger"
              aria-label={`Delete ${title}`}
              onClick={() => onDeleteCourse(id)}
            >
              Delete
            </button>
          </div>
        </>
      )}
    </div>
  );
}
