import { motion } from "motion/react";
import { useInView } from "motion/react";
import { useRef } from "react";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { Clock, Brain, Users, Shield, TrendingUp } from "lucide-react";

export function BenefitsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  const benefits = [
  
    {
      icon: Brain,
      title: "Smarter Decisions",
      description: "Data-driven insights for recruiters and management",
      metric: "360°",
      metricLabel: "Visibility",
      color: "from-cyan-500 to-cyan-600",
    },
    {
      icon: Users,
      title: "Enhanced Collaboration",
      description: "Bridge gaps between HR, hiring managers, and vendors",
      metric: "100%",
      metricLabel: "Connected",
      color: "from-indigo-500 to-indigo-600",
    },
    {
      icon: Shield,
      title: "Compliance-Ready",
      description: "Ensure GDPR and data retention standards are met",
      metric: "100%",
      metricLabel: "Compliant",
      color: "from-purple-500 to-purple-600",
    },
    {
      icon: TrendingUp,
      title: "Scalable",
      description: "Modular architecture supporting enterprise growth",
      metric: "∞",
      metricLabel: "Scalable",
      color: "from-pink-500 to-rose-600",
    },
      {
      icon: Clock,
      title: "Faster Hiring",
      description: "Reduce time-to-hire with automation and integrated workflows",
      metric: "50%",
      metricLabel: "Faster",
      color: "from-blue-500 to-blue-600",
    },
  ];

  return (
    <section ref={ref} className="py-24 bg-gray-50">
      <div className=" mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="mb-4 text-3xl font-bold text-gray-900">
            Built for{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-600">
              Efficiency, Transparency, and Compliance
            </span>
          </h2>
          <p className="text-gray-600 text-xl max-w-3xl mx-auto text-lg">
            Measurable impact on your recruitment operations from day one.
          </p>
        </motion.div>

        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
            {/* Image */}
          

            {/* Benefits List */}
            <div className="grid lg:grid-cols-2 gap-6">
              {benefits.map((benefit, index) => {
                const Icon = benefit.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 30 }}
                    animate={isInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="group"
                  >
                    <div className="flex items-start gap-4 bg-white rounded-xl p-4 shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100">
                      <div
                        className={`w-14 h-14 rounded-xl bg-gradient-to-br ${benefit.color} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}
                      >
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-gray-900 mb-1">{benefit.title}</h3>
                        <p className="text-gray-600 text-sm mb-2">
                          {benefit.description}
                        </p>
                        <div className="flex items-center gap-2">
                          <div className={`text-xl bg-gradient-to-r ${benefit.color} text-transparent bg-clip-text`}>
                            {benefit.metric}
                          </div>
                          <span className="text-gray-500 text-sm">
                            {benefit.metricLabel}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

              <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="rounded-2xl overflow-hidden shadow-2xl">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1531545514256-b1400bc00f31?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWFtJTIwY29sbGFib3JhdGlvbiUyMG1lZXRpbmd8ZW58MXx8fHwxNzYxNTI3NzE3fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  alt="Team Collaboration"
                  className="w-full h-auto"
                />
              </div>

              {/* Floating stat */}
              <motion.div
                animate={{
                  y: [0, -10, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute -top-6 -right-6 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl shadow-2xl p-6"
              >
                <div className="text-white text-center">
                  <div className="text-4xl mb-1">94%</div>
                  <div className="text-sm opacity-90">Customer Satisfaction</div>
                </div>
              </motion.div>
            </motion.div>
          </div>

          {/* Impact Metrics */}
          {/* <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl p-12 text-white"
          >
            <h3 className="text-center mb-12 text-white">
              Real Results from Real Customers
            </h3>
            <div className="grid md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-5xl mb-2">50%</div>
                <div className="text-blue-100">Reduction in Time-to-Hire</div>
              </div>
              <div className="text-center">
                <div className="text-5xl mb-2">75%</div>
                <div className="text-blue-100">Faster Approvals</div>
              </div>
              <div className="text-center">
                <div className="text-5xl mb-2">90%</div>
                <div className="text-blue-100">User Adoption Rate</div>
              </div>
              <div className="text-center">
                <div className="text-5xl mb-2">100%</div>
                <div className="text-blue-100">Compliance Adherence</div>
              </div>
            </div>
          </motion.div> */}
        </div>
      </div>
    </section>
  );
}
