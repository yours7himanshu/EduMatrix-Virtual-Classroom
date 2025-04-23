import React, { useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { Upload, FilePlus, FileText, X, CheckCircle2, Copy, AlertCircle } from "lucide-react";
import Layout from "../Layout/Layout";

const Notes = () => {
  const [pdfFile, setPdfFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [summary, setSummary] = useState("");
  const [showSummary, setShowSummary] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // Function to convert markdown to HTML for display
  const formatMarkdown = (text) => {
    if (!text) return "";
    
    let formatted = text.replace(/\*\*(.*?)\*\*/g, '<span class="font-bold">$1</span>');
    
    formatted = formatted.split('\n\n').map((paragraph, index) => 
      paragraph.trim() ? `<p key=${index} class="mb-3">${paragraph}</p>` : ''
    ).join('');
    
    return formatted;
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === "application/pdf") {
      setPdfFile(file);
      console.log("Selected file:", file);
      setFileName(file.name);
    } else {
      toast.error("Please select a valid PDF file");
      setPdfFile(null);
      setFileName("");
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type === "application/pdf") {
      setPdfFile(file);
      setFileName(file.name);
    } else {
      toast.error("Please select a valid PDF file");
    }
  };

  const resetFileSelection = () => {
    setPdfFile(null);
    setFileName("");
    setUploadProgress(0);
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!pdfFile) {
      toast.error("Please upload a PDF file first");
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("pdf", pdfFile);

      const response = await axios.post(`${backendUrl}/api/summarize`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percentCompleted);
        },
      });

      if (response.data.success) {
        toast.success("Summary generated successfully");
        setSummary(response.data.summary);
        setShowSummary(true);

        resetFileSelection();
      } else {
        toast.error("Upload failed");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error(error.response?.data?.message || "An error occurred while uploading");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(summary)
      .then(() => toast.success("Summary copied to clipboard"))
      .catch(() => toast.error("Failed to copy summary"));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br ml-[10%] w-full from-blue-50 to-indigo-50 py-12 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl tracking-tight mb-3">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
            Topic Summarizer for Students
            </span>
          </h1>
          <p className="text-sm text-gray-600 max-w-2xl mx-auto">
            Quickly generate summaries from your PDF notes with our AI-powered summarizer.

          </p>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Upload Section */}
          <div className="p-8">
            <div
              className={`border-2 border-dashed rounded-xl p-10 mb-8 text-center transition-all duration-300 ease-in-out
                ${pdfFile 
                  ? "border-green-400 bg-green-50" 
                  : dragActive 
                    ? "border-blue-500 bg-blue-50" 
                    : "border-gray-300 hover:border-blue-400 bg-gray-50"
                }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {!pdfFile ? (
                <div className="space-y-6">
                  <div className="flex justify-center">
                    <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center">
                      <Upload
                        size={40}
                        className="text-blue-600"
                      />
                    </div>
                  </div>
                  <div>
                    <p className="text-xl font-semibold text-gray-800">
                      Drag and drop your PDF file here
                    </p>
                    <p className="text-gray-500 mt-2">or</p>
                  </div>
                  <div>
                    <label
                      htmlFor="file-upload"
                      className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-lg font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer transition-colors shadow-md"
                    >
                      <FilePlus className="mr-2" size={20} />
                      Browse Files
                    </label>
                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      className="sr-only"
                      accept="application/pdf"
                      onChange={handleFileChange}
                    />
                  </div>
                  <div className="flex items-center justify-center mt-4 text-sm text-gray-500">
                    <AlertCircle size={16} className="mr-2" />
                    <p>Supported file type: PDF (Max size: 10MB)</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex justify-center">
                    <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
                      <CheckCircle2
                        size={40}
                        className="text-green-600"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-center space-x-3">
                    <FileText className="text-gray-700" size={24} />
                    <span className="text-xl font-medium text-gray-800 truncate max-w-md">
                      {fileName}
                    </span>
                    <button
                      onClick={resetFileSelection}
                      className="text-gray-500 hover:text-red-500 focus:outline-none transition-colors p-1 rounded-full hover:bg-red-50"
                      title="Remove file"
                    >
                      <X size={20} />
                    </button>
                  </div>
                  {uploadProgress > 0 && uploadProgress < 100 && (
                    <div className="w-full max-w-md mx-auto">
                      <div className="relative pt-1">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <span className="text-xs font-semibold inline-block text-blue-600">
                              Uploading...
                            </span>
                          </div>
                          <div>
                            <span className="text-xs font-semibold inline-block text-blue-600">
                              {uploadProgress}%
                            </span>
                          </div>
                        </div>
                        <div className="overflow-hidden h-2 mb-4 text-xs flex rounded-full bg-blue-100">
                          <div
                            className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-300 ease-in-out"
                            style={{ width: `${uploadProgress}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={resetFileSelection}
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                disabled={!pdfFile || loading}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUpload}
                disabled={!pdfFile || loading}
                className={`px-6 py-3 rounded-lg font-medium text-white shadow-md transition-colors
                  ${!pdfFile || loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  }`}
              >
                {loading ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Upload className="mr-2" size={18} />
                    Upload Notes
                  </div>
                )}
              </button>
            </div>
          </div>

          {/* Summary Section */}
          {showSummary && (
            <div className="border-t border-gray-200 bg-gray-50 p-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">Top Questions Generated from your pdf</h2>
                <button
                  onClick={copyToClipboard}
                  className="flex items-center text-blue-600 hover:text-blue-800 transition-colors focus:outline-none"
                >
                  <Copy size={18} className="mr-1" />
                  <span>Copy</span>
                </button>
              </div>
              <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                <div
                  className="prose max-w-none text-gray-700"
                  dangerouslySetInnerHTML={{ __html: formatMarkdown(summary) }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Help Text */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>Need help? Contact the IT support team for assistance.</p>
        </div>
      </div>
    </div>
  );
};

export default Layout()(Notes);