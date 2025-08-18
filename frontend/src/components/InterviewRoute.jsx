import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

export default function InterviewRoute({ children }) {
  const { isResumeUploaded } = useSelector((state) => state.generalInfo);

  if (!isResumeUploaded) {
    return <Navigate to="/upload" replace />;
  }

  return children;
}