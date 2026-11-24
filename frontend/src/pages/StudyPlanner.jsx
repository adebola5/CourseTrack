
import { useState, useEffect, useRef } from "react";
import StudySessionForm from "../components/StudySessionForm";
import StudySessionCard from "../components/StudySessionCard";

export default function StudyPlanner({
  courses,
  studySessions,
  onAddSession,
  onUpdateSession,
  onDeleteSession,
}) {
  //stores the message for the delete success notification
  const [deleteMessage, setDeleteMessage] = useState("");

  //stores an error if a study session operation fails
  const [actionError, setActionError] = useState("");

  const timeoutRef = useRef(null);

  //shows a success message and hides it after three seconds
  function showDeleteMessage(message) {
    setDeleteMessage(message);

    //restarts the timer if another notification is already showing
    clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(() => {
      setDeleteMessage("");
    }, 3000);
  }

  //clears the timer when the page is removed
  useEffect(() => {
    return () => clearTimeout(timeoutRef.current);
  }, []);


  //deletes a session after the user confirms
  async function handleDeleteSession(sessionId) {
    const session = studySessions.find(
      (item) => item.id === sessionId
    );

    const confirmed = window.confirm(
      `Are you sure you want to delete this study session${session?.description ? ` (${session.description})` : ""}? This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      setActionError("");

      await onDeleteSession(sessionId);

      showDeleteMessage("Study session deleted successfully!");
    } catch (error) {
      //NEW: connection errors and expired sessions are already shown as a pop up by App.jsx, so the message is not repeated here
      if (error.handled) return;

      setActionError(error.message || "Could not delete the study session.");
    }
  }


  //stores the session currently selected for editing
  const [selectedSession, setSelectedSession] = useState(null);

  //finds the session selected by the user and stores it for editing
  function handleEditSession(session) {
    setSelectedSession(session);
  }

  //clears the selected session when the user cancels editing
  function handleCancelEdit() {
    setSelectedSession(null);
  }

  //updates the selected session and exits editing mode after success
  async function handleUpdateSession(updatedSession) {
    await onUpdateSession(updatedSession);
    setSelectedSession(null);
  }

  return (
    <main id="main-content" tabIndex={-1}>
      {/*shows the delete success notification*/}
      {deleteMessage && (
        <div className="info-notification" role="status"> {/*CHANGED: deletions are confirmations so they use the blue info style*/}
          <span>✓</span>
          {deleteMessage}
        </div>
      )}

      {/*shows an error if an operation fails*/}
      {actionError && (
        <p className="form-error" role="alert">{actionError}</p>
      )}

      <header className="page-header">
        <span className="eyebrow">Planner</span>
        <h1>Smart Study Planner</h1>
        <p className="page-subtitle">
          Plan and organise your study sessions.
        </p>
      </header>

      {/*places the study form on the left and scheduled sessions on the right*/}
      <div className="planner-layout">
        <StudySessionForm
          key={selectedSession?.id ?? "new"}
          courses={courses}
          onAddSession={onAddSession}
          onUpdateSession={handleUpdateSession}
          editingSession={selectedSession}
          onCancelEdit={handleCancelEdit}
        />

        <section className="study-sessions-section">
          <h2>Your Scheduled Sessions</h2>

          {studySessions.length === 0 ? (
            <p className="empty-state">
              You haven't scheduled any study sessions yet.
            </p>
          ) : (
            <div className="study-sessions-list">
              {studySessions.map((session) => {
                //finds the course that belongs to the current study session
                const relatedCourse = courses.find(
                  (course) => course.id === session.courseId
                );

                return (
                  <StudySessionCard
                    key={session.id}
                    session={session}
                    course={relatedCourse}
                    onEditSession={handleEditSession}
                    onDeleteSession={handleDeleteSession}
                  />
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
