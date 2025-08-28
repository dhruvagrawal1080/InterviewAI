import React from "react";

const SummarySection = () => {
  const strengths = [
    "Strong technical knowledge demonstrated in product development questions",
    "Excellent use of metrics and data to support achievements",
    "Clear communication of complex concepts",
    "Well-structured answers following the STAR method",
  ];

  const improvements = [
    'Reduce filler words ("um", "like") to sound more confident',
    "Provide more concise answers to time-sensitive questions",
    "Include more examples of cross-functional collaboration",
    "Prepare more specific questions about the company culture",
  ];

  const recommendations = [
    {
      title: "Behavioral Interviews",
      description: "Focus on leadership and conflict resolution scenarios",
    },
    {
      title: "Technical Questions",
      description: "Practice product prioritization frameworks",
    },
  ];

  return (
    <section id="summary-section" className="py-16 bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Heading */}
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Your Interview Summary
            </h2>
            <p className="text-gray-300">
              Comprehensive analysis of your performance with actionable
              insights
            </p>
          </div>

          {/* Summary Card */}
          <div className="bg-gray-800 rounded-xl shadow-md p-6 md:p-8 mb-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-semibold text-white">
                  Product Manager Interview
                </h3>
                <p className="text-gray-400">
                  Completed on August 6, 2023 • 24 minutes
                </p>
              </div>
              <div className="mt-4 md:mt-0">
                <div className="flex items-center mr-6">
                  <div className="w-12 h-12 rounded-full bg-[#38BDF8]/20 flex items-center justify-center mr-3">
                    <span className="text-[#38BDF8] font-bold text-lg">8.3</span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">
                      Overall Score
                    </p>
                    <p className="font-medium text-white">
                      Very Good
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Key Strengths */}
            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-semibold text-white mb-3 flex items-center">
                  <i className="fas fa-trophy text-amber-500 mr-2"></i>
                  Key Strengths
                </h4>
                <ul className="space-y-2 pl-6 text-gray-300">
                  {strengths.map((item, index) => (
                    <li key={index} className="list-disc">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Improvement Areas */}
              <div>
                <h4 className="text-lg font-semibold text-white mb-3 flex items-center">
                  <i className="fas fa-arrow-trend-up text-blue-500 mr-2"></i>
                  Improvement Areas
                </h4>
                <ul className="space-y-2 pl-6 text-gray-300">
                  {improvements.map((item, index) => (
                    <li key={index} className="list-disc">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Recommended Practice */}
              <div>
                <h4 className="text-lg font-semibold text-white mb-3 flex items-center">
                  <i className="fas fa-lightbulb text-amber-500 mr-2"></i>
                  Recommended Practice
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {recommendations.map((rec, index) => (
                    <div
                      key={index}
                      className="bg-gray-900 p-4 rounded-lg"
                    >
                      <p className="font-medium text-white mb-1">
                        {rec.title}
                      </p>
                      <p className="text-sm text-gray-400">
                        {rec.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <button className="bg-[#38BDF8] hover:bg-blue-500 text-white font-semibold rounded-lg px-6 py-3 transition flex-1 flex items-center justify-center">
                <i className="fas fa-rotate-right mr-2"></i>
                Take Another Interview
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SummarySection;
