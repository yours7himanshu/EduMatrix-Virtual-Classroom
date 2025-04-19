import React, { useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { Upload, FilePlus, FileText, X, CheckCircle2, Copy } from "lucide-react";
import AppLayout from "../layout/AppLayout";

const NotesUpload = () => {
  const [pdfFile, setPdfFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [summary, setSummary] = useState("");
  const [showSummary, setShowSummary] = useState(false);

  // Function to convert markdown to HTML for display
  const formatMarkdown = (text) => {
    if (!text) return "";
    
    // Replace bold markdown with span elements
    let formatted = text.replace(/\*\*(.*?)\*\*/g, '<span class="font-bold">$1</span>');
    
    // Convert newlines to paragraphs
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
  };

  const handleDrop = (e) => {
    e.preventDefault();
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

      const response = await axios.post(`${backendUrl}/api/notesUpload`, formData, {
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
        toast.success("File uploaded successfully");
        console.log(response.data.pdfUrl)
        console.log(response.data.summary)
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

  return (
    <div className="p-6 max-w-4xl flex flex-col  mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Upload Course Notes</h1>
        <p className="text-gray-600">
          Upload PDF notes for your students. All files will be available in the course materials section.
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-md ">
        <div className="p-6">
          <div
            className={`border-2 border-dashed rounded-lg p-8 mb-6 text-center ${
              pdfFile ? "border-green-400 bg-green-50" : "border-gray-300 hover:border-blue-400"
            } transition-all duration-200 ease-in-out`}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            {!pdfFile ? (
              <div className="space-y-4">
                <div className="flex justify-center">
                  <Upload
                    size={48}
                    className="text-blue-500"
                  />
                </div>
                <div>
                  <p className="text-lg font-medium text-gray-700">
                    Drag and drop your PDF file here
                  </p>
                  <p className="text-sm text-gray-500 mt-1">or</p>
                </div>
                <div>
                  <label
                    htmlFor="file-upload"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer transition-colors"
                  >
                    <FilePlus className="mr-2" size={18} />
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
                <p className="text-xs text-gray-500">
                  Supported file type: PDF (Max size: 10MB)
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-center">
                  <CheckCircle2
                    size={48}
                    className="text-green-500"
                  />
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <FileText className="text-gray-600" size={20} />
                  <span className="text-lg font-medium text-gray-700 truncate max-w-xs">
                    {fileName}
                  </span>
                  <button
                    onClick={resetFileSelection}
                    className="text-gray-500 hover:text-red-500 focus:outline-none"
                    title="Remove file"
                  >
                    <X size={20} />
                  </button>
                </div>
                {uploadProgress > 0 && uploadProgress < 100 && (
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-in-out"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={resetFileSelection}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={!pdfFile || loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              onClick={handleUpload}
              disabled={!pdfFile || loading}
              className={`inline-flex items-center px-4 py-2 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                !pdfFile || loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              <Upload className="mr-2" size={18} />
              {loading ? "Uploading..." : "Upload PDF"}
            </button>
          </div>
        </div>
      </div>

      <div className="mt-8 bg-white rounded-xl shadow-md">
        {showSummary && summary ? (
          <div className="p-6">
            <div className="flex items-center mb-4">
              <FileText className="h-6 w-6 text-blue-500 mr-2" />
              <h2 className="text-xl font-semibold text-gray-800">Document Summary</h2>
            </div>
            
            <div className="bg-gray-50 p-5 rounded-lg border border-gray-100">
              <div 
                className="prose max-w-none text-gray-700 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: formatMarkdown(summary) }}
              />
            </div>
            
            <div className="mt-4 flex justify-end">
              <button
                className="flex items-center text-sm text-blue-600 hover:text-blue-800 transition-colors"
                onClick={() => {navigator.clipboard.writeText(summary); toast.success("Summary copied to clipboard");}}
              >
                <Copy className="h-4 w-4 mr-1" />
                Copy to clipboard
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default AppLayout()(NotesUpload);