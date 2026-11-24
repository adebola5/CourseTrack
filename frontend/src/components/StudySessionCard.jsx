//this component displays an individual scheduled study session
export default function StudySessionCard({ session, course, onEditSession, onDeleteSession }) {
  //NEW: turns the saved date (for example 2026-11-25) into a real date so we can show a day number, a short month and the full date.
  //the T00:00:00 makes it use the users own time zone, otherwise the date can show up as the day before
  const sessionDate = new Date(`${session.date}T00:00:00`);

  //if the date is not valid then we just show the saved text instead
  const validDate = !Number.isNaN(sessionDate.getTime());
  const day = validDate ? sessionDate.getDate() : "";
  const month = validDate ? sessionDate.toLocaleDateString(undefined, { month: "short" }) : "";
  const fullDate = validDate
    ? sessionDate.toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long", year: "numeric" })
    : session.date;

  const courseTitle = course?.title || "Unknown Course";

  return (
    //CHANGED: the plain text lines were replaced with a card that has 3 parts: the date tile, the session details and the buttons
    <article className="study-session-card">
      {/*NEW: the date tile on the left. aria-hidden because the full date is already written in the details*/}
      <div className="session-date" aria-hidden="true">
        <span className="session-month">{month}</span>
        <span className="session-day">{day}</span>
      </div>

      <div className="session-info">
        <h3 className="session-title">{courseTitle}</h3>

        {/*the date, start time and duration are small rounded tags instead of 3 separate lines*/}
        <p className="session-meta">
          <span>{fullDate}</span>
          <span>{session.startTime}</span>
          <span>{session.duration} min</span>
        </p>

        <p className="session-description">{session.description}</p>
      </div>

      {/*the aria-label makes a screen reader say which session the button is for*/}
      <div className="session-actions">
        <button
          className="btn btn-sm btn-ghost"
          aria-label={`Edit session for ${courseTitle}`}
          onClick={() => onEditSession(session)}
        >
          Edit
        </button>

        <button
          className="btn btn-sm btn-danger"
          aria-label={`Delete session for ${courseTitle}`}
          onClick={() => onDeleteSession(session.id)}
        >
          Delete
        </button>
      </div>
    </article>
  );
}
