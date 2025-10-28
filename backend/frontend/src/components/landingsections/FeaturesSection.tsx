import { motion } from "motion/react";
import { useInView } from "motion/react";
import { useRef } from "react";
import {
  CheckSquare,
  Brain,
  CalendarClock,
  FileSignature,
  ClipboardCheck,
  LineChart,
  Shield,
  Zap,
  Globe,
} from "lucide-react";

export function FeaturesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  const features = [
    {
      icon: CheckSquare,
      title: "Requisition Approval Workflow",
      description: "Automated multi-level approvals with real-time tracking and notifications",
      color: "from-blue-500 to-blue-600",
    },
    {
      icon: Brain,
      title: "Smart Candidate Matching",
      description: "AI-powered matching to connect the best candidates with open roles",
      color: "from-cyan-500 to-cyan-600",
    },
    {
      icon: CalendarClock,
      title: "Automated Interview Scheduling",
      description: "Seamlessly coordinate interviews across multiple time zones",
      color: "from-indigo-500 to-indigo-600",
    },
    {
      icon: FileSignature,
      title: "Digital Offer Letter & e-Signature",
      description: "Create, send, and track offer letters with integrated e-signature",
      color: "from-purple-500 to-purple-600",
    },
    {
      icon: ClipboardCheck,
      title: "Pre-boarding Task Tracker",
      description: "Manage onboarding tasks and ensure smooth candidate transitions",
      color: "from-pink-500 to-pink-600",
    },
    {
      icon: LineChart,
      title: "Advanced Analytics Dashboard",
      description: "Comprehensive insights into hiring metrics and team performance",
      color: "from-orange-500 to-orange-600",
    },
    {
      icon: Shield,
      title: "Data Privacy & Compliance Tools",
      description: "GDPR-compliant with built-in data protection and audit trails",
      color: "from-green-500 to-green-600",
    },
    {
      icon: Zap,
      title: "Workflow Automation",
      description: "Reduce manual work with intelligent automation across all stages",
      color: "from-yellow-500 to-yellow-600",
    },
    {
      icon: Globe,
      title: "Multi-location Support",
      description: "Manage global recruitment operations from a single platform",
      color: "from-teal-500 to-teal-600",
    },
  ];

  return (
    <section
      ref={ref}
      className="py-24 bg-gradient-to-br from-[#0a1628] via-[#1e3a5f] to-[#0f2847] relative overflow-hidden"
    >
      {/* Animated background elements */}
      <motion.div
        className="absolute top-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="mb-4 text-3xl font-bold text-white">
            Powerful Features for{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
              Modern Recruitment
            </span>
          </h2>
          <p className="text-gray-300 max-w-3xl mx-auto text-xl">
            Everything you need to transform your hiring process, from requisition
            to onboarding.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group"
              >
                <div className="relative bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 h-full">
                  {/* Gradient overlay on hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-300`} />
                  
                  <div className="relative z-10">
                    <div
                      className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
                    >
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-white mb-2">{feature.title}</h3>
                    <p className="text-gray-300 text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Feature highlight */}
        {/* <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-16 text-center"
        >
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 border border-white/20">
            <Zap className="w-5 h-5 text-yellow-400" />
            <span className="text-white">
              All features integrate seamlessly with your existing HR systems
            </span>
          </div>
        </motion.div> */}
      </div>
    </section>
  );
}
