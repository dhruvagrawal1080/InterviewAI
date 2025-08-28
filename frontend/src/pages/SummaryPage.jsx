import axios from 'axios';
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setSummary } from "../slices/summary.slice";
import { v4 as uuidv4 } from "uuid";
import { setUserId } from '../slices/generalInfo.slice';
import { useNavigate } from 'react-router-dom';

const SummaryPage = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { userId } = useSelector((state) => state.generalInfo);
    const { summary } = useSelector((state) => state.summary);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        if (summary) {
            setLoading(false);
            return;
        }

        const fetchSummary = async () => {
            try {
                setLoading(true);

                const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/summary`, {
                    userId: userId,
                    message: "Generate interview summary"
                }, {
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });

                if (response.data.success && response.data.reply) {
                    const transformedSummary = transformApiResponse(response.data.reply);
                    dispatch(setSummary(transformedSummary));
                } else {
                    throw new Error('Invalid API response format');
                }
            } catch (err) {
                console.error('Error fetching summary:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchSummary();
    }, []);

    // Transform API response to match the component's expected structure
    const transformApiResponse = (apiData) => {
        return {
            overall: apiData.overallPerformance || "No overall performance data available",
            date: new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            }),
            title: apiData.title || "Interview Summary",
            score: typeof apiData.score === 'string' ? parseFloat(apiData.score) : apiData.score || 0,
            rating: apiData.rating || "Not Available",
            scores: [
                {
                    label: "Behavioral",
                    value: apiData.sectionScores?.behavioral || 0
                },
                {
                    label: "Technical",
                    value: apiData.sectionScores?.technical || 0
                },
                {
                    label: "Communication",
                    value: apiData.sectionScores?.communication || 0
                },
            ],
            strengths: apiData.strengths || [],
            improvements: apiData.areasOfImprovement || [],
            listeningAdaptability: [
                apiData.listeningAdaptability?.answeredExactly || "No data available",
                apiData.listeningAdaptability?.adaptability || "No data available"
            ],
            domainInsight: [
                apiData.domainSpecificInsight?.depth || "No data available",
                apiData.domainSpecificInsight?.industryAwareness || "No data available"
            ],
            communicationSkills: apiData.communicationSkills || "No communication skills data available",
            recommendations: (apiData.recommendedPractice || []).map((practice, index) => ({
                title: `Practice ${index + 1}`,
                description: practice
            })),
            encouragement: "Great job on completing your interview! Keep practicing to improve further."
        };
    };

    const takeAnotherInterviewHandler = () => {
        dispatch(setSummary(null));
        const newId = uuidv4();
        dispatch(setUserId(newId));
        navigate('/upload');
    }

    // Loading state
    if (loading) {
        return (
            <section className="py-16 bg-gray-900 mt-20 h-full">
                <div className="container mx-auto px-4 max-w-6xl">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#38BDF8] mx-auto mb-4"></div>
                        <h2 className="text-2xl font-bold text-white mb-4">
                            Generating Your Interview Summary...
                        </h2>
                        <p className="text-gray-300">
                            Please wait while we analyze your interview performance.
                        </p>
                    </div>
                </div>
            </section>
        );
    }

    // Error state
    if (error) {
        return (
            <section className="py-16 bg-gray-900 mt-20 h-full">
                <div className="container mx-auto px-4 max-w-6xl">
                    <div className="text-center">
                        <div className="bg-red-900 rounded-lg p-6">
                            <h2 className="text-2xl font-bold text-red-400 mb-4">
                                Error Loading Summary
                            </h2>
                            <p className="text-red-400 mb-4">
                                {error}
                            </p>
                            <button
                                onClick={() => window.location.reload()}
                                className="bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg px-6 py-3 transition"
                            >
                                Try Again
                            </button>
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="py-16 bg-gray-900 mt-20">
            <div className="container mx-auto px-4 max-w-6xl">
                {/* Header */}
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                        Your Interview Summary
                    </h2>
                    <p className="text-gray-300">{summary.overall}</p>
                </div>

                {/* Summary Card */}
                <div className="bg-gray-800 rounded-xl shadow-md p-6 md:p-8 space-y-8">
                    {/* Interview Info */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                        <div>
                            <h3 className="text-xl font-semibold text-white">
                                {summary.title}
                            </h3>
                            <p className="text-gray-400">
                                Completed on {summary.date}
                            </p>
                        </div>
                        <div className="mt-4 md:mt-0 flex items-center">
                            <div className="w-12 h-12 rounded-full bg-[#38BDF8]/20 flex items-center justify-center mr-3">
                                <span className="text-[#38BDF8] font-bold text-lg">
                                    {summary.score}
                                </span>
                            </div>
                            <div>
                                <p className="text-sm text-gray-400">
                                    Overall Score
                                </p>
                                <p className="font-medium text-white">
                                    {summary.rating}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Section: Scores */}
                    <div>
                        <h4 className="text-lg font-semibold text-white mb-3">
                            Section Scores
                        </h4>
                        <div className="flex flex-wrap gap-4">
                            {summary.scores.map((score, i) => (
                                <div
                                    key={i}
                                    className="bg-gray-700 px-4 py-2 rounded-lg"
                                >
                                    <p className="font-medium text-white">
                                        {score.label}
                                    </p>
                                    <p className="text-gray-300">
                                        {score.value}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Section: Strengths */}
                    <div>
                        <h4 className="text-lg font-semibold text-white mb-3">
                            Key Strengths
                        </h4>
                        <ul className="list-disc pl-6 space-y-2 text-gray-300">
                            {summary.strengths.map((point, i) => (
                                <li key={i}>{point}</li>
                            ))}
                        </ul>
                    </div>

                    {/* Section: Improvements */}
                    <div>
                        <h4 className="text-lg font-semibold text-white mb-3">
                            Areas for Improvement
                        </h4>
                        <ul className="list-disc pl-6 space-y-2 text-gray-300">
                            {summary.improvements.map((point, i) => (
                                <li key={i}>{point}</li>
                            ))}
                        </ul>
                    </div>

                    {/* Listening & Adaptability */}
                    <div>
                        <h4 className="text-lg font-semibold text-white mb-3">
                            Listening & Adaptability
                        </h4>
                        <ul className="list-disc pl-6 space-y-2 text-gray-300">
                            {summary.listeningAdaptability.map((point, i) => (
                                <li key={i}>{point}</li>
                            ))}
                        </ul>
                    </div>

                    {/* Domain-Specific Insight */}
                    <div>
                        <h4 className="text-lg font-semibold text-white mb-3">
                            Domain-Specific Insight
                        </h4>
                        <ul className="list-disc pl-6 space-y-2 text-gray-300">
                            {summary.domainInsight.map((point, i) => (
                                <li key={i}>{point}</li>
                            ))}
                        </ul>
                    </div>

                    {/* Section: Recommendations */}
                    <div>
                        <h4 className="text-lg font-semibold text-white mb-3">
                            Recommended Practice
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {summary.recommendations.map((rec, i) => (
                                <div
                                    key={i}
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

                    {/* Section: Encouragement */}
                    <div>
                        <h4 className="text-lg font-semibold text-white mb-3">
                            Encouragement & Next Steps
                        </h4>
                        <p className="text-gray-300">
                            {summary.encouragement}
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-8 flex flex-col sm:flex-row gap-4">
                        <button
                            className="bg-[#38BDF8] hover:bg-blue-500 text-white font-semibold rounded-lg px-6 py-3 transition flex-1 cursor-pointer"
                            onClick={takeAnotherInterviewHandler}
                        >
                            Take Another Interview
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default SummaryPage;