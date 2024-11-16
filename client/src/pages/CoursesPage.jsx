
import  { useState } from 'react';
import { Search, Clock, ArrowRight, GraduationCap } from 'lucide-react';

const CoursesPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = [
    'All',
    'Engineering',
    'Management',
    'Medical & Pharmacy',
    'Science & Technology',
    'Arts & Humanities',
    'Law',
    'Commerce'
  ];

  const courses = [
    {
      id: 1,
      category: 'Engineering',
      courses: [
        {
          name: 'B.Tech',
          fullName: 'Bachelor of Technology',
          duration: '4 Years',
          specializations: [
            'Computer Science & Engineering',
            'Artificial Intelligence & ML',
            'Information Technology',
            'Electrical Engineering',
            'Mechanical Engineering',
            'Civil Engineering',
            'Electronics & Communication',
            'Chemical Engineering',
            'Aerospace Engineering'
          ]
        },
        {
          name: 'M.Tech',
          fullName: 'Master of Technology',
          duration: '2 Years',
          specializations: [
            'Data Science',
            'AI & Robotics',
            'VLSI Design',
            'Structural Engineering',
            'Power Systems'
          ]
        }
      ]
    },
    {
      id: 2,
      category: 'Management',
      courses: [
        {
          name: 'BBA',
          fullName: 'Bachelor of Business Administration',
          duration: '3 Years',
          specializations: [
            'Finance',
            'Marketing',
            'Human Resources',
            'International Business',
            'Digital Marketing'
          ]
        },
        {
          name: 'MBA',
          fullName: 'Master of Business Administration',
          duration: '2 Years',
          specializations: [
            'Finance Management',
            'Marketing Management',
            'Human Resource Management',
            'Operations Management',
            'Business Analytics',
            'International Business',
            'Healthcare Management',
            'IT Management'
          ]
        }
      ]
    },
    {
      id: 3,
      category: 'Medical & Pharmacy',
      courses: [
        {
          name: 'MBBS',
          fullName: 'Bachelor of Medicine and Bachelor of Surgery',
          duration: '5.5 Years',
          specializations: [
            'General Medicine',
            'Surgery',
            'Pediatrics',
            'Gynecology',
            'Orthopedics',
            'Cardiology',
            'Neurology',
            'Dermatology'
          ]
        },
        {
          name: 'B.Pharma',
          fullName: 'Bachelor of Pharmacy',
          duration: '4 Years',
          specializations: [
            'Pharmaceutics',
            'Pharmacology',
            'Clinical Research',
            'Drug Discovery',
            'Healthcare Management',
            'Quality Assurance',
            'Regulatory Affairs'
          ]
        },
        {
          name: 'BDS',
          fullName: 'Bachelor of Dental Surgery',
          duration: '5 Years',
          specializations: [
            'Orthodontics',
            'Periodontics',
            'Oral Surgery',
            'Endodontics',
            'Prosthodontics',
            'Pediatric Dentistry'
          ]
        }
      ]
    },
    {
      id: 4,
      category: 'Science & Technology',
      courses: [
        {
          name: 'BSc',
          fullName: 'Bachelor of Science',
          duration: '3 Years',
          specializations: [
            'Computer Science',
            'Data Science',
            'Artificial Intelligence',
            'Physics',
            'Chemistry',
            'Mathematics',
            'Biotechnology',
            'Environmental Science'
          ]
        },
        {
          name: 'MSc',
          fullName: 'Master of Science',
          duration: '2 Years',
          specializations: [
            'Advanced Computing',
            'Bioinformatics',
            'Quantum Computing',
            'Nanoscience',
            'Applied Mathematics',
            'Molecular Biology'
          ]
        }
      ]
    },
    {
      id: 5,
      category: 'Arts & Humanities',
      courses: [
        {
          name: 'BA',
          fullName: 'Bachelor of Arts',
          duration: '3 Years',
          specializations: [
            'Psychology',
            'English Literature',
            'Political Science',
            'Sociology',
            'Economics',
            'History',
            'Philosophy',
            'Journalism'
          ]
        },
        {
          name: 'MA',
          fullName: 'Master of Arts',
          duration: '2 Years',
          specializations: [
            'Clinical Psychology',
            'International Relations',
            'Public Policy',
            'Mass Communication',
            'Development Studies',
            'Applied Philosophy',
            'Cultural Studies'
          ]
        },
        {
          name: 'BFA',
          fullName: 'Bachelor of Fine Arts',
          duration: '4 Years',
          specializations: [
            'Painting',
            'Sculpture',
            'Photography',
            'Digital Arts',
            'Animation',
            'Graphic Design'
          ]
        }
      ]
    },
    {
      id: 6,
      category: 'Law',
      courses: [
        {
          name: 'LLB',
          fullName: 'Bachelor of Legislative Law',
          duration: '3 Years',
          specializations: [
            'Corporate Law',
            'Criminal Law',
            'Civil Law',
            'Constitutional Law',
            'International Law',
            'Intellectual Property Law',
            'Human Rights Law'
          ]
        },
        {
          name: 'LLM',
          fullName: 'Master of Laws',
          duration: '2 Years',
          specializations: [
            'Business Law',
            'Criminal Justice',
            'International Law',
            'Environmental Law',
            'Cyber Law',
            'Banking Law'
          ]
        },
        {
          name: 'BBA LLB',
          fullName: 'Integrated BBA LLB',
          duration: '5 Years',
          specializations: [
            'Business Law',
            'Corporate Law',
            'Intellectual Property',
            'Banking Law',
            'Tax Law',
            'Company Law'
          ]
        }
      ]
    },
    {
      id: 7,
      category: 'Commerce',
      courses: [
        {
          name: 'B.Com',
          fullName: 'Bachelor of Commerce',
          duration: '3 Years',
          specializations: [
            'Accounting & Finance',
            'Banking & Insurance',
            'Taxation',
            'Business Economics',
            'E-Commerce',
            'Financial Markets',
            'Cost Accounting'
          ]
        },
        {
          name: 'M.Com',
          fullName: 'Master of Commerce',
          duration: '2 Years',
          specializations: [
            'Advanced Accounting',
            'Financial Analysis',
            'Business Statistics',
            'Marketing Research',
            'International Trade',
            'Investment Management',
            'Corporate Finance'
          ]
        },
        {
          name: 'CMA',
          fullName: 'Cost and Management Accountant',
          duration: '3 Years',
          specializations: [
            'Cost Accounting',
            'Financial Management',
            'Strategic Management',
            'Tax Management',
            'Risk Management',
            'Business Valuation'
          ]
        }
      ]
    }
  ];

  const filteredCourses = courses
    .filter(category => selectedCategory === 'All' || category.category === selectedCategory)
    .map(category => ({
      ...category,
      courses: category.courses.filter(course =>
        course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.specializations.some(spec => spec.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }))
    .filter(category => category.courses.length > 0); // Keep only categories with matching courses

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-violet-500 to-blue-600 text-white py-12 px-6 rounded-md mb-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-4">Professional Degree Programs</h1>
          <p className="text-xl text-blue-100">Shape your future with our comprehensive range of professional courses</p>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="max-w-7xl mx-auto px-6 mb-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search courses or specializations..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <select
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Courses Section */}
      <div className="max-w-7xl mx-auto px-6 pb-12">
        {filteredCourses.length > 0 ? (
          filteredCourses.map(category => (
            <div key={category.id} className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <GraduationCap className="h-8 w-8 text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-900">{category.category}</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {category.courses.map((course, idx) => (
                  <div 
                    key={idx} 
                    className="bg-white rounded-lg shadow hover:shadow-lg transition-all duration-300 border-t-4 border-t-blue-600 p-6"
                  >
                    <div className="mb-4">
                      <h3 className="text-2xl font-bold text-gray-900 mb-1">{course.name}</h3>
                      <p className="text-sm text-gray-600">{course.fullName}</p>
                    </div>
                    
                    <div className="flex items-center gap-2 mb-4 text-sm text-gray-600">
                      <Clock className="h-4 w-4" />
                      <span>{course.duration}</span>
                    </div>

                    <div className="mb-4">
                      <h4 className="text-sm font-semibold mb-2">Specializations</h4>
                      <div className="flex flex-wrap gap-2">
                        {course.specializations.map((spec, index) => (
                          <span
                            key={index}
                            className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full"
                          >
                            {spec}
                          </span>
                        ))}
                      </div>
                    </div>

                    <button className="w-full mt-4 flex items-center justify-center gap-2 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      <span>View Details</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No courses found</h3>
            <p className="text-gray-600">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CoursesPage;
