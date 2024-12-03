import mainImage from '../assets/What-is-a-Virtual-Classroom-3.png';

const HomePage = () => {
  return (
    <div className="bg-gray-50 p-4 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="flex flex-wrap justify-between items-center px-6 py-4 bg-white shadow-md rounded-md mb-6">
        <h1 className="text-2xl font-bold text-violet-500">EduMatrix</h1>
        <nav className="space-x-4 flex flex-wrap justify-center">
          <a href="#features" className="text-gray-700 hover:text-blue-700">
            Features
          </a>
          <a href="/liveLecture" className="text-gray-700 hover:text-blue-700">
            Demo
          </a>
          <a
            href="#get-started"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Get Started
          </a>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-violet-500 to-blue-600 text-white py-10 px-6 rounded-md mb-6">
        <div className="container mx-auto flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 space-y-6 text-center md:text-left">
            <h2 className="text-4xl font-extrabold">
              Revolutionize Learning with EduMatrix
            </h2>
            <p className="text-lg">
              An AI-powered smart education system for a seamless virtual
              classroom experience.
            </p>
            <div className="flex flex-wrap justify-center md:justify-start space-x-4">
              <button className="px-6 py-2 bg-white text-blue-600 rounded-lg shadow-md hover:bg-gray-100">
                Explore Features
              </button>
              <button className="px-6 py-2 bg-blue-800 rounded-lg shadow-md hover:bg-blue-900">
                Start Free Trial
              </button>
            </div>
          </div>
          <div className="md:w-1/2 flex justify-center mt-6 md:mt-0">
            <img
              src={mainImage}
              alt="Virtual Classroom"
              className="rounded-lg w-full md:w-4/5 lg:w-3/4 shadow-lg"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        className="py-10 px-6 bg-white rounded-md mb-6 shadow-md"
      >
        <div className="container mx-auto">
          <h3 className="text-3xl font-bold text-center text-gray-800">
            Why Choose EduMatrix?
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            {[
              "Smart Attendance Tracking",
              "Interactive Virtual Whiteboard",
              "Personalized Learning Paths",
              "Real-time Analytics",
              "Seamless Collaboration Tools",
              "Cloud-based Secure Data Storage",
            ].map((feature, index) => (
              <div
                key={index}
                className="p-6 border rounded-lg shadow-sm hover:shadow-lg text-center"
              >
                <h4 className="text-xl font-semibold text-blue-600">
                  {feature}
                </h4>
                <p className="text-gray-600 mt-2">
                  Unlock the potential of virtual learning with this feature.
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section
        id="demo"
        className="py-10 px-6 bg-gray-100 rounded-md mb-6 shadow-md"
      >
        <div className="container mx-auto text-center">
          <h3 className="text-3xl font-bold text-gray-800">
            See EduMatrix in Action
          </h3>
          <p className="text-gray-600 mt-4">
            Experience the powerful features of EduMatrix through a live demo.
          </p>
          <div className="mt-8">
            <iframe
              className="w-full sm:w-3/4 h-64 mx-auto rounded-lg shadow-md"
              src="https://www.youtube.com/embed/dQw4w9WgXcQ"
              title="EduMatrix Demo"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      </section>

      {/* Call-to-Action Section */}
      <section
        id="get-started"
        className="py-10 px-6 bg-blue-600 text-white text-center rounded-md mb-6 shadow-md"
      >
        <h3 className="text-3xl font-bold">Transform Education Today</h3>
        <p className="mt-4">
          Join EduMatrix and take your virtual classroom experience to the next
          level.
        </p>
        <div className="mt-6 space-x-4">
          <button className="px-6 py-2 bg-white text-blue-600 rounded-lg shadow-md hover:bg-gray-100">
            Get Started
          </button>
          <button className="px-6 py-2 bg-blue-800 rounded-lg shadow-md hover:bg-blue-900">
            Request a Demo
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-400 text-center py-6 rounded-md">
        <p>&copy; 2024 EduMatrix. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default HomePage;
