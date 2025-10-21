import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import person from '../media/landingImg5.png';
import logo from '../media/thumbnail_image001.png';
import req_img from '../media/req_img.png';
import dash_img from '../media/dash_img.png';
import analytics_img from '../media/analytics_img.png';
import acme_white_logo from '../media/Component 1.png';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="bg-white bg-linear-to-b from-blue-950 to-blue-900  text-gray-900"
    style={{ background: 'linear-gradient(to bottom, #021B4A, #0A2B78)'}}
    >
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-2 py-2 shadow-sm ">
        {/* <div className="text-2xl font-bold text-blue-900"> */}
          <img src={acme_white_logo} alt="Logo" className="inline  h-20 mr-2"/>
          {/* </div> */}
          
        <div className="hidden md:flex items-center space-x-4 text-gray-700">
          <span className="text-lg font-semibold text-white hover:text-blue-500 cursor-pointer">Services</span> 
          <span className="text-lg font-semibold text-white hover:text-blue-500 ml-5 cursor-pointer">About Us</span>
          <span className="text-lg font-semibold text-white hover:text-blue-500 ml-5 cursor-pointer">Contact</span>
          <span className="text-lg font-semibold text-white hover:text-blue-500 ml-5 cursor-pointer">Blog</span>
          <span className="text-lg font-semibold text-white hover:text-blue-500 ml-5 cursor-pointer">Careers</span>
          <span className="text-lg font-semibold text-white hover:text-blue-500 ml-5 mr-10 cursor-pointer">Pricing</span>
          <Button
              className="hover:bg-blue-900 mr-2 p-2 border bg-blue-950 cursor-pointer h-10 w-30 shadow-2xl rounded-full "
              size="lg"
              style={{ background: '#0A2B78',  }}
              onClick={() => navigate('/login')}
            >
             <span className="border-2 border-yellow-500 rounded-full  text-yellow-500 text-center p-1  w-30"
              style={{ background: '#0A2B78', borderColor:'#D9B900', color:'#D9B900' }}> Login</span>
            </Button>
            <Button
              className="hover:bg-blue-900 mr-2 p-2 border bg-blue-950 cursor-pointer h-10 w-30 shadow-2xl rounded-full "
              size="lg"
              style={{ background: '#0A2B78',  }}
              onClick={() => navigate('/login?tab=signup')}
            >
             <span className="border-2 border-yellow-500 rounded-full  text-yellow-500 text-center p-1  w-50"
              style={{ background: '#0A2B78', borderColor:'#D9B900', color:'#D9B900' }}> Sign Up</span>
            </Button>
          {/* <Button onClick={() => navigate('/login')} className="hover:bg-blue-600 mr-2 bg-blue-900 cursor-pointer">Login</Button>
          <Button onClick={() => navigate('/login')}  className="hover:bg-blue-600 mr-2 bg-blue-900 cursor-pointer" size="sm">Sign Up</Button> */}
        </div>
      </nav>

      {/* Hero Section */}
      <header className="grid   md:grid-cols-2 gap-10 items-center h-screen max-w-7xl mx-auto ">
        <div className="space-y-6">
          <h3 className="text-3xl font-semibold tracking-tight text-white">Recruitment Software for Dynamic Hiring Teams</h3>
          <h1 className="text-5xl font-bold tracking-tight text-white">
            Let’s make your next great hire. Fast.
          </h1>
          <p className="text-lg text-white leading-relaxed">
            ACME’s AI-powered recruitment platform brings sourcing, tracking, and relationship building together to keep your momentum going strong, no matter how fast your company is changing.          </p>
          <p className="font-semibold text-white">
            Source, screen, and hire faster with ACME Global Hub.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button
              className="hover:bg-blue-900 mt-10 mr-2 p-2 border bg-blue-950 cursor-pointer h-12 w-52 shadow-2xl rounded-full "
              size="lg"
              style={{ background: '#0A2B78',  }}
              onClick={() => navigate('/login?tab=signup')}
            >
             <span className="border-2 border-yellow-500 rounded-full h-10 text-yellow-500 text-center pt-2  w-50"
              style={{ background: '#0A2B78', borderColor:'#D9B900', color:'#D9B900' }}> Get Start with ACME</span>
            </Button>
            {/* <Button
              className="hover:bg-blue-900 mr-2 p-2 border bg-blue-950 cursor-pointer h-12 w-52 shadow-2xl rounded-full "
              size="lg"
              style={{ background: '#0A2B78',  }}
              onClick={() => navigate('/login')}
            >
             <span className="border-2 border-yellow-500 rounded-full h-10 text-yellow-500 text-center pt-2  w-50"
              style={{ background: '#0A2B78', borderColor:'#D9B900', color:'#D9B900' }}> Request a Demo</span>
            </Button> */}
          </div>
        </div>
        <div className="flex justify-center">
          
          {/* <img
            src={person}
            alt="Professional with laptop"
            className="w-full max-w-2xl object-contain"
          /> */}
           <div 
           className="h-70 w-130 absolute top-60 right-40  bg-white rounded-2xl shadow-[0_10px_50px_rgb(93_170_241_/_40%)]">
           <img
            src={analytics_img}
            alt="Professional with laptop"
            className="w-full h-full object-contain rounded-2xl"
          />
           </div>

           <div
           className="h-45 w-80 absolute  top-40 right-5  bg-white rounded-2xl shadow-[0_10px_50px_rgb(93_170_241_/_50%)]">
            <img
            src={dash_img}
            alt="Professional with laptop"
            className="w-full h-full object-contain rounded-2xl"
          />
           </div>

            <div 
           className="h-45 w-80 right-120 top-110 absolute  bg-white rounded-2xl shadow-[0_10px_50px_rgb(93_170_241_/_50%)]">
            <img
            src={req_img}
            alt="Professional with laptop"
            className="w-full h-full object-contain rounded-2xl"
          />
           </div>
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
