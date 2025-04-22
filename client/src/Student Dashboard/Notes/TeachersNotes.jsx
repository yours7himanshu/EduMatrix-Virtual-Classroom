import { useEffect, useState } from "react";
import axios from 'axios';
import { Link } from "react-router-dom";
import { FileText, Search, Download, Clock, BookOpen, Filter, Bookmark, ChevronRight, Star, Calendar, Book } from 'lucide-react';
import Layout from "../Layout/Layout";
const TeachersNotes = () => {
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    const [notes, setNotes] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredNotes, setFilteredNotes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeCategory, setActiveCategory] = useState('all');
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
    const [highlightedNote, setHighlightedNote] = useState(null);

    useEffect(() => {
        const getNotes = async () => {
            setIsLoading(true);
            try {
                const response = await axios.get(`${backendUrl}/api/pdf`);
                if (response.data.success) {
                    // Add some metadata for better UI representation
                    const notesWithMetadata = response.data.notes.map((note, index) => ({
                        ...note,
                        // Extract filename from path
                        fileName: note.notes.split('/').pop(),
                        // Add placeholder for category if not present
                        category: note.category || ['General', 'Lecture Notes', 'Study Material', 'Reference', 'Assignment'][Math.floor(Math.random() * 5)],
                        // Add date if available or use current date
                        uploadDate: note.uploadDate || new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString(),
                        // Add random page count for demonstration
                        pages: Math.floor(Math.random() * 50) + 5
                    }));
                    setNotes(notesWithMetadata);
                    setFilteredNotes(notesWithMetadata);
                    console.log(notesWithMetadata);
                }
            } catch (error) {
                console.log("Some error occurred", error);
                setError("Failed to load notes. Please try again later.");
            } finally {
                setIsLoading(false);
            }
        };
        getNotes();
    }, []);

    // Filter notes based on search term and active category
    useEffect(() => {
        let result = notes;
        
        if (searchTerm) {
            result = result.filter(note => 
                note.fileName.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        
        if (activeCategory !== 'all') {
            result = result.filter(note => note.category === activeCategory);
        }
        
        setFilteredNotes(result);
    }, [searchTerm, activeCategory, notes]);

    // Get unique categories from notes
    const categories = ['all', ...new Set(notes.map(note => note.category))];

    // Function to format date
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
    };

    // Function to get file extension
    const getFileExtension = (fileName) => {
        return fileName.split('.').pop().toLowerCase();
    };

    // Function to get appropriate icon based on file type
    const getFileIcon = (fileName) => {
        const extension = getFileExtension(fileName);
        switch(extension) {
            case 'pdf':
                return <FileText className="w-6 h-6 text-blue-600" />;
            case 'doc':
            case 'docx':
                return <FileText className="w-6 h-6 text-blue-600" />;
            case 'ppt':
            case 'pptx':
                return <FileText className="w-6 h-6 text-blue-600" />;
            default:
                return <FileText className="w-6 h-6 text-blue-600" />;
        }
    };

    return (
        <div className="bg-white rounded-lg mt-10 shadow-md p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8 border-b border-gray-200 pb-6">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Teacher's Notes</h1>
                <p className="text-gray-600">Access and download study materials shared by your teachers</p>
                
                <div className="flex flex-wrap gap-4 mt-4">
                    <div className="bg-gray-50 rounded-lg px-4 py-2 text-gray-700 flex items-center">
                        <Book className="h-5 w-5 mr-2 text-blue-600" />
                        <span>{notes.length} Notes Available</span>
                    </div>
                    <div className="bg-gray-50 rounded-lg px-4 py-2 text-gray-700 flex items-center">
                        <Calendar className="h-5 w-5 mr-2 text-blue-600" />
                        <span>Last Updated: {notes.length > 0 ? formatDate(new Date().toISOString()) : 'N/A'}</span>
                    </div>
                </div>
            </div>

            {/* Search and Filter Bar */}
            <div className="bg-gray-50 rounded-lg p-4 mb-8 flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-grow">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search notes by filename..."
                        className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-700 bg-white"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                
                <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                        <Filter className="h-5 w-5 text-gray-400 mr-2" />
                        <select 
                            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-700 bg-white"
                            value={activeCategory}
                            onChange={(e) => setActiveCategory(e.target.value)}
                        >
                            {categories.map((category, index) => (
                                <option key={index} value={category}>
                                    {category === 'all' ? 'All Categories' : category}
                                </option>
                            ))}
                        </select>
                    </div>
                    
                    <div className="flex bg-gray-200 rounded-lg p-1">
                        <button 
                            className={`px-3 py-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-600 hover:text-gray-800'}`}
                            onClick={() => setViewMode('grid')}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                            </svg>
                        </button>
                        <button 
                            className={`px-3 py-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-600 hover:text-gray-800'}`}
                            onClick={() => setViewMode('list')}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Notes Display */}
            {isLoading ? (
                <div className="flex justify-center items-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
                </div>
            ) : error ? (
                <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg">
                    <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="font-medium">{error}</p>
                    </div>
                </div>
            ) : filteredNotes.length === 0 ? (
                <div className="text-center py-16 bg-gray-50 rounded-lg">
                    <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">No notes found</h3>
                    <p className="text-gray-600 max-w-md mx-auto">
                        {searchTerm || activeCategory !== 'all' 
                            ? "Try adjusting your search or filter criteria to find what you're looking for." 
                            : "Your teachers haven't uploaded any notes yet. Check back later for updates!"}
                    </p>
                </div>
            ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredNotes.map((note, index) => (
                        <div 
                            key={index} 
                            className="group bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
                            onMouseEnter={() => setHighlightedNote(index)}
                            onMouseLeave={() => setHighlightedNote(null)}
                        >
                            {/* Top border accent */}
                            <div className="h-1 bg-blue-600"></div>
                            
                            <div className="p-5">
                                <div className="flex items-start mb-4">
                                    <div className="p-3 rounded-lg bg-blue-50">
                                        {getFileIcon(note.fileName)}
                                    </div>
                                    <div className="ml-4 flex-grow">
                                        <h3 className="font-semibold text-gray-800 line-clamp-2 group-hover:text-blue-600 transition-colors">
                                            {note.fileName}
                                        </h3>
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            <span className="inline-block bg-gray-100 text-gray-700 text-xs px-2.5 py-1 rounded-full font-medium">
                                                {note.category}
                                            </span>
                                            <span className="inline-block bg-gray-100 text-gray-700 text-xs px-2.5 py-1 rounded-full">
                                                {note.pages} pages
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="flex items-center text-sm text-gray-500 mb-4">
                                    <Clock className="h-4 w-4 mr-1.5" />
                                    <span>{formatDate(note.uploadDate)}</span>
                                </div>
                                
                                <Link 
                                    to={note.notes} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center w-full bg-blue-600 text-white py-2 px-4 rounded-lg transition-all duration-300 hover:bg-blue-700"
                                >
                                    <Download className="h-5 w-5 mr-2" />
                                    Download Note
                                </Link>
                            </div>
                            
                            {/* Bookmark icon in corner */}
                            <button className="absolute top-4 right-4 p-1.5 bg-white rounded-full shadow-sm text-gray-400 hover:text-blue-600 transition-colors">
                                <Bookmark className="h-5 w-5" />
                            </button>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredNotes.map((note, index) => (
                        <div 
                            key={index} 
                            className="group bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex items-center"
                            onMouseEnter={() => setHighlightedNote(index)}
                            onMouseLeave={() => setHighlightedNote(null)}
                        >
                            <div className="w-1 self-stretch bg-blue-600"></div>
                            
                            <div className="p-4 flex-grow flex items-center">
                                <div className="p-3 rounded-lg bg-blue-50 mr-4">
                                    {getFileIcon(note.fileName)}
                                </div>
                                
                                <div className="flex-grow">
                                    <h3 className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                                        {note.fileName}
                                    </h3>
                                    <div className="flex items-center text-sm text-gray-500 mt-1">
                                        <Clock className="h-4 w-4 mr-1.5" />
                                        <span className="mr-3">{formatDate(note.uploadDate)}</span>
                                        <span className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-0.5 rounded-full">
                                            {note.category}
                                        </span>
                                    </div>
                                </div>
                                
                                <Link 
                                    to={note.notes} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="flex items-center bg-blue-600 text-white py-2 px-4 rounded-lg transition-all duration-300 hover:bg-blue-700"
                                >
                                    <Download className="h-4 w-4 mr-2" />
                                    Download
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {filteredNotes.length > 0 && (
                <div className="flex justify-center mt-8">
                    <nav className="inline-flex items-center bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                        <button className="px-4 py-2 border-r border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-blue-600 transition-colors flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            Previous
                        </button>
                        <button className="px-4 py-2 bg-blue-600 text-white font-medium">1</button>
                        <button className="px-4 py-2 border-l border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-blue-600 transition-colors flex items-center">
                            Next
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </nav>
                </div>
            )}
        </div>
    );
};

export default Layout()(TeachersNotes);