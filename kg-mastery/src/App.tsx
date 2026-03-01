import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { getAuthToken } from "@/lib/utils";
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import Courses from "@/pages/Courses";
import CourseDetail from "@/pages/CourseDetail";

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const token = getAuthToken();
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/courses"
          element={
            <PrivateRoute>
              <Courses />
            </PrivateRoute>
          }
        />
        <Route
          path="/courses/:id"
          element={
            <PrivateRoute>
              <CourseDetail />
            </PrivateRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
