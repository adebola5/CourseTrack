import { Navigate } from "react-router-dom";

//checks whether the user is allowed to access a page
export default function ProtectedRoute({ isLoggedIn, children }) {

  //redirects the user to the login page if they are not logged in
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  //displays the requested page if the user is logged in
  return children;
}