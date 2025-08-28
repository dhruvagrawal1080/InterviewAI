import { NavLink } from "react-router-dom";

export default function HeroSection() {
    return (
        <section id="hero" className="pt-10 pb-20 md:pb-24 relative max-w-7xl mx-auto px-4">
            <div className="container mx-auto px-4 relative z-10">
                <div className="flex flex-col md:flex-row items-center">
                    {/* Left side content */}
                    <div className="w-full md:w-1/2 pr-0 md:pr-8 mb-10 md:mb-0">
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary text-white leading-tight mb-6">
                            Practice Interviews with Your{" "}
                            <span className="text-accent">AI Voice Coach</span>
                        </h1>
                        <p className="text-gray-300 text-lg mb-8">
                            Upload your resume or tell us about yourself — then start a
                            realistic voice-based interview powered by AI. Get instant
                            feedback and improve your interview skills.
                        </p>
                        <NavLink to={'upload'} className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 text-lg">
                            <span className="bg-[#38BDF8] hover:bg-blue-500 text-white font-semibold rounded-lg px-8 py-4 text-center transition flex items-center justify-center cursor-pointer">
                                <svg
                                    className="w-5 h-5 mr-2"
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 384 512"
                                    fill="currentColor"
                                >
                                    <path d="M96 96V256c0 53 43 96 96 96s96-43 96-96H208c-8.8 0-16-7.2-16-16s7.2-16 
                    16-16h80V192H208c-8.8 0-16-7.2-16-16s7.2-16 
                    16-16h80V128H208c-8.8 0-16-7.2-16-16s7.2-16 
                    16-16h80c0-53-43-96-96-96S96 43 96 
                    96zM320 240v16c0 70.7-57.3 128-128 
                    128s-128-57.3-128-128V216c0-13.3-10.7-24-24-24s-24 
                    10.7-24 24v40c0 89.1 66.2 162.7 152 
                    174.4V464H120c-13.3 0-24 10.7-24 
                    24s10.7 24 24 24h72 72c13.3 0 
                    24-10.7 24-24s-10.7-24-24-24H216V430.4c85.8-11.7 
                    152-85.3 152-174.4V216c0-13.3-10.7-24-24-24s-24 
                    10.7-24 24v24z" />
                                </svg>
                                Start Voice Interview
                            </span>
                        </NavLink>
                    </div>

                    {/* Right side image */}
                    <div className="w-full md:w-1/2">
                        <div className="relative border">
                            <img
                                className="w-full rounded-xl shadow-lg"
                                src="https://storage.googleapis.com/uxpilot-auth.appspot.com/f517a8daa8-d0c7303737ba27163681.png"
                                alt="futuristic AI voice interview simulator"
                            />
                            <div className="absolute -bottom-6 -right-6 bg-gray-800 rounded-lg p-4 shadow-lg">
                                <div className="flex items-center space-x-3">
                                    <div className="flex space-x-1">
                                        {[0.1, 0.2, 0.3, 0.4, 0.5].map((delay, i) => (
                                            <div
                                                key={i}
                                                className="w-1 h-8 bg-[#38BDF8] rounded-full animate-wave"
                                                style={{ animationDelay: `${delay}s` }}
                                            ></div>
                                        ))}
                                    </div>
                                    <span className="text-sm font-medium text-gray-300">
                                        AI Listening...
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
