import { motion } from "motion/react";
import { useInView } from "motion/react";
import { useRef } from "react";
import {
  FileText,
  Users,
  Calendar,
  FileCheck,
  UserCheck,
  BarChart3,
} from "lucide-react";

export function WorkflowSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  const workflows = [
    {
      icon: FileText,
      title: "Demand Planning & Requisition Management",
      description:
        "Create, approve, and track requisitions with budgeting and workforce planning integration.",
      color: "from-blue-500 to-blue-600",
      delay: 0.1,
    },
    {
      icon: Users,
      title: "Candidate Intake & Screening",
      description:
        "Collect profiles via portal, email, or recruiter upload. Auto-parse CVs, remove duplicates, and shortlist effortlessly.",
      color: "from-cyan-500 to-cyan-600",
      delay: 0.2,
    },
    {
      icon: Calendar,
      title: "Interview Management",
      description:
        "Plan interviews, coordinate panels, and capture structured feedback to make data-driven decisions.",
      color: "from-blue-600 to-indigo-600",
      delay: 0.3,
    },
    {
      icon: FileCheck,
      title: "Offer & Approval Process",
      description:
        "Model compensation, get automated approvals, and send digital offer letters with e-signature.",
      color: "from-indigo-500 to-purple-600",
      delay: 0.4,
    },
    {
      icon: UserCheck,
      title: "Pre-boarding & Handover",
      description:
        "Assign pre-boarding tasks and seamlessly hand off data to HR or ERP systems for onboarding.",
      color: "from-purple-500 to-pink-600",
      delay: 0.5,
    },
    {
      icon: BarChart3,
      title: "Analytics & Compliance",
      description:
        "Gain real-time visibility into recruiting metrics, SLAs, and compliance with data protection and audit standards.",
      color: "from-pink-500 to-rose-600",
      delay: 0.6,
    },
  ];

  return (
    <section
      ref={ref}
      className="py-24 bg-gradient-to-br from-[#0a1628] via-[#1e3a5f] to-[#0f2847] relative overflow-hidden"
    >
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="mb-4 text-white">
            One Platform.{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
              Every Stage of Hiring.
            </span>
          </h2>
          <p className="text-gray-300 max-w-3xl mx-auto text-lg">
            Follow the complete recruitment journey from requisition to
            pre-boarding on a single unified platform.
          </p>
        </motion.div>

        {/* Workflow Timeline */}
        <div className="max-w-6xl mx-auto relative">
          {/* Connecting line */}
          <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500/50 via-cyan-500/50 to-purple-500/50 transform -translate-x-1/2" />

          <div className="space-y-12">
            {workflows.map((workflow, index) => {
              const Icon = workflow.icon;
              const isEven = index % 2 === 0;

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: isEven ? -50 : 50 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.6, delay: workflow.delay }}
                  className={`flex items-center gap-8 ${
                    isEven ? "lg:flex-row" : "lg:flex-row-reverse"
                  } flex-col`}
                >
                  {/* Content Card */}
                  <div className="flex-1">
                    <div
                      className={`bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300 ${
                        isEven ? "lg:text-right" : "lg:text-left"
                      } text-left`}
                    >
                      <div
                        className={`flex items-center gap-3 mb-4 ${
                          isEven
                            ? "lg:justify-end"
                            : "lg:justify-start"
                        } justify-start`}
                      >
                        <div
                          className={`w-12 h-12 rounded-xl bg-gradient-to-br ${workflow.color} flex items-center justify-center`}
                        >
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-white">{workflow.title}</h3>
                      </div>
                      <p className="text-gray-300">{workflow.description}</p>
                    </div>
                  </div>

                  {/* Timeline Node */}
                  <div className="hidden lg:block relative z-10">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={isInView ? { scale: 1 } : {}}
                      transition={{ duration: 0.4, delay: workflow.delay + 0.2 }}
                      className="w-16 h-16 rounded-full bg-gradient-to-br from-white to-gray-200 flex items-center justify-center shadow-lg"
                    >
                      <div
                        className={`w-12 h-12 rounded-full bg-gradient-to-br ${workflow.color} flex items-center justify-center`}
                      >
                        <span className="text-white">{index + 1}</span>
                      </div>
                    </motion.div>
                  </div>

                  {/* Spacer */}
                  <div className="hidden lg:block flex-1" />
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
