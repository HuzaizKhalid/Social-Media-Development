import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Posts from "./pages/Posts";
import Profile from "./pages/Profile";
import Logout from "./pages/Logout";
import Feed from "./pages/Feed";
import Chat from "./pages/Chat";

function App() {
  const isLoggedIn = !!localStorage.getItem("token");

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route
          path="/login"
          element={!isLoggedIn ? <Login /> : <Navigate to="/feed" />}
        />
        <Route
          path="/register"
          element={!isLoggedIn ? <Register /> : <Navigate to="/feed" />}
        />

        {/* Private Routes */}
        <Route
          path="/feed"
          element={isLoggedIn ? <Feed /> : <Navigate to="/login" />}
        />
        <Route
          path="/posts"
          element={isLoggedIn ? <Posts /> : <Navigate to="/login" />}
        />
        <Route
          path="/profile"
          element={isLoggedIn ? <Profile /> : <Navigate to="/login" />}
        />
        <Route
          path="/chat"
          element={isLoggedIn ? <Chat /> : <Navigate to="/login" />}
        />
        <Route
          path="/logout"
          element={isLoggedIn ? <Logout /> : <Navigate to="/login" />}
        />

        {/* Catch-all Route */}
        <Route
          path="*"
          element={<Navigate to={isLoggedIn ? "/feed" : "/login"} />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
