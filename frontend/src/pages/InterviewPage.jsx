import axios from 'axios';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { IoIosSend } from "react-icons/io";
import { TiMicrophone } from "react-icons/ti";
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { toast } from "sonner";
import { setIsChatStarted, setIsResumeUploaded, setUserId } from '../slices/generalInfo.slice';
import { resetMessages, setMessages } from '../slices/messages.slice';
import { setSummary } from '../slices/summary.slice';

const InterviewPage = () => {
    const { userId, isChatStarted } = useSelector((state) => state.generalInfo);
    const { messages } = useSelector((state) => state.messages);

    const dispatch = useDispatch();

    const [isRecording, setIsRecording] = useState(false);
    const [isAISpeaking, setIsAISpeaking] = useState(false);
    const [isAIThinking, setIsAIThinking] = useState(false);
    const [duration, setDuration] = useState(0);
    const [audioLevel, setAudioLevel] = useState(0);
    const [accumulatedText, setAccumulatedText] = useState('');
    const navigate = useNavigate();

    const { transcript, listening, resetTranscript, browserSupportsSpeechRecognition } = useSpeechRecognition();

    const synthRef = useRef(null);
    const intervalRef = useRef(null);
    const audioContextRef = useRef(null);
    const analyserRef = useRef(null);
    const streamRef = useRef(null);
    const micStream = useRef(null);
    const lastTranscript = useRef('');

    // Memoize static arrays to prevent unnecessary re-renders
    const waveAnimations = useMemo(() => [0.1, 0.2, 0.3, 0.4, 0.5], []);
    const voiceWaveHeights = useMemo(() => [10, 14, 16, 12, 8, 14, 10, 6, 10, 12], []);
    const voiceWaveDelays = useMemo(() => [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0], []);

    const robotIcon = useMemo(() => (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 640 512">
            <path d="M320 0c17.7 0 32 14.3 32 32V96H472c39.8 0 72 32.2 72 72V440c0 39.8-32.2 72-72 72H168c-39.8 0-72-32.2-72-72V168c0-39.8 32.2-72 72-72H288V32c0-17.7 14.3-32 32-32zM208 384c-8.8 0-16 7.2-16 16s7.2 16 16 16h32c8.8 0 16-7.2 16-16s-7.2-16-16-16H208zm96 0c-8.8 0-16 7.2-16 16s7.2 16 16 16h32c8.8 0 16-7.2 16-16s-7.2-16-16-16H304zm96 0c-8.8 0-16 7.2-16 16s7.2 16 16 16h32c8.8 0 16-7.2 16-16s-7.2-16-16-16H400zM264 256a40 40 0 1 0 -80 0 40 40 0 1 0 0 80zm152 40a40 40 0 1 0 0-80 40 40 0 1 0 0 80zM48 224H64V416H48c-26.5 0-48-21.5-48-48V272c0-26.5 21.5-48 48-48zm544 0c26.5 0 48 21.5 48 48v96c0 26.5-21.5 48-48 48H576V224h16z" />
        </svg>
    ), []);

    const userIcon = useMemo(() => (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 448 512">
            <path d="M224 256A128 128 0 1 0 224 0a128 128 0 1 0 0 256zm-45.7 48C79.8 304 0 383.8 0 482.3C0 498.7 13.3 512 29.7 512H418.3c16.4 0 29.7-13.3 29.7-29.7C448 383.8 368.2 304 269.7 304H178.3z" />
        </svg>
    ), []);

    const getCurrentQuestion = useCallback(() => {
        const lastAIMessage = [...messages].reverse().find(msg => msg.type === 'ai');
        return lastAIMessage ? lastAIMessage.message : '';
    }, [messages]);

    const currentQuestion = useMemo(() => getCurrentQuestion(), [getCurrentQuestion]);

    const formatDuration = useCallback((seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }, []);

    const formattedDuration = useMemo(() => formatDuration(duration), [duration, formatDuration]);

    const handleUpload = useCallback(async (message) => {
        setIsAIThinking(true);

        try {
            const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/ask`, { userId, message });

            if (response.data.success) {
                const newMessage = { type: 'ai', message: response.data.reply };
                dispatch(setMessages(newMessage))

                setTimeout(() => {
                    speakMessage(response.data.reply);
                }, 500);
            }
        } catch (error) {
            const errorMessage = error.response?.data?.error || "Failed to chat with AI";
            toast.error(errorMessage);
        } finally {
            setIsAIThinking(false);
        }
    }, [userId, dispatch]);

    const speakMessage = useCallback(async (message) => {
        try {
            setIsAISpeaking(true);

            const response = await axios.post(
                `https://texttospeech.googleapis.com/v1/text:synthesize?key=${import.meta.env.VITE_GOOGLE_TTS_API_KEY}`,
                {
                    input: { text: message },
                    voice: {
                        languageCode: "hi-IN",
                        name: "hi-IN-Chirp3-HD-Achird",
                        ssmlGender: "NEUTRAL"
                    },
                    audioConfig: {
                        audioEncoding: "MP3"
                    }
                },
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.data.audioContent) {
                const audio = new Audio("data:audio/mp3;base64," + response.data.audioContent);

                audio.onended = () => {
                    setIsAISpeaking(false);
                };

                audio.onerror = () => {
                    setIsAISpeaking(false);
                    console.error('Audio playback error');
                };

                await audio.play();
            } else {
                throw new Error('No audio content received');
            }
        } catch (error) {
            console.error('Google TTS Error:', error);
            setIsAISpeaking(false);

            // Fallback to browser TTS
            if ('speechSynthesis' in window) {
                const utterance = new SpeechSynthesisUtterance(message);
                utterance.onend = () => setIsAISpeaking(false);
                utterance.onerror = () => setIsAISpeaking(false);
                window.speechSynthesis.speak(utterance);
            }
        }
    }, []);

    useEffect(() => {
        if (!isChatStarted) {
            handleUpload("Start the interview");
            dispatch(setIsChatStarted(true));
            dispatch(setSummary(null));
        }
    }, [isChatStarted, handleUpload, dispatch]);

    // Append only new speech to accumulated text
    useEffect(() => {
        if (transcript) {
            const newSpeech = transcript.slice(lastTranscript.current.length);
            if (newSpeech) { // Only update if there's actually new speech
                setAccumulatedText((prev) => prev + newSpeech);
                lastTranscript.current = transcript;
            }
        }
    }, [transcript]);

    useEffect(() => {
        if (!listening && isRecording) {
            setIsRecording(false);
            setAudioLevel(0);
        }
    }, [listening, isRecording]);

    useEffect(() => {
        if ('speechSynthesis' in window) {
            synthRef.current = window.speechSynthesis;

            // Resume speech synthesis if it was paused (some browsers pause it)
            if (synthRef.current.paused) {
                synthRef.current.resume();
            }
        }

        // Start duration timer
        intervalRef.current = setInterval(() => {
            setDuration(prev => prev + 1);
        }, 1000);

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
            if (micStream.current) {
                micStream.current.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    const startAudioMonitoring = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    noiseSuppression: true,
                    echoCancellation: true,
                }
            });
            streamRef.current = stream;

            audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
            analyserRef.current = audioContextRef.current.createAnalyser();
            const source = audioContextRef.current.createMediaStreamSource(stream);
            source.connect(analyserRef.current);

            const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);

            const updateAudioLevel = () => {
                if (analyserRef.current && isRecording) {
                    analyserRef.current.getByteFrequencyData(dataArray);
                    const average = dataArray.reduce((sum, value) => sum + value) / dataArray.length;
                    setAudioLevel(average);
                    requestAnimationFrame(updateAudioLevel);
                }
            };

            updateAudioLevel();
        } catch (error) {
            console.error('Error accessing microphone:', error);
        }
    }, [isRecording]);

    const startListening = useCallback(async () => {
        if (!browserSupportsSpeechRecognition) {
            alert('Browser doesn\'t support speech recognition.');
            return;
        }

        try {
            micStream.current = await navigator.mediaDevices.getUserMedia({
                audio: {
                    noiseSuppression: true,
                    echoCancellation: true,
                },
            });

            SpeechRecognition.startListening({
                continuous: true,
                language: 'en-US',
            });

            setIsRecording(true);
            startAudioMonitoring();
        } catch (err) {
            console.error('Microphone access denied:', err);
            alert('Microphone access denied. Please allow microphone permissions.');
        }
    }, [browserSupportsSpeechRecognition, startAudioMonitoring]);

    const stopListeningAndReleaseMic = useCallback(() => {
        try {
            SpeechRecognition.stopListening();
        } catch (error) {
            console.log('Speech recognition already stopped');
        }

        setIsRecording(false);
        setAudioLevel(0);

        // Release microphone resources
        if (micStream.current) {
            micStream.current.getTracks().forEach((track) => track.stop());
            micStream.current = null;
        }
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
    }, []);

    const sendMessage = useCallback(() => {
        const message = accumulatedText.trim();
        if (!message) {
            toast.error("Please Say Something");
            return;
        }

        // FIRST: Stop recording immediately before processing the message
        if (isRecording) {
            stopListeningAndReleaseMic();
        }

        // THEN: Reset states
        setAccumulatedText('');
        resetTranscript();
        lastTranscript.current = '';

        // THEN: Create and add the message
        const newMessage = { type: 'user', message: message };
        dispatch(setMessages(newMessage));
        handleUpload(message);
    }, [accumulatedText, isRecording, stopListeningAndReleaseMic, resetTranscript, dispatch, handleUpload]);

    const toggleRecording = useCallback(() => {
        if (isRecording) {
            stopListeningAndReleaseMic();
        } else {
            startListening();
        }
    }, [isRecording, stopListeningAndReleaseMic, startListening]);

    const repeatQuestion = useCallback(() => {
        const lastAIMessage = [...messages].reverse().find(msg => msg.type === 'ai');
        if (lastAIMessage) {
            speakMessage(lastAIMessage.message);
        }
    }, [messages, speakMessage]);

    const endInterview = useCallback(() => {
        setIsRecording(false);
        setIsAISpeaking(false);
        SpeechRecognition.stopListening();

        // Stop any playing audio
        const audioElements = document.getElementsByTagName('audio');
        Array.from(audioElements).forEach(audio => {
            audio.pause();
            audio.currentTime = 0;
        });

        // Release all microphone resources
        if (micStream.current) {
            micStream.current.getTracks().forEach(track => track.stop());
            micStream.current = null;
        }
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }

        const endMessage = "Thank you for the interview! You did great. Good luck with your future!";

        // Speak the end message
        setTimeout(() => {
            speakMessage(endMessage);
        }, 500);

        dispatch(setSummary(null))
        navigate("/summary");

        // Reset state after navigation (with a small delay to ensure navigation completes)
        setTimeout(() => {
            dispatch(setIsChatStarted(false));
            dispatch(setIsResumeUploaded(false));
            dispatch(resetMessages());
            dispatch(setUserId(null));
        }, 1000);
    }, [dispatch, speakMessage, navigate]);

    // Optimize textarea change handler
    const handleTextareaChange = useCallback((e) => {
        setAccumulatedText(e.target.value.replace(/^(Speaking|Spoken):\s*/, ''));
    }, []);

    const handleTextareaInput = useCallback((e) => {
        e.target.style.height = 'auto';
        e.target.style.height = Math.min(e.target.scrollHeight, 64) + 'px';
    }, []);

    // Show error message if speech recognition is not supported
    if (!browserSupportsSpeechRecognition) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center p-8 bg-red-50 rounded-lg">
                    <h2 className="text-xl font-bold text-red-600 mb-4">Speech Recognition Not Supported</h2>
                    <p className="text-red-500">Your browser doesn't support speech recognition. Please use Chrome or Edge for the best experience.</p>
                </div>
            </div>
        );
    }

    return (
        <section id="interview-section" className=" bg-gray-900 mt-20 h-[calc(100vh-5rem)]">
            <div className="h-full">
                <div className="bg-gray-800 shadow-md h-full">
                    <div className="flex flex-col md:flex-row h-full">
                        {/* AI Interviewer Side */}
                        <div className="w-full md:w-1/3 p-6">
                            <div className="flex flex-col h-full">
                                <div className="text-center mb-6">
                                    <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-4 transition-all duration-300 ${isAIThinking
                                        ? 'bg-[#38BDF8]/40 animate-pulse'
                                        : isAISpeaking
                                            ? 'bg-[#38BDF8]/30'
                                            : 'bg-[#38BDF8]/20'
                                        }`}>
                                        <svg className={`text-[#38BDF8] text-3xl w-8 h-8 transition-all duration-300 ${isAIThinking ? 'animate-pulse' : ''
                                            }`} fill="currentColor" viewBox="0 0 640 512">
                                            <path d="M320 0c17.7 0 32 14.3 32 32V96H472c39.8 0 72 32.2 72 72V440c0 39.8-32.2 72-72 72H168c-39.8 0-72-32.2-72-72V168c0-39.8 32.2-72 72-72H288V32c0-17.7 14.3-32 32-32zM208 384c-8.8 0-16 7.2-16 16s7.2 16 16 16h32c8.8 0 16-7.2 16-16s-7.2-16-16-16H208zm96 0c-8.8 0-16 7.2-16 16s7.2 16 16 16h32c8.8 0 16-7.2 16-16s-7.2-16-16-16H304zm96 0c-8.8 0-16 7.2-16 16s7.2 16 16 16h32c8.8 0 16-7.2 16-16s-7.2-16-16-16H400zM264 256a40 40 0 1 0 -80 0 40 40 0 1 0 0 80zm152 40a40 40 0 1 0 0-80 40 40 0 1 0 0 80zM48 224H64V416H48c-26.5 0-48-21.5-48-48V272c0-26.5 21.5-48 48-48zm544 0c26.5 0 48 21.5 48 48v96c0 26.5-21.5 48-48 48H576V224h16z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-xl font-semibold text-white">AI Interviewer</h3>
                                    <p className="text-blue-300 text-sm">Professional • Adaptive • Helpful</p>
                                </div>

                                <div className="flex-1 flex flex-col justify-center items-center">
                                    <div className="mb-6 text-center">
                                        {isAIThinking && (
                                            <div className="flex justify-center space-x-2 mb-3">
                                                <div className="w-3 h-3 bg-[#38BDF8] rounded-full animate-thinking-bounce" style={{ animationDelay: '0ms' }}></div>
                                                <div className="w-3 h-3 bg-[#38BDF8] rounded-full animate-thinking-bounce" style={{ animationDelay: '150ms' }}></div>
                                                <div className="w-3 h-3 bg-[#38BDF8] rounded-full animate-thinking-bounce" style={{ animationDelay: '300ms' }}></div>
                                            </div>
                                        )}
                                        {isAISpeaking && !isAIThinking && (
                                            <div className="flex justify-center space-x-1 mb-3">
                                                {waveAnimations.map((delay, index) => (
                                                    <div
                                                        key={index}
                                                        className="w-1 h-6 bg-[#38BDF8] rounded-full animate-wave"
                                                        style={{ animationDelay: `${delay}s` }}
                                                    ></div>
                                                ))}
                                            </div>
                                        )}
                                        <p className="text-blue-200 text-sm">
                                            {isAIThinking ? 'AI is thinking...' : isAISpeaking ? 'AI is speaking...' : 'Waiting for your response...'}
                                        </p>
                                    </div>

                                    <div className="w-full space-y-3">
                                        <div className={`bg-blue-900/40 rounded-lg p-4 transition-all duration-300 ${isAIThinking ? 'animate-pulse bg-blue-900/60' : ''
                                            }`}>
                                            <p className="text-blue-100 text-sm">
                                                {currentQuestion || (isAIThinking ? 'Processing your response...' : '')}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6 space-y-3">
                                    <button
                                        onClick={repeatQuestion}
                                        className="w-full bg-blue-900/40 hover:bg-blue-800 text-white rounded-lg py-2 flex items-center justify-center transition-colors cursor-pointer"
                                    >
                                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 640 512">
                                            <path d="M533.6 32.5C598.5 85.3 640 165.8 640 256s-41.5 170.8-106.4 223.5c-10.3 8.4-25.4 6.8-33.8-3.5s-6.8-25.4 3.5-33.8C557.5 398.2 592 331.2 592 256s-34.5-142.2-88.7-186.3c-10.3-8.4-11.8-23.5-3.5-33.8s23.5-11.8 33.8-3.5zM473.1 107c43.2 35.2 70.9 88.9 70.9 149s-27.7 113.8-70.9 149c-10.3 8.4-25.4 6.8-33.8-3.5s-6.8-25.4 3.5-33.8C475.3 341.3 496 301.1 496 256s-20.7-85.3-53.2-111.8c-10.3-8.4-11.8-23.5-3.5-33.8s23.5-11.8 33.8-3.5zm-60.5 74.5C434.1 199.1 448 225.9 448 256s-13.9 56.9-35.4 74.5c-10.3 8.4-25.4 6.8-33.8-3.5s-6.8-25.4 3.5-33.8C393.1 284.4 400 271 400 256s-6.9-28.4-17.7-37.3c-10.3-8.4-11.8-23.5-3.5-33.8s23.5-11.8 33.8-3.5zM301.1 34.8C312.6 40 320 51.4 320 64V448c0 12.6-7.4 24-18.9 29.2s-25 3.1-34.4-5.3L131.8 352H64c-35.3 0-64-28.7-64-64V224c0-35.3 28.7-64 64-64h67.8L266.7 40.1c9.4-8.4 22.9-10.4 34.4-5.3z" />
                                        </svg>
                                        Repeat Question
                                    </button>
                                    <button
                                        onClick={endInterview}
                                        className="w-full bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg py-2 flex items-center justify-center transition-colors cursor-pointer"
                                    >
                                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 512 512">
                                            <path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM192 160H320c17.7 0 32 14.3 32 32V320c0 17.7-14.3 32-32 32H192c-17.7 0-32-14.3-32-32V192c0-17.7 14.3-32 32-32z" />
                                        </svg>
                                        End Interview
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Chat/Transcript Side */}
                        <div className="w-full md:w-2/3 p-6 bg-[#1E2939]">
                            <div className="flex flex-col h-full">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-xl font-semibold text-white">Interview Transcript</h3>
                                    <div className="flex items-center space-x-2">
                                        <span className="text-sm text-gray-400">
                                            Duration: {formattedDuration}
                                        </span>
                                        <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                                        <span className="text-sm font-medium text-green-500">Live</span>
                                    </div>
                                </div>

                                <div className="flex-1 overflow-y-auto mb-6 space-y-4 max-h-96">
                                    {messages.map((message, index) => (
                                        <div key={index} className={`flex items-start ${message.type === 'user' ? 'justify-end' : ''} pr-1`}>
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

                                    {/* AI Thinking Indicator */}
                                    {isAIThinking && (
                                        <div className="flex items-start pr-1">
                                            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white mr-3 flex-shrink-0">
                                                {robotIcon}
                                            </div>
                                            <div className="bg-gray-700 rounded-lg p-3 max-w-[80%]">
                                                <div className="flex items-center space-x-2">
                                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-thinking-bounce" style={{ animationDelay: '0ms' }}></div>
                                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-thinking-bounce" style={{ animationDelay: '150ms' }}></div>
                                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-thinking-bounce" style={{ animationDelay: '300ms' }}></div>
                                                    <span className="text-gray-400 text-sm">AI is thinking...</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Voice Input Area */}
                                <div className="border-t border-gray-700 pt-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center space-x-2">
                                            <div className={`w-3 h-3 rounded-full ${isRecording ? 'bg-red-500' : 'bg-gray-400'}`}></div>
                                            <span className="text-sm font-medium text-gray-300">
                                                {isRecording ? 'Recording' : 'Ready to Record'}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-sm text-gray-400">Click microphone to start/stop</span>
                                        </div>
                                    </div>

                                    <div className="bg-gray-900 rounded-lg p-4 flex items-center">
                                        <div className="flex-1 flex space-x-1 items-center">
                                            {isRecording ? (
                                                voiceWaveHeights.map((height, index) => (
                                                    <div
                                                        key={index}
                                                        className={`w-1 bg-[#38BDF8] rounded-full animate-wave`}
                                                        style={{
                                                            height: `${Math.max(height + (audioLevel / 10), 6)}px`,
                                                            animationDelay: `${voiceWaveDelays[index]}s`
                                                        }}
                                                    ></div>
                                                ))
                                            ) : (
                                                <div className="flex-1 text-center text-gray-400">
                                                    <span className="text-sm">Click the microphone to start speaking</span>
                                                </div>
                                            )}
                                        </div>

                                        <button
                                            onClick={toggleRecording}
                                            className={`w-12 h-12 rounded-full flex items-center justify-center text-white ml-4 transition-colors ${isRecording
                                                ? 'bg-red-500 hover:bg-red-600'
                                                : 'bg-[#38BDF8] hover:bg-blue-500'
                                                } 
                                                ${isAIThinking ? "cursor-not-allowed" : "cursor-pointer"}`}
                                            disabled={isAIThinking}
                                        >
                                            <TiMicrophone className='w-8 h-8' />
                                        </button>

                                        {accumulatedText &&
                                            <button
                                                onClick={sendMessage}
                                                className={`w-12 h-12 rounded-full flex items-center justify-center text-white ml-4 transition-colors bg-[#38BDF8] hover:bg-blue-500 ${isAIThinking ? "cursor-not-allowed" : "cursor-pointer"}`}
                                                disabled={isAIThinking}
                                            >
                                                <IoIosSend className='w-8 h-8' />
                                            </button>
                                        }
                                    </div>

                                    {accumulatedText && (
                                        <div className="mt-3 p-3 bg-blue-900/20 rounded-lg">
                                            <textarea
                                                value={`${isRecording ? 'Speaking: ' : 'Spoken: '}${accumulatedText}`}
                                                onChange={handleTextareaChange}
                                                className="w-full text-sm text-blue-200 bg-transparent border-none outline-none resize-none p-0 m-0 font-inherit leading-inherit"
                                                rows="1"
                                                style={{
                                                    fontFamily: 'inherit',
                                                    fontSize: 'inherit',
                                                    lineHeight: 'inherit',
                                                    height: '3rem',
                                                    overflowY: 'auto'
                                                }}
                                                onInput={handleTextareaInput}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default InterviewPage;