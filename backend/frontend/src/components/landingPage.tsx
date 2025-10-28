import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import acme_white_logo from "../media/acme_logo.png";
import req_img from "../media/req_img.png";
import dash_img from "../media/dash_img.png";
import analytics_img from "../media/analytics_img.png";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import acme_dark_logo from "../media/thumbnail_image001.png";
import { 
  FileText, 
  Users, 
  AlertCircle, 
  Workflow, 
  BarChart3, 
  Zap, 
  Shield, 
  CheckCircle2,
  XCircle,
  ArrowRight,
  Sparkles
} from "lucide-react";

// import { HeroSection } from "./landingsections/HomeSection";
// import { ProblemStatement } from "./landingsections/ProblemStatement";
// import { WorkflowSection } from "./landingsections/WorkflowSection";
// import { DashboardSection } from "./landingsections/DashboardSection";
import { FeaturesSection } from "./landingsections/FeaturesSection";
import { BenefitsSection } from "./landingsections/BenefitsSection";
import { CTASection } from "./landingsections/CTASection";

const exploreData = [
  {
    id: "dashboard",
    title: "Dashboard",
    description:
      "Gain instant visibility into your entire recruitment pipeline with visual insights, pending actions, and performance analytics.",
    image: dash_img,
  },
  {
    id: "requisitions",
    title: "Requisitions",
    description:
      "Create, approve, and track requisitions with budgeting and workforce planning integration for better hiring control.",
    image: req_img,
  },
  {
    id: "candidates",
    title: "Candidates",
    description:
      "Collect profiles via portal, email, or recruiter upload. Auto-parse CVs, remove duplicates, and shortlist effortlessly.",
    image: dash_img,
  },
  {
    id: "interviews",
    title: "Interviews",
    description:
      "Plan interviews, coordinate panels, and capture structured feedback to make data-driven decisions.",
    image: analytics_img,
  },
  {
    id: "offers",
    title: "Offers",
    description:
      "Streamline offer generation, approval, and acceptance with customizable templates and digital workflows.",
    image: dash_img,
  },
  {
    id: "analytics",
    title: "Analytics",
    description:
      "Leverage advanced analytics to measure recruiter performance, time-to-hire, and diversity metrics.",
    image: analytics_img,
  },
  {
    id: "vendors",
    title: "Vendors",
    description:
      "Manage third-party vendor performance and collaborate through a unified platform for external hiring.",
    image: req_img,
  },
];

const challenges = [
    {
      icon: <FileText className="w-6 h-6" />,
      title: "Manual Tracking",
      description: "Spreadsheets and emails create bottlenecks"
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Multiple Tools",
      description: "Fragmented systems across departments"
    },
    {
      icon: <AlertCircle className="w-6 h-6" />,
      title: "Lack of Visibility",
      description: "No real-time insights into hiring pipeline"
    },
    {
      icon: <AlertCircle className="w-6 h-6" />,
      title: "Slow Approval Processes",
      description: "No real-time insights into hiring pipeline"
    }
  ];

  const solutions = [
    {
      icon: <Workflow className="w-6 h-6" />,
      title: "Centralized Workflow",
      description: "One platform for all stakeholders"
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Real-Time Analytics",
      description: "Data-driven hiring decisions"
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Smart Automation",
      description: "Streamlined approvals and scheduling"
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Compliance & Transparency",
      description: "Built-in governance and audit trails"
    }
  ];


const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");

  const activeItem = exploreData.find((item) => item.id === activeTab);

  return (
    <div
      className="text-gray-900   "
      // style={{
      //   //  background: "linear-gradient(to bottom, #021B4A, #0A2B78)" 
      //     background:
      //       "linear-gradient(180deg, #f7f9fc 0%, #e9eef7 50%, #dfe7f1 100%)",
      //   }}
    >
      {/* Navbar */}
      <nav className="top-0 left-0 right-0 z-999 flex items-center justify-between px-4  shadow-sm">
        <img src={acme_dark_logo} alt="Logo" className="h-14 md:h-20" />
        <div className="hidden md:flex items-center space-x-4">
          <Button
            className="hover:bg-blue-900 border bg-blue-950 cursor-pointer h-10 w-28 rounded-full"
            size="lg"
            onClick={() => navigate("/login")}
          >Login
          </Button>
          <Button
            className="hover:bg-blue-900 border bg-blue-950 cursor-pointer h-10 w-28 rounded-full"
            size="lg"
            style={{ background: "#0A2B78" }}
            onClick={() => navigate("/login?tab=signup")}
          > 
          Sign Up 
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="grid md:grid-cols-2 gap-8 items-center h-[90vh] w-full px-4 md:px-8 bg-gradient-to-br from-[#0a1628] via-[#1e3a5f] to-[#0f2847]">

  {/* Background pattern */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />
      </div>

        <div className="space-y-6 px-20">
          <h3 className="text-2xl md:text-3xl font-semibold tracking-tight text-white">
            The Future of Intelligent Hiring
          </h3>
          <h1 className="text-3xl md:text-5xl font-medium tracking-tight  leading-snug  text-white">
            Transform Your Hiring Lifecycle with ACME Global’s Recruitment
            Management Module.
          </h1>
          <p className="text-md md:text-lg  leading-relaxed  text-white">
            From workforce planning to pre-boarding, manage every step of your
            recruitment process in one unified, intelligent platform — designed
            for recruiters, hiring managers, and vendors.
          </p>

          <Button
            className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white group"
            size="lg"
            onClick={() => navigate("/login?tab=signup")}
           
          > 
              Get Started
             <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </header>
    <section className="relative py-20 px-6 overflow-hidden">
      {/* Background with gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-100/40"></div>
      
      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-indigo-400/20 rounded-full blur-3xl"></div>

      <div className="relative max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-20">
          <h1 className="mb-6 text-3xl font-bold bg-gradient-to-r from-slate-800 via-blue-700 to-indigo-800 bg-clip-text text-transparent">
            Eliminate Recruitment Complexity. Embrace Automation.
          </h1>
          
          <p className="max-w-4xl mx-auto text-xl text-slate-700 leading-relaxed">
            Recruitment doesn't have to be fragmented. RMM unites every stakeholder — recruiters, 
            hiring managers, agencies, and candidates — on a single digital platform that streamlines 
            approvals, sourcing, interviews, and offers while ensuring compliance and transparency.
          </p>
        </div>

        {/* Split Layout */}
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 relative">
          {/* Left Side - Challenges */}
          <div className="relative group">
            {/* Glass card */}
            <div className="relative backdrop-blur-xl bg-white/70 rounded-3xl shadow-2xl overflow-hidden border border-white/60 transition-all duration-300 hover:shadow-3xl hover:bg-white/80">
              {/* Image Header */}
              <div className="relative h-64 overflow-hidden">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1758518731694-41ea7fa6a2d9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoaXJpbmclMjBpbnRlcnZpZXclMjBvZmZpY2V8ZW58MXx8fHwxNzYxNTY1MjU2fDA&ixlib=rb-4.1.0&q=80&w=1080"
                  alt="Current HR Challenges"
                  className="w-full h-full object-cover"
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-white/95 via-white/50 to-transparent"></div>
                
                {/* Floating badge */}
                <div className="absolute top-6 left-6 backdrop-blur-md bg-red-500/90 px-4 py-2 rounded-full border border-white/40 shadow-lg">
                  <div className="flex items-center gap-2 text-white">
                    <XCircle className="w-5 h-5" />
                    <span className="text-sm">Challenges</span>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-8">
                <h3 className="text-slate-800 mb-6">Current Pain Points</h3>

                <div className="space-y-4">
                  {challenges.map((challenge, index) => (
                    <div 
                      key={index}
                      className="group/item relative backdrop-blur-sm bg-gradient-to-br from-white/60 to-slate-50/60 rounded-2xl border border-slate-200/60 p-5 transition-all duration-300 hover:border-red-300/60 hover:shadow-lg hover:bg-white/80"
                    >
                      <div className="flex gap-4">
                        <div className="flex-shrink-0 p-3 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl text-white shadow-md group-hover/item:shadow-lg transition-shadow">
                          {challenge.icon}
                        </div>
                        <div className="flex-1">
                          <h4 className="text-slate-900 mb-1.5">
                            {challenge.title}
                          </h4>
                          <p className="text-slate-600 text-sm leading-relaxed">
                            {challenge.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Decorative glow */}
            <div className="absolute -inset-1 bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-3xl blur-2xl -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          </div>

          {/* Center Arrow - Desktop */}
          <div className="hidden lg:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500/30 rounded-full blur-xl"></div>
              <div className="relative backdrop-blur-md bg-gradient-to-r from-blue-600 to-indigo-600 p-5 rounded-full shadow-2xl border border-white/40">
                <ArrowRight className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>

          {/* Right Side - Solutions */}
          <div className="relative group">
            {/* Glass card */}
            <div className="relative backdrop-blur-xl bg-white/70 rounded-3xl shadow-2xl overflow-hidden border border-white/60 transition-all duration-300 hover:shadow-3xl hover:bg-white/80">
              {/* Image Header */}
              <div className="relative h-64 overflow-hidden">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1531545514256-b1400bc00f31?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWFtJTIwY29sbGFib3JhdGlvbiUyMG1lZXRpbmd8ZW58MXx8fHwxNzYxNTI3NzE3fDA&ixlib=rb-4.1.0&q=80&w=1080"
                  alt="RMM Solutions"
                  className="w-full h-full object-cover"
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-white/95 via-white/50 to-transparent"></div>
                
                {/* Floating badge */}
                <div className="absolute top-6 right-6 backdrop-blur-md bg-blue-600/90 px-4 py-2 rounded-full border border-white/40 shadow-lg">
                  <div className="flex items-center gap-2 text-white">
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="text-sm">Solutions</span>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-8">
                <h3 className="text-slate-800 mb-6">RMM Platform Benefits</h3>

                <div className="space-y-3.5">
                  {solutions.map((solution, index) => (
                    <div 
                      key={index}
                      className="group/item relative backdrop-blur-sm bg-gradient-to-br from-white/60 to-blue-50/60 rounded-2xl border border-blue-200/60 p-5 transition-all duration-300 hover:border-blue-400/60 hover:shadow-lg hover:bg-white/80"
                    >
                      <div className="flex gap-4">
                        <div className="flex-shrink-0 p-3 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl text-white shadow-md group-hover/item:shadow-lg transition-shadow">
                          {solution.icon}
                        </div>
                        <div className="flex-1">
                          <h4 className="text-slate-900 mb-1.5">
                            {solution.title}
                          </h4>
                          <p className="text-slate-600 text-sm leading-relaxed">
                            {solution.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Decorative glow */}
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 rounded-3xl blur-2xl -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          </div>
        </div>

        {/* Stats Bar with Glass Effect */}
        <div className="mt-20 grid grid-cols-4 md:grid-cols-4 gap-6">
          {[
            { label: "Time Saved", value: "60%", color: "from-blue-600 to-cyan-600" },
            { label: "Faster Hiring", value: "3x", color: "from-indigo-600 to-blue-600" },
            { label: "User Satisfaction", value: "95%", color: "from-blue-700 to-indigo-700" },
            { label: "Cost Reduction", value: "40%", color: "from-cyan-600 to-blue-700" }
          ].map((stat, index) => (
            <div 
              key={index} 
              className="group relative text-center p-8 backdrop-blur-lg bg-white/60 rounded-2xl border border-white/60 shadow-xl hover:shadow-2xl transition-all duration-300 hover:bg-white/80"
            >
              <div className={`inline-block text-transparent bg-gradient-to-r ${stat.color} bg-clip-text mb-2`}>
                {stat.value}
              </div>
              <div className="text-slate-600 text-sm tracking-wide">{stat.label}</div>
              
              {/* Hover glow */}
              <div className={`absolute -inset-0.5 bg-gradient-to-r ${stat.color} rounded-2xl blur opacity-0 group-hover:opacity-20 transition-opacity -z-10`}></div>
            </div>
          ))}
        </div>

      
      </div>
    </section>
      {/* Explore Section */}
      <section
        className="py-16 min-h-screen px-4 md:px-8 bg-gradient-to-br from-[#0a1628] via-[#1e3a5f] to-[#0f2847] relative"
        // style={{
        //    background: "linear-gradient(to bottom, #021B4A, #0A2B78)"
        // }}
      >
        {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />
      </div>

        <h1 className="text-3xl font-bold mb-10 text-center text-white">
          One Platform. Every Stage of Hiring.
        </h1>

        {/* Tab list */}
        <ul className="flex flex-wrap justify-center gap-3 md:gap-5 bg-white/80 backdrop-blur-md rounded-full py-2  shadow-md max-w-4xl mx-auto">
          {exploreData.map((item) => (
            <li
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`cursor-pointer px-4 py-2 text-md md:text-base rounded-full font-medium transition-all duration-300 ${
                activeTab === item.id
                  ? "bg-gradient-to-r from-blue-700 to-blue-400 text-white shadow-lg scale-105"
                  : "text-blue-800 hover:bg-blue-100"
              }`}
            >
              {item.title}
            </li>
          ))}
        </ul>

        {/* Glassy stable container */}
        <div className="mt-12 flex justify-center">
          <div
            className="relative backdrop-blur-2xl bg-white/20 border border-white/40 shadow-[0_8px_40px_rgba(0,0,0,0.1)] 
            rounded-3xl p-6  text-center w-5xl h-150  transition-all duration-500 ease-in-out"
            style={{
              boxShadow: "inset 0 0 20px rgba(255,255,255,0.15), 0 15px 50px rgba(93,170,241,0.3)",
            }}
          >
            {/* Simulated Mac screen top bar */}
            <div className="absolute top-3 left-4 flex gap-2 ">
              <span className="w-3 h-3 rounded-full bg-red-400"></span>
              <span className="w-3 h-3 rounded-full bg-yellow-400"></span>
              <span className="w-3 h-3 rounded-full bg-green-400"></span>
            </div>

            {/* Content */}
            <div className="mt-5 md:mt-10">
              {/* <h2 className="text-2xl md:text-3xl font-semibold text-blue-900 mb-4">
                {activeItem?.title}
              </h2> */}
              <p className="text-white font-medium text-xl md:text-base mb-6 px-2 md:px-6 leading-relaxed">
                {activeItem?.description}
              </p>
              <div className="flex justify-center">
                <img
                  src={activeItem?.image}
                  alt={activeItem?.title}
                  className="w-full max-w-3xl rounded-2xl shadow-md object-contain transition-all duration-300"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
      <BenefitsSection />
      <FeaturesSection />
      <CTASection />
   
    </div>

  //   <div className="min-h-screen bg-white">
  //     <HeroSection />
  //     <ProblemStatement />
  //     <WorkflowSection />
  //     <DashboardSection />
  //     <FeaturesSection />
  //     <BenefitsSection />
  //     <CTASection />
  //   </div>
   );
};

export default HomePage;
