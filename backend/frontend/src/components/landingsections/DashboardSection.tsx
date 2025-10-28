import { motion } from "motion/react";
import { useInView } from "motion/react";
import { useRef } from "react";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { TrendingUp, Clock, CheckCircle, Users } from "lucide-react";

export function DashboardSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  const stats = [
    {
      icon: TrendingUp,
      value: "156",
      label: "Active Requisitions",
      change: "+12%",
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      icon: Clock,
      value: "23",
      label: "Pending Approvals",
      change: "-8%",
      color: "text-orange-600",
      bg: "bg-orange-50",
    },
    {
      icon: CheckCircle,
      value: "89",
      label: "Offers Accepted",
      change: "+24%",
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      icon: Users,
      value: "342",
      label: "Candidates in Pipeline",
      change: "+18%",
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
  ];

  return (
    <section ref={ref} className="py-24 bg-gray-50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="mb-4 text-gray-900">
            Your{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-600">
              Recruitment Command Center
            </span>
          </h2>
          <p className="text-gray-600 max-w-3xl mx-auto text-lg">
            View requisition pipelines, candidate progress, and analytics — all
            from a single dashboard customized for your role.
          </p>
        </motion.div>

        <div className="max-w-7xl mx-auto">
          {/* Dashboard Preview */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative mb-12"
          >
            <div className="rounded-2xl overflow-hidden shadow-2xl border-8 border-white bg-white">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1608222351212-18fe0ec7b13b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMGRhc2hib2FyZCUyMGFuYWx5dGljc3xlbnwxfHx8fDE3NjE0OTg1MTd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="RMM Dashboard"
                className="w-full h-auto"
              />
              
              {/* Dashboard overlay elements */}
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900/20 to-transparent" />
            </div>

            {/* Floating metric cards */}
            <motion.div
              animate={{
                y: [0, -10, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute -top-6 -right-6 bg-white rounded-xl shadow-xl p-4 border border-gray-100"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-gray-500 text-sm">Time-to-Hire</div>
                  <div className="text-gray-900">14 Days</div>
                </div>
                <div className="text-green-600 text-sm">↓ 30%</div>
              </div>
            </motion.div>

            <motion.div
              animate={{
                y: [0, -10, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1,
              }}
              className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-xl p-4 border border-gray-100"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-gray-500 text-sm">Success Rate</div>
                  <div className="text-gray-900">94%</div>
                </div>
                <div className="text-green-600 text-sm">↑ 12%</div>
              </div>
            </motion.div>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                  className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 rounded-lg ${stat.bg} flex items-center justify-center`}>
                      <Icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                    <span className="text-green-600 text-sm">{stat.change}</span>
                  </div>
                  <div className="text-gray-900 text-3xl mb-1">{stat.value}</div>
                  <div className="text-gray-600 text-sm">{stat.label}</div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
