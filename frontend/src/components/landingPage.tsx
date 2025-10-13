import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import person from '../media/landingImg5.png';
import logo from '../media/thumbnail_image001.png';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="bg-white bg-linear-to-r from-blue-950 to-blue-800  text-gray-900">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-2 py-2 shadow-sm bg-white ">
        {/* <div className="text-2xl font-bold text-blue-900"> */}
          <img src={logo} alt="Logo" className="inline h-16 mr-2"/>
          {/* </div> */}
          
        <div className="hidden md:flex items-center space-x-4 text-gray-700">
          <span className="text-lg font-semibold text-blue-900 hover:text-blue-500 cursor-pointer">Services</span> 
          <span className="text-lg font-semibold text-blue-900 hover:text-blue-500 ml-5 cursor-pointer">About Us</span>
          <span className="text-lg font-semibold text-blue-900 hover:text-blue-500 ml-5 cursor-pointer">Contact</span>
          <span className="text-lg font-semibold text-blue-900 hover:text-blue-500 ml-5 cursor-pointer">Blog</span>
          <span className="text-lg font-semibold text-blue-900 hover:text-blue-500 ml-5 cursor-pointer">Careers</span>
          <span className="text-lg font-semibold text-blue-900 hover:text-blue-500 ml-5 mr-10 cursor-pointer">Pricing</span>
          <Button onClick={() => navigate('/login')} className="hover:bg-blue-600 mr-2 bg-blue-900 cursor-pointer">Login</Button>
          <Button onClick={() => navigate('/login')}  className="hover:bg-blue-600 mr-2 bg-blue-900 cursor-pointer" size="sm">Sign Up</Button>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="grid   md:grid-cols-2 gap-10 items-center h-screen max-w-7xl mx-auto px-8">
        <div className="space-y-6">
          <h1 className="text-5xl font-bold tracking-tight text-white">
            Let’s make your next great hire. Fast.
          </h1>
          <p className="text-lg text-white leading-relaxed">
            Post a requisition and let our platform take care of sourcing, screening, scheduling, and offers — all in one place. With built-in collaboration tools, smart filters, and real-time insights, you’ll spend less time managing processes and more time hiring the right talent.
          </p>
          <p className="font-semibold text-white">
            Source, screen, and hire faster with ACME Global Hub.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button
              className="hover:bg-blue-600 mr-2 border bg-blue-900 cursor-pointer"
              size="lg"
              style={{ background: 'gold',  }}
              onClick={() => navigate('/login')}
            >
              Get Start with ACME
            </Button>
          </div>
        </div>
        <div className="flex justify-center">
          <div style={{
            borderColor: 'gold'
          }}
           className="h-70 w-100 border-2 border-yellow-500 bg-white rounded-2xl shadow-[0_10px_50px_rgb(93_170_241_/_94%)]"></div>
          {/* <img
            src={person}
            alt="Professional with laptop"
            className="w-full max-w-2xl object-contain"
          /> */}
        </div>
      </header>

      {/* Explore Section */}
      {/* <section className="grid md:grid-cols-2 gap-10 items-center h-screen px-8 max-w-7xl mx-auto">
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-gray-900">
            Explore Our Recruitment Software
          </h2>
          <p className="text-lg text-gray-700 leading-relaxed">
            Hireem was designed to simplify your hiring process and save you valuable
            time by helping you choose the right candidates, manage your talent pool,
            strengthen team collaboration, and hire top talent. Make recruitment and talent
            management your competitive advantage with the best Applicant Tracking System (ATS).
          </p>
        </div>
        <div className="flex justify-center">
          <img
            src="/images/software-laptop.png"
            alt="Recruitment Software"
            className="w-full max-w-2xl rounded-md shadow"
          />
        </div>
      </section> */}

      {/* Candidate Profiles Section */}
      {/* <section className="grid md:grid-cols-2 gap-10 items-center h-screen px-8 max-w-7xl mx-auto">
        <div className="flex justify-center">
          <img
            src="/images/candidate-profile.png"
            alt="Candidate Profile"
            className="w-full max-w-2xl rounded-md shadow"
          />
        </div>
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-gray-900">
            Enrich Your Candidates' Profiles
          </h2>
          <p className="text-lg text-gray-700 leading-relaxed">
            Hireem’s recruitment tool enables you to create candidates in one click using their resumes
            or LinkedIn and enrich their profiles automatically with their social media. Take recruiting into the
            new digital age, access your candidate’s Facebook, Instagram, and Twitter to find the top talent
            your company needs.
          </p>
        </div>
      </section> */}

      {/* Footer */}
      {/* <footer className="text-center py-10 text-gray-500 text-sm bg-gray-50">
        © {new Date().getFullYear()} ACME Global Hub. All rights reserved.
      </footer> */}
    </div>
  );
};

export default HomePage;
