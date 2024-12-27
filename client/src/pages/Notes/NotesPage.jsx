/*

Copyright 2024 Himanshu Dinkar

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

const NotesPage = () => {
  // Example Notes Data
  const notes = [
    {
      id: 1,
      title: "Introduction to Algorithms",
      description: "Learn the basics of algorithms and their applications.",
      downloadLink: "/notes/algorithms.pdf",
    },
    {
      id: 2,
      title: "Database Management Systems",
      description:
        "Comprehensive material on database design, normalization, and SQL.",
      downloadLink: "/notes/dbms.pdf",
    },
    {
      id: 3,
      title: "Operating Systems",
      description: "Detailed notes covering process scheduling, memory management, and more.",
      downloadLink: "/notes/os.pdf",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-r from-green-50 to-green-100 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Page Title */}
        <h1 className="text-4xl font-bold text-center text-green-700 mb-8">
          Study Notes
        </h1>

        {/* Notes Material Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {notes.map((note) => (
            <div
              key={note.id}
              className="bg-white shadow-lg rounded-lg p-6 border-l-4 border-green-500"
            >
              <h2 className="text-2xl font-semibold text-green-600 mb-2">
                {note.title}
              </h2>
              <p className="text-gray-700 mb-4">{note.description}</p>
              <a
                href={note.downloadLink}
                download
                className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg shadow hover:bg-green-700 transition-all"
              >
                Download
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NotesPage;
