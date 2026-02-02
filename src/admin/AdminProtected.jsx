import { Navigate } from "react-router-dom";

export default function AdminProtected({ children }) {
  const admin = localStorage.getItem("admin");

  if (!admin) {
    return <Navigate to="/admin-login" replace />;
  }

  return children;
}