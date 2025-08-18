import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

export default function UploadRoute({ children }) {
  const { isResumeUploaded, isChatStarted } = useSelector((state) => state.generalInfo);

  if (isResumeUploaded && isChatStarted) {
    return <Navigate to="/interview" replace />;
  }
  return children;
}