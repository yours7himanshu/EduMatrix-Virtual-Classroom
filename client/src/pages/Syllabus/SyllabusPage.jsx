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

const SyllabusPage = () => {
  // Syllabus data
  const syllabus = [
    {
      id: 1,
      course: "Computer Science 101",
      description:
        "This introductory course covers the basics of computer science, programming, and data structures. It is designed for students who are new to programming.",
      schedule: "Mon, Wed, Fri - 9:00 AM to 11:00 AM",
      topics: [
        "Introduction to Computer Science",
        "Basic Programming Concepts",
        "Functions and Modular Programming",
        "Data Structures",
        "Algorithms and Complexity",
        "Basic File I/O",
        "Introduction to Object-Oriented Programming",
      ],
      syllabusLink: "/syllabus/cs101.pdf",
    },
    {
      id: 2,
      course: "Mathematics 101",
      description:
        "This course provides an overview of fundamental mathematical concepts that are crucial for computer science, including algebra, calculus, and discrete mathematics.",
      schedule: "Tue, Thu - 10:00 AM to 12:00 PM",
      topics: [
        "Algebra",
        "Calculus",
        "Discrete Mathematics",
        "Matrices and Linear Algebra",
        "Probability and Statistics",
        "Number Theory",
      ],
      syllabusLink: "/syllabus/maths101.pdf",
    },
    {
      id: 3,
      course: "Database Systems",
      description:
        "This course covers the fundamentals of database systems, including relational databases, SQL, normalization, and transaction management.",
      schedule: "Mon, Wed - 2:00 PM to 4:00 PM",
      topics: [
        "Introduction to Databases",
        "Relational Database Model",
        "Structured Query Language (SQL)",
        "Normalization",
        "Database Design",
        "Transactions and Concurrency Control",
        "Indexing and Query Optimization",
      ],
      syllabusLink: "/syllabus/dbms.pdf",
    },
    {
      id: 4,
      course: "Operating Systems",
      description:
        "This course covers the basic concepts and principles of operating systems, including process management, memory management, file systems, and security.",
      schedule: "Tue, Thu - 2:00 PM to 4:00 PM",
      topics: [
        "Introduction to Operating Systems",
        "Process Management",
        "Memory Management",
        "File Systems",
        "Concurrency and Synchronization",
        "Input/Output Management",
        "Security and Protection",
      ],
      syllabusLink: "/syllabus/os.pdf",
    },
    {
      id: 5,
      course: "Software Engineering",
      description:
        "This course introduces the principles and practices of software development, including software life cycle models, requirements engineering, and design patterns.",
      schedule: "Mon, Wed, Fri - 3:00 PM to 5:00 PM",
      topics: [
        "Introduction to Software Engineering",
        "Requirements Engineering",
        "Software Design and Architecture",
        "Software Testing and Quality Assurance",
        "Project Management in Software Engineering",
        "Maintenance and Deployment",
      ],
      syllabusLink: "/syllabus/se.pdf",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-50 to-purple-100 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Page Title */}
        <h1 className="text-4xl font-bold text-center text-purple-700 mb-8">
          Syllabus
        </h1>

        {/* Syllabus Section */}
        <div className="space-y-8">
          {syllabus.map((course) => (
            <div
              key={course.id}
              className="bg-white shadow-lg rounded-lg p-6 border-l-4 border-purple-500"
            >
              {/* Course Title */}
              <h2 className="text-2xl font-semibold text-purple-600 mb-2">
                {course.course}
              </h2>

              {/* Course Description */}
              <p className="text-gray-700 mb-4">{course.description}</p>

              {/* Schedule */}
              <p className="text-gray-600 mb-4">
                <strong>Schedule:</strong> {course.schedule}
              </p>

              {/* Topics List */}
              <ul className="list-disc list-inside space-y-2 mb-4">
                {course.topics.map((topic, index) => (
                  <li key={index} className="text-gray-800">
                    {topic}
                  </li>
                ))}
              </ul>

              {/* Download Syllabus Button */}
              <a
                href={course.syllabusLink}
                download
                className="px-4 py-2 bg-purple-600 text-white font-semibold rounded-lg shadow hover:bg-purple-700 transition-all"
              >
                Download Syllabus
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SyllabusPage;
