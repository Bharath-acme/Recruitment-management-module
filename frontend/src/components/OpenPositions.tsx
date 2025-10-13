import React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Card, CardContent } from "../components/ui/card"; // shadcn card
import { Button } from "../components/ui/button";

const positions = [
  {
    id: 1,
    title: "Frontend Developer",
    exp: "3-5 years",
    techStack: ["React", "TypeScript", "Tailwind"],
    budget: "12-18 LPA",
    urgency: "Immediate",
    jd: "Build responsive UIs with React, TypeScript, and Tailwind. Strong fundamentals in state management and performance optimization are required.",
  },
  {
    id: 2,
    title: "Backend Engineer",
    exp: "4-6 years",
    techStack: ["Node.js", "Express", "PostgreSQL"],
    budget: "14-20 LPA",
    urgency: "Normal",
    jd: "Develop scalable APIs with Node.js, Express, and PostgreSQL. Experience with microservices and cloud deployment is a plus.",
  },
  {
    id: 3,
    title: "Fullstack Developer",
    exp: "5-8 years",
    techStack: ["React", "Node.js", "GraphQL"],
    budget: "18-25 LPA",
    urgency: "Immediate",
    jd: "Work across frontend and backend. Must know React, Node.js, GraphQL, and CI/CD best practices.",
  },
   {
    id: 4,
    title: "Java Developer",
    exp: "5-8 years",
    techStack: ["React", "Node.js", "GraphQL"],
    budget: "18-25 LPA",
    urgency: "Immediate",
    jd: "Work across frontend and backend. Must know React, Node.js, GraphQL, and CI/CD best practices.",
  },
   {
    id: 4,
    title: "Cloud Developer",
    exp: "5-8 years",
    techStack: ["React", "Node.js", "GraphQL"],
    budget: "18-25 LPA",
    urgency: "Immediate",
    jd: "Work across frontend and backend. Must know React, Node.js, GraphQL, and CI/CD best practices.",
  },
];

export default function PositionsPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Open Positions</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {positions.map((pos) => (
          <Dialog.Root key={pos.id}>
            <Dialog.Trigger asChild>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {pos.title}
                  </h2>
                  <p className="text-sm text-gray-600">
                    Experience: {pos.exp}
                  </p>
                  <p className="text-sm text-gray-600">Budget: {pos.budget}</p>
                  <p className="text-sm text-gray-600">
                    Tech Stack: {pos.techStack.join(", ")}
                  </p>
                  <span
                    className={`inline-block mt-2 px-2 py-1 text-xs font-medium rounded-full ${
                      pos.urgency === "Immediate"
                        ? "bg-red-100 text-red-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {pos.urgency}
                  </span>
                </CardContent>
              </Card>
            </Dialog.Trigger>

            {/* JD Modal */}
            <Dialog.Portal>
              <Dialog.Overlay className="fixed inset-0 bg-black/40" />
              <Dialog.Content className="fixed top-1/2 left-1/2 max-w-lg w-[90%] -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-xl shadow-lg">
                <Dialog.Title className="text-xl font-semibold mb-4">
                  {pos.title} – Job Description
                </Dialog.Title>
                <p className="text-gray-700 mb-4">{pos.jd}</p>
                <Dialog.Close asChild>
                  <Button variant="outline" className="mt-4">
                    Close
                  </Button>
                </Dialog.Close>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
        ))}
      </div>
    </div>
  );
}
