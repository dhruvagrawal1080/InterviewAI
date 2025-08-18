import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Route, Routes } from "react-router-dom";
import { toast, Toaster } from "sonner";
import { v4 as uuidv4 } from "uuid";
import InterviewRoute from "./components/InterviewRoute";
import Navbar from "./components/Navbar";
import UploadRoute from "./components/UploadRoute";
import Home from "./pages/HomePage";
import InterviewPage from "./pages/InterviewPage";
import SummaryPage from "./pages/SummaryPage";
import UploadPage from "./pages/UploadPage";
import { setUserId } from "./slices/generalInfo.slice";
import { pingServer } from "./util/pingServer";


function App() {
  const dispatch = useDispatch();
  const { userId } = useSelector((state) => state.generalInfo);

  useEffect(() => {
    const loadingToast = toast.loading("Starting server...");

    const checkServer = async () => {
      try {
        await pingServer();
        toast.success("Server started successfully!", {
          id: loadingToast,
          duration: 3000,
        });
      } catch (err) {
        toast.error("Failed to start server", {
          id: loadingToast,
          duration: 3000,
        });
      }
    };

    checkServer()
  }, []);

  useEffect(() => {
    if (!userId) {
      const newId = uuidv4();
      dispatch(setUserId(newId));
    }
  }, [userId, dispatch]);

  return (
    <div className="h-screen w-screen overflow-auto no-scrollbar">
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/upload"
          element={
            <UploadRoute>
              <UploadPage />
            </UploadRoute>
          }
        />
        <Route
          path="/interview"
          element={
            <InterviewRoute>
              <InterviewPage />
            </InterviewRoute>
          }
        />
        <Route
          path="/summary"
          element={
            <SummaryPage />
          }
        />
      </Routes>

      <Toaster
        position="top-center"
        richColors
        closeButton
        duration={4000}
      />
    </div>
  );
}

export default App;