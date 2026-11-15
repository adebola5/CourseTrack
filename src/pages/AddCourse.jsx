//this page displays the form to add new courses
import AddCourseForm from '../components/AddCourseForm';
export default function AddCourse({ onAddCourse }){
    return(
      <main id="main-content" tabIndex={-1} /*NEW: id is what the skip link in the navbar jumps to, tabIndex -1 lets it receive focus when that happens*/>
        {/*CHANGED: the plain h2 was replaced with a page header so it matches the other pages*/}
        <header className="page-header">
          <span className="eyebrow">New entry</span>
          <h1>Add a new course</h1>
          <p className="page-subtitle">Fill in the details below and it will appear on your dashboard straight away.</p>
        </header>

        {/*NEW: form-layout puts the form on the left and the tips panel on the right (on small screens they stack)*/}
        <div className="form-layout">
          {/*calls the component that has the form*/}
          <AddCourseForm onAddCourse={onAddCourse} />

          {/*NEW: side panel that explains how each status behaves. its only text, nothing here changes how the form works*/}
          <aside className="panel tips-panel">
            <h2 className="panel-title">How status works</h2>
            <p className="panel-hint">Progress follows the status you pick.</p>
            <ul className="tips-list">
              <li className="tip-progress"><strong>In Progress</strong>You choose the progress from 0 to 100.</li>
              <li className="tip-completed"><strong>Completed</strong>Progress is set to 100% for you.</li>
              <li className="tip-planned"><strong>Planned</strong>Not started yet, so progress stays locked.</li>
            </ul>
          </aside>
        </div>
      </main>
    )
}
