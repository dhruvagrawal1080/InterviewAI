import axios from 'axios';
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { setIsResumeUploaded } from '../slices/generalInfo.slice';

const UploadBox = () => {
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfName, setPdfName] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { userId } = useSelector((state) => state.generalInfo);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === "application/pdf") {
      setPdfFile(file);
      setPdfName(file.name);
    } else {
      setPdfFile(null);
      setPdfName("");
      toast.error("Please select a valid PDF file");
    }
  };

  const handleUpload = async () => {
    if (!pdfFile && !description.trim()) {
      toast.error("Please upload a PDF file or provide a description");
      return;
    }

    setIsLoading(true);

    try {
      const formData = new FormData();

      if (pdfFile) {
        formData.append('resume', pdfFile);
      }

      if (description.trim()) {
        formData.append('description', description.trim());
      }

      formData.append('userId', userId);

      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/check`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        toast.success(response.data.message || "Resume uploaded successfully!");
        dispatch(setIsResumeUploaded(true));
        setPdfFile(null);
        setPdfName("");
        setDescription("");
        navigate('/interview')
      }
    } catch (error) {
      console.error('Upload error:', error);
      const errorMessage = error.response?.data?.error || "Failed to upload resume";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gray-900 shadow-md p-6 md:p-8 flex flex-col h-full">
      <div className="flex flex-col md:flex-row space-y-6 md:space-y-0 md:space-x-6 h-full">
        {/* Resume Upload */}
        <div className="w-full md:w-1/2 bg-gray-800">
          <div className="border-2 border-dashed border-gray-700 rounded-lg p-8 h-full flex flex-col items-center justify-center text-center hover:border-accent transition">
            <div className="w-20 h-20 text-3xl bg-blue-900/20 rounded-full flex items-center justify-center mb-4">
              📄
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Upload Your Resume
            </h3>
            <p className="text-gray-400 text-sm mb-4">
              PDF (Max 5MB)
            </p>
            <label
              htmlFor="resume-upload"
              className={`bg-[#38BDF8] hover:bg-blue-500 text-white font-medium rounded-lg px-6 py-2 transition ${isLoading ? "cursor-not-allowed" : "cursor-pointer"}`}
            >
              Choose File
            </label>
            <input
              id="resume-upload"
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={handleFileChange}
              disabled={isLoading}
            />
            <p className="text-gray-400 text-sm mt-4">
              {pdfName || "No file selected"}
            </p>
          </div>
        </div>

        {/* Description Input */}
        <div className="w-full md:w-1/2">
          <div className="h-full flex flex-col">
            <h3 className="text-xl font-semibold text-white mb-4">
              Or Describe Yourself
            </h3>
            <textarea
              className={`w-full h-full p-4 border border-gray-700 rounded-lg bg-gray-800 text-gray-200 focus:outline-none focus:ring-2 focus:ring-accent resize-none ${isLoading && "cursor-not-allowed"}`}
              placeholder="Describe your background, experience, or the job you're targeting…"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isLoading}
            ></textarea>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="mt-8 text-center">
        <button
          onClick={handleUpload}
          disabled={isLoading}
          className={`bg-[#38BDF8] hover:bg-blue-500 text-white font-semibold rounded-lg px-8 py-4 transition flex items-center justify-center mx-auto ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Processing...
            </>
          ) : (
            '✨ Generate Interview'
          )}
        </button>
      </div>
    </div>
  )
}

export default UploadBox