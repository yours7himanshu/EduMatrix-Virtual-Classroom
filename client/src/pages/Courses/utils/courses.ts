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

interface Course{

  name:string;
  fullName:string;
  duration:string;
  specializations:string[]

}


interface Category {
  id:number;
  category:string;
  courses:Course[]
}


const courses : Category[] = [
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
        // {
        //   name: 'M.Tech',
        //   fullName: 'Master of Technology',
        //   duration: '2 Years',
        //   specializations: [
        //     'Data Science',
        //     'AI & Robotics',
        //     'VLSI Design',
        //     'Structural Engineering',
        //     'Power Systems'
        //   ]
        // }
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


  export default courses