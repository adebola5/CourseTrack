//this component dispays an indiviual course
import { useState } from "react";
import { apiRequest } from "../services/api";//course is singular, we use course because it represeets 1 , the point of this ppage is to represent 1 course but they are then displayed as a whole in the dashboard page
export default function CourseCard({ course, onDeleteCourse, onUpdateCourse, onShowMessage }) {
  //array destructuring, extracts the existing properties from the course object, so the rest of your component can continue using
  const { id, title, category, status, progress } = course;
  //determines whic interface is displayed, either edit or the normal courses
  //when is Editing is false, it means that its not in editing mode, instead its just displaying the courses
  const [isEditing, setIsEditing] = useState(false);
  //stores errors when a course cannot be updated or deleted
const [actionError, setActionError] = useState("");
  const [editedTitle, setEditedTitle] = useState(title);
  const [editedCategory, setEditedCategory] = useState(category);
  const [editedStatus, setEditedStatus] = useState(status);
  const [editedProgress, setEditedProgress] = useState(progress);

  //states for the milestones.
  //The || [] means that if the course doesn't have any milestones yet (or the property is undefined), we start with an empty array.
  const [milestones, setMilestones] = useState(course.milestones || []); //stores the milestones belonging to the current course
  const [newMilestone, setNewMilestone] = useState(""); //stores the text the user types when adding a new milestone.

// Resource states
//resources, if the resources do not exsist, then start with a new array
const [resources, setResources] = useState(course.resources || []);

//all the props that will be used for the resources array
const [newResourceTitle, setNewResourceTitle] = useState("");
const [newResourceUrl, setNewResourceUrl] = useState("");
const [newResourceType, setNewResourceType] = useState("Video");

// Resource editing states for when the resources are beign edited by the user
const [editingResourceId, setEditingResourceId] = useState(null);
const [editedResourceTitle, setEditedResourceTitle] = useState("");
const [editedResourceUrl, setEditedResourceUrl] = useState("");
const [editedResourceType, setEditedResourceType] = useState("Video");

  //hold states to edit the milestones without affecting the others
  const [editingMilestoneId, setEditingMilestoneId] = useState(null);
  const [editedMilestoneTitle, setEditedMilestoneTitle] = useState("");


  //handles errors when adding, editing or deleting milestones and resources
  async function performAction(action) {
    try {
      setActionError("");

      await action();
    } catch (error) {
      //NEW: connection errors and expired sessions are already shown as a pop up by App.jsx, so the message is not repeated here
      if (error.handled) return;

      setActionError(error.message || "The operation could not be completed.");
    }
  }

  //adds a new milestone through the backend API
  async function handleAddMilestone() {
    if (!newMilestone.trim()) return;

    await performAction(async () => {
      //sends the new milestone to the backend
      const createdMilestone = await apiRequest(
        `/api/courses/${id}/milestones`,
        {
          method: "POST",
          body: JSON.stringify({
            title: newMilestone.trim(),
            completed: false,
          }),
        }
      );

      //adds the milestone returned by the backend to the list
      await saveMilestones([...milestones, createdMilestone]);

      setNewMilestone("");
    });
  }

  //updates a milestone's completion status through the backend
  async function handleToggleMilestone(milestoneId) {
    await performAction(async () => {
      const milestone = milestones.find(
        (item) => item.id === milestoneId
      );

      const updatedMilestone = {
        ...milestone,
        completed: !milestone.completed,
      };

      await apiRequest(
        `/api/courses/${id}/milestones/${milestoneId}`,
        {
          method: "PUT",
          body: JSON.stringify({
            title: updatedMilestone.title,
            completed: updatedMilestone.completed,
          }),
        }
      );

      const updatedMilestones = milestones.map((item) =>
        item.id === milestoneId ? updatedMilestone : item
      );

      await saveMilestones(updatedMilestones);
    });
  }

  //deletes a milestone after the user confirms
  async function handleDeleteMilestone(milestoneId) {
    const milestone = milestones.find(
      (item) => item.id === milestoneId
    );

    const confirmed = window.confirm(
      `Are you sure you want to delete the milestone "${milestone?.title}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    await performAction(async () => {
      await apiRequest(
        `/api/courses/${id}/milestones/${milestoneId}`,
        {
          method: "DELETE",
        }
      );

      const updatedMilestones = milestones.filter(
        (item) => item.id !== milestoneId
      );

      await saveMilestones(updatedMilestones);

      onShowMessage?.("Milestone deleted successfully!");
    });
  }

  //edits an existing milestone through the backend API
  async function handleEditMilestone(milestone) {
    if (!editedMilestoneTitle.trim()) return;

    await performAction(async () => {
      const updatedMilestone = {
        ...milestone,
        title: editedMilestoneTitle.trim(),
      };

      await apiRequest(
        `/api/courses/${id}/milestones/${milestone.id}`,
        {
          method: "PUT",
          body: JSON.stringify({
            title: updatedMilestone.title,
            completed: updatedMilestone.completed,
          }),
        }
      );

      const updatedMilestones = milestones.map((item) =>
        item.id === milestone.id ? updatedMilestone : item
      );

      await saveMilestones(updatedMilestones);

      setEditingMilestoneId(null);
      setEditedMilestoneTitle("");
    });
  }

  //updates milestone state and recalculates course progress
  async function saveMilestones(updatedMilestones) {
    const completedCount = updatedMilestones.filter(
      (milestone) => milestone.completed
    ).length;

    const calculatedProgress =
      updatedMilestones.length > 0
        ? Math.round(
            (completedCount / updatedMilestones.length) * 100
          )
        : course.progress;

    //updates the course in the frontend after the API operation
    setMilestones(updatedMilestones);

    await onUpdateCourse({
      ...course,
      milestones: updatedMilestones,
      progress: calculatedProgress,
    });
  }

  //adds a resource through the backend API
  async function handleAddResource() {
    if (!newResourceTitle.trim() || !newResourceUrl.trim()) return;

    await performAction(async () => {
      const createdResource = await apiRequest(
        `/api/courses/${id}/resources`,
        {
          method: "POST",
          body: JSON.stringify({
            title: newResourceTitle.trim(),
            url: newResourceUrl.trim(),
            type: newResourceType,
          }),
        }
      );

      await saveResources([...resources, createdResource]);

      setNewResourceTitle("");
      setNewResourceUrl("");
      setNewResourceType("Video");
    });
  }


  //deletes a resource after the user confirms
  async function handleDeleteResource(resourceId) {
    const resource = resources.find(
      (item) => item.id === resourceId
    );

    const confirmed = window.confirm(
      `Are you sure you want to delete the resource "${resource?.title}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    await performAction(async () => {
      await apiRequest(
        `/api/courses/${id}/resources/${resourceId}`,
        {
          method: "DELETE",
        }
      );

      const updatedResources = resources.filter(
        (item) => item.id !== resourceId
      );

      await saveResources(updatedResources);

      onShowMessage?.("Resource deleted successfully!");
    });
  }


  //edits an existing resource through the backend API
  async function handleEditResource(resource) {
    if (!editedResourceTitle.trim() || !editedResourceUrl.trim()) return;

    await performAction(async () => {
      const updatedResource = {
        ...resource,
        title: editedResourceTitle.trim(),
        url: editedResourceUrl.trim(),
        type: editedResourceType,
      };

      await apiRequest(
        `/api/courses/${id}/resources/${resource.id}`,
        {
          method: "PUT",
          body: JSON.stringify({
            title: updatedResource.title,
            url: updatedResource.url,
            type: updatedResource.type,
          }),
        }
      );

      const updatedResources = resources.map((item) =>
        item.id === resource.id ? updatedResource : item
      );

      await saveResources(updatedResources);

      setEditingResourceId(null);
      setEditedResourceTitle("");
      setEditedResourceUrl("");
      setEditedResourceType("Video");
    });
  }

  //updates the resources displayed in the course card
  async function saveResources(updatedResources) {
    setResources(updatedResources);

    await onUpdateCourse({
      ...course,
      resources: updatedResources,
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

  //saves course changes through the backend API
async function handleSave() {
  if (!editedTitle.trim() || !editedCategory.trim()) {
    setActionError("Please enter a course title and category.");
    return;
  }

  const updatedCourse = {
    ...course,
    title: editedTitle.trim(),
    category: editedCategory.trim(),
    status: editedStatus,
    progress:
      milestones.length > 0
        ? Math.round(
            (milestones.filter((m) => m.completed).length /
              milestones.length) * 100
          )
        : editedStatus === "Completed"
          ? 100
          : editedProgress,
  };

  try {
    setActionError("");

    //waits for the backend to confirm the update
    await onUpdateCourse(updatedCourse);

    setIsEditing(false);
  } catch (error) {
    //NEW: connection errors and expired sessions are already shown as a pop up by App.jsx, so the message is not repeated here
    if (error.handled) return;

    setActionError(error.message || "Could not update the course.");
  }
}


  //deletes the course after the user confirms
  async function handleDelete() {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${title}"? This will also delete all its milestones, resources and scheduled study sessions. This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      setActionError("");

      //waits for the backend to confirm deletion
      await onDeleteCourse(id);
    } catch (error) {
      //NEW: connection errors and expired sessions are already shown as a pop up by App.jsx, so the message is not repeated here
      if (error.handled) return;

      setActionError(error.message || "Could not delete the course.");
    }
  }


  //NEW: turns the status into a css friendly word, for example "In Progress" becomes "in-progress"
  //toLowerCase makes it small letters and replace swaps the space for a dash
  const statusClass = status.toLowerCase().replace(" ", "-");

  return (
    //CHANGED: the card now gets a second class like is-completed, this is what colours the card border depending on the status
    <div className={`course-card is-${statusClass}`}>
      {/*CHANGED: the error message has the form-error class now so it is styled like the other errors*/}
      {actionError && (
        <p className="form-error" role="alert">{actionError}</p>
      )}
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
          {/*NEW: the card is now split into 3 columns so it is wider and shorter instead of one long column.
          card-main is the left column (status, title, progress and the Edit / Delete buttons), the learning path and the resources each get their own column next to it*/}
          <div className="card-main">
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
             onClick={handleDelete}
            >
              Delete
            </button>
          </div>
          </div>{/*end of card-main*/}

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
                        className="btn btn-sm btn-primary"
                        onClick={() => handleEditMilestone(milestone)}
                      >
                        Save
                      </button>
                        {/*the options to save or cancel the changes are also here*/}
                      <button
                        className="btn btn-sm btn-ghost"
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
                          className="btn btn-sm btn-ghost"
                          onClick={() => {
                            setEditingMilestoneId(milestone.id);
                            setEditedMilestoneTitle(milestone.title);
                          }}
                        >
                          Edit
                        </button>

                        <button //this button handles what happens when a user deletes a milestone
                          className="btn btn-sm btn-danger"
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

              <button className="btn btn-sm btn-primary" onClick={handleAddMilestone}>
                Add
              </button>
            </div>
          </section>


{/* Course Resources */}
<div className="resource-section">
  <h4>Course Resources</h4>

  {/* Display saved resources */}
  <div className="resource-list">
    {resources.map((resource) => (
      <div className="resource-item" key={resource.id}>
        {editingResourceId === resource.id ? (
          <div className="resource-edit-form">
            <input
              type="text"
              value={editedResourceTitle}
              onChange={(e) =>
                setEditedResourceTitle(e.target.value)
              }
              placeholder="Resource title"
            />

            <input
              type="url"
              value={editedResourceUrl}
              onChange={(e) =>
                setEditedResourceUrl(e.target.value)
              }
              placeholder="Resource URL"
            />

            <select
              value={editedResourceType}
              onChange={(e) =>
                setEditedResourceType(e.target.value)
              }
            >
              <option value="Video">Video</option>
              <option value="Article">Article</option>
              <option value="Tutorial">Tutorial</option>
              <option value="Documentation">Documentation</option>
              <option value="Other">Other</option>
            </select>

            <button className="btn btn-sm btn-primary" onClick={() => handleEditResource(resource)}>
              Save
            </button>

            <button className="btn btn-sm btn-ghost" onClick={() => setEditingResourceId(null)}>
              Cancel
            </button>
          </div>
        ) : (
          <>
            <div className="resource-info">
              <strong>{resource.title}</strong>
              <span>{resource.type}</span>
            </div>

            <div className="resource-actions">
              <a className="btn btn-sm btn-ghost"
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                Open
              </a>

              <button className="btn btn-sm btn-ghost"
                onClick={() => {
                  setEditingResourceId(resource.id);
                  setEditedResourceTitle(resource.title);
                  setEditedResourceUrl(resource.url);
                  setEditedResourceType(resource.type);
                }}
              >
                Edit
              </button>

              <button className="btn btn-sm btn-danger"
                onClick={() => handleDeleteResource(resource.id)}
              >
                Delete
              </button>
            </div>
          </>
        )}
      </div>
    ))}
  </div>

  {/* Add a new resource */}
  <div className="resource-form">
    <input
      type="text"
      value={newResourceTitle}
      onChange={(e) => setNewResourceTitle(e.target.value)}
      placeholder="Resource title"
    />

    <input
      type="url"
      value={newResourceUrl}
      onChange={(e) => setNewResourceUrl(e.target.value)}
      placeholder="Resource URL (https://...)"
    />

    <select
      value={newResourceType}
      onChange={(e) => setNewResourceType(e.target.value)}
    >
      <option value="Video">Video</option>
      <option value="Article">Article</option>
      <option value="Tutorial">Tutorial</option>
      <option value="Documentation">Documentation</option>
      <option value="Other">Other</option>
    </select>

    <button className="btn btn-sm btn-primary" onClick={handleAddResource}>
      Add Resource
    </button>
  </div>
</div>
        </>
      )}
    </div>
  );
}
