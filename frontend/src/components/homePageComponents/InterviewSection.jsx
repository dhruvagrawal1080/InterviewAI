import React from 'react';

const InterviewSection = () => {
  const waveAnimations = [0.1, 0.2, 0.3, 0.4, 0.5];
  const voiceWaveHeights = [10, 14, 16, 12, 8, 14, 10, 6, 10, 12];
  const voiceWaveDelays = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0];

  const chatMessages = [
    {
      type: 'ai',
      message: "Hello! I'm your AI interview coach. Today we'll be conducting a mock interview for a Product Manager position. Are you ready to begin?"
    },
    {
      type: 'user',
      message: "Yes, I'm ready to start. Looking forward to the practice!"
    },
    {
      type: 'ai',
      message: "Great! Let's start with an introduction. Can you tell me about yourself and your background in product management?"
    },
    {
      type: 'user',
      message: "I have 5 years of experience in product management, primarily in SaaS companies. I started my career as a software developer, which gives me strong technical knowledge. For the past 3 years, I've been leading product teams focusing on user analytics platforms. I have a track record of increasing user engagement by 45% and reducing churn by 20% through data-driven product improvements."
    },
    {
      type: 'ai',
      message: "Can you tell me about a challenging project you worked on and how you overcame obstacles?"
    }
  ];

  const robotIcon = (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 640 512">
      <path d="M320 0c17.7 0 32 14.3 32 32V96H472c39.8 0 72 32.2 72 72V440c0 39.8-32.2 72-72 72H168c-39.8 0-72-32.2-72-72V168c0-39.8 32.2-72 72-72H288V32c0-17.7 14.3-32 32-32zM208 384c-8.8 0-16 7.2-16 16s7.2 16 16 16h32c8.8 0 16-7.2 16-16s-7.2-16-16-16H208zm96 0c-8.8 0-16 7.2-16 16s7.2 16 16 16h32c8.8 0 16-7.2 16-16s-7.2-16-16-16H304zm96 0c-8.8 0-16 7.2-16 16s7.2 16 16 16h32c8.8 0 16-7.2 16-16s-7.2-16-16-16H400zM264 256a40 40 0 1 0 -80 0 40 40 0 1 0 0 80zm152 40a40 40 0 1 0 0-80 40 40 0 1 0 0 80zM48 224H64V416H48c-26.5 0-48-21.5-48-48V272c0-26.5 21.5-48 48-48zm544 0c26.5 0 48 21.5 48 48v96c0 26.5-21.5 48-48 48H576V224h16z" />
    </svg>
  );

  const userIcon = (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 448 512">
      <path d="M224 256A128 128 0 1 0 224 0a128 128 0 1 0 0 256zm-45.7 48C79.8 304 0 383.8 0 482.3C0 498.7 13.3 512 29.7 512H418.3c16.4 0 29.7-13.3 29.7-29.7C448 383.8 368.2 304 269.7 304H178.3z" />
    </svg>
  );

  return (
    <section id="interview-section" className="py-16 bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Voice Interview Simulation
            </h2>
            <p className="text-gray-300">
              Speak naturally with our AI interviewer and receive instant feedback
            </p>
          </div>

          <div className="bg-gray-800 rounded-xl shadow-md overflow-hidden">
            <div className="flex flex-col md:flex-row">
              {/* AI Interviewer Side */}
              <div className="w-full md:w-1/3 bg-primary p-6">
                <div className="flex flex-col h-full">
                  <div className="text-center mb-6">
                    <div className="w-24 h-24 mx-auto bg-[#38BDF8]/20 rounded-full flex items-center justify-center mb-4">
                      <svg className="text-[#38BDF8] text-3xl w-8 h-8" fill="currentColor" viewBox="0 0 640 512">
                        <path d="M320 0c17.7 0 32 14.3 32 32V96H472c39.8 0 72 32.2 72 72V440c0 39.8-32.2 72-72 72H168c-39.8 0-72-32.2-72-72V168c0-39.8 32.2-72 72-72H288V32c0-17.7 14.3-32 32-32zM208 384c-8.8 0-16 7.2-16 16s7.2 16 16 16h32c8.8 0 16-7.2 16-16s-7.2-16-16-16H208zm96 0c-8.8 0-16 7.2-16 16s7.2 16 16 16h32c8.8 0 16-7.2 16-16s-7.2-16-16-16H304zm96 0c-8.8 0-16 7.2-16 16s7.2 16 16 16h32c8.8 0 16-7.2 16-16s-7.2-16-16-16H400zM264 256a40 40 0 1 0 -80 0 40 40 0 1 0 0 80zm152 40a40 40 0 1 0 0-80 40 40 0 1 0 0 80zM48 224H64V416H48c-26.5 0-48-21.5-48-48V272c0-26.5 21.5-48 48-48zm544 0c26.5 0 48 21.5 48 48v96c0 26.5-21.5 48-48 48H576V224h16z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-white">AI Interviewer</h3>
                    <p className="text-blue-300 text-sm">Professional • Adaptive • Helpful</p>
                  </div>

                  <div className="flex-1 flex flex-col justify-center items-center">
                    <div className="mb-6 text-center">
                      <div className="flex justify-center space-x-1 mb-3">
                        {waveAnimations.map((delay, index) => (
                          <div
                            key={index}
                            className="w-1 h-6 bg-[#38BDF8] rounded-full animate-wave"
                            style={{ animationDelay: `${delay}s` }}
                          ></div>
                        ))}
                      </div>
                      <p className="text-blue-200 text-sm">AI is speaking...</p>
                    </div>

                    <div className="w-full space-y-3">
                      <div className="bg-blue-900/40 rounded-lg p-4">
                        <p className="text-blue-100 text-sm">
                          Can you tell me about a challenging project you worked on and how you overcame obstacles?
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 space-y-3">
                    <button className="w-full bg-blue-900/40 hover:bg-blue-800 text-white rounded-lg py-2 flex items-center justify-center">
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 640 512">
                        <path d="M533.6 32.5C598.5 85.3 640 165.8 640 256s-41.5 170.8-106.4 223.5c-10.3 8.4-25.4 6.8-33.8-3.5s-6.8-25.4 3.5-33.8C557.5 398.2 592 331.2 592 256s-34.5-142.2-88.7-186.3c-10.3-8.4-11.8-23.5-3.5-33.8s23.5-11.8 33.8-3.5zM473.1 107c43.2 35.2 70.9 88.9 70.9 149s-27.7 113.8-70.9 149c-10.3 8.4-25.4 6.8-33.8-3.5s-6.8-25.4 3.5-33.8C475.3 341.3 496 301.1 496 256s-20.7-85.3-53.2-111.8c-10.3-8.4-11.8-23.5-3.5-33.8s23.5-11.8 33.8-3.5zm-60.5 74.5C434.1 199.1 448 225.9 448 256s-13.9 56.9-35.4 74.5c-10.3 8.4-25.4 6.8-33.8-3.5s-6.8-25.4 3.5-33.8C393.1 284.4 400 271 400 256s-6.9-28.4-17.7-37.3c-10.3-8.4-11.8-23.5-3.5-33.8s23.5-11.8 33.8-3.5zM301.1 34.8C312.6 40 320 51.4 320 64V448c0 12.6-7.4 24-18.9 29.2s-25 3.1-34.4-5.3L131.8 352H64c-35.3 0-64-28.7-64-64V224c0-35.3 28.7-64 64-64h67.8L266.7 40.1c9.4-8.4 22.9-10.4 34.4-5.3z" />
                      </svg>
                      Repeat Question
                    </button>
                    <button className="w-full bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg py-2 flex items-center justify-center">
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 512 512">
                        <path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM192 160H320c17.7 0 32 14.3 32 32V320c0 17.7-14.3 32-32 32H192c-17.7 0-32-14.3-32-32V192c0-17.7 14.3-32 32-32z" />
                      </svg>
                      End Interview
                    </button>
                  </div>
                </div>
              </div>

              {/* Chat/Transcript Side */}
              <div className="w-full md:w-2/3 p-6">
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-white">Interview Transcript</h3>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-400">Duration: 05:23</span>
                      <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                      <span className="text-sm font-medium text-green-500">Live</span>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto mb-6 space-y-4">
                    {chatMessages.map((message, index) => (
                      <div key={index} className={`flex items-start ${message.type === 'user' ? 'justify-end' : ''}`}>
                        {message.type === 'ai' && (
                          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white mr-3 flex-shrink-0">
                            {robotIcon}
                          </div>
                        )}
                        <div className={`rounded-lg p-3 max-w-[80%] ${message.type === 'ai'
                          ? 'bg-gray-700'
                          : 'bg-[#38BDF8]/10'
                          }`}>
                          <p className={`${message.type === 'ai'
                            ? 'text-gray-200'
                            : 'text-white'
                            }`}>
                            {message.message}
                          </p>
                        </div>
                        {message.type === 'user' && (
                          <div className="w-8 h-8 rounded-full bg-[#38BDF8] flex items-center justify-center text-white ml-3 flex-shrink-0">
                            {userIcon}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Voice Input Area */}
                  <div className="border-t border-gray-700 pt-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                        <span className="text-sm font-medium text-gray-300">Recording</span>
                      </div>
                      <div>
                        <span className="text-sm text-gray-400">Press space to pause/resume</span>
                      </div>
                    </div>

                    <div className="bg-gray-900 rounded-lg p-4 flex items-center">
                      <div className="flex-1 flex space-x-1 items-center">
                        {voiceWaveHeights.map((height, index) => (
                          <div
                            key={index}
                            className={`w-1 h-${height} bg-[#38BDF8] rounded-full animate-wave`}
                            style={{ animationDelay: `${voiceWaveDelays[index]}s` }}
                          >.</div>
                        ))}
                      </div>

                      <button className="w-12 h-12 bg-[#38BDF8] rounded-full flex items-center justify-center text-white ml-4 hover:bg-blue-500 transition">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 384 512">
                          <path d="M192 0C139 0 96 43 96 96V256c0 53 43 96 96 96s96-43 96-96V96c0-53-43-96-96-96zM64 216c0-13.3-10.7-24-24-24s-24 10.7-24 24v40c0 89.1 66.2 162.7 152 174.4V464H120c-13.3 0-24 10.7-24 24s10.7 24 24 24h72 72c13.3 0 24-10.7 24-24s-10.7-24-24-24H216V430.4c85.8-11.7 152-85.3 152-174.4V216c0-13.3-10.7-24-24-24s-24 10.7-24 24v40c0 70.7-57.3 128-128 128s-128-57.3-128-128V216z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default InterviewSection;