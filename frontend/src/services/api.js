//this file handles communication between the react frontend and asp.net core api

//gets the api address from the frontend .env file
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

//NEW: the title and messages shown to the user when something goes wrong with the connection or the login session
export const CONNECTION_ERROR_TITLE = "Unable to connect to CourseTrack";
export const CONNECTION_ERROR_MESSAGE =
  "We couldn't reach the server. Please check your connection or try again later.";
export const SESSION_EXPIRED_MESSAGE = "Your session has expired. Please log in again.";

//NEW: the name of the event this file sends to App.jsx when the connection fails or the session expires
export const API_EVENT = "coursetrack:api-event";

//NEW: this file is not a component so it cant show a pop up by itself. it sends an event instead, and App.jsx listens for it and shows the pop up
function notifyApp(type) {
  window.dispatchEvent(new CustomEvent(API_EVENT, { detail: { type } }));
}

//sends requests from the frontend to the backend
export async function apiRequest(endpoint, options = {}) {

  //gets the login token saved in localStorage
  const token = localStorage.getItem("token");

  //CHANGED: the request is now inside try / catch so we can tell when it never reached the server
  let response;

  try {
    //sends the request to the backend
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,

      //sets the request headers
      headers: {
        "Content-Type": "application/json",

        //includes the login token when one is available
        ...(token && { Authorization: `Bearer ${token}` }),

        //allows additional headers to be included
        ...options.headers,
      },
    });
  } catch {
    //fetch only throws when the request could not reach the server at all (server is off, no internet), this is where the raw "Failed to fetch" message comes from
    //so instead of passing that message on we tell App.jsx to show the friendly pop up
    notifyApp("connection-error");

    //handled = true is a flag so the components know App.jsx is already showing this error and they should not show it again
    const connectionError = new Error(CONNECTION_ERROR_MESSAGE);
    connectionError.handled = true;
    throw connectionError;
  }

  //NEW: a 401 on a normal request means the login token has expired (or is no longer valid).
  //login and register are skipped, because a 401 there just means the email or password was wrong
  const isAuthRequest = endpoint.toLowerCase().startsWith("/api/auth/");

  if (response.status === 401 && token && !isAuthRequest) {
    //many requests can fail at the same time when the courses load, so only the first one does the clean up
    if (localStorage.getItem("token") === token) {
      //removes the expired login details
      localStorage.removeItem("token");
      localStorage.removeItem("userName");

      //tells App.jsx to log the user out, go to the login page and show the session expired message
      notifyApp("session-expired");
    }

    const expiredError = new Error(SESSION_EXPIRED_MESSAGE);
    expiredError.handled = true;
    throw expiredError;
  }

  //returns null when the backend responds successfully without data
  if (response.status === 204) {
    return null;
  }

  //converts the backend response into json
  const data = await response.json().catch(() => null);

  //checks whether the request was successful
  if (!response.ok) {
    throw new Error(
      data?.message || data?.title || "Something went wrong"
    );
  }

  //returns the data received from the backend
  return data;
}