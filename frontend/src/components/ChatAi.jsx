import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import axiosClient from "../utils/axiosClient";
import { Send, Bot, User, Lightbulb } from 'lucide-react';

function ChatAi({problem}) {
    const [messages, setMessages] = useState([
        { 
            role: 'model', 
            parts: [{
                text: `👋 Hi! I'm your DSA tutor. I'm here to help you with the "${problem?.title || 'current problem'}".\n\n🎯 I can help you with:\n• Step-by-step hints and guidance\n• Code review and debugging\n• Algorithm explanations\n• Time/space complexity analysis\n• Different solution approaches\n\n💡 What would you like to know about this problem?`
            }]
        }
    ]);

    const [isLoading, setIsLoading] = useState(false);
    const { register, handleSubmit, reset, formState: {errors} } = useForm();
    const messagesEndRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const onSubmit = async (data) => {
        if (!data.message.trim()) return;
        
        const newUserMessage = { role: 'user', parts:[{text: data.message}] };
        const updatedMessages = [...messages, newUserMessage];
        
        setMessages(updatedMessages);
        setIsLoading(true);
        reset();

        try {
            const response = await axiosClient.post("/ai/chat", {
                messages: updatedMessages,
                title: problem?.title,
                description: problem?.description,
                testCases: problem?.visibleTestCases,
                startCode: problem?.startCode
            });

            setMessages(prev => [...prev, { 
                role: 'model', 
                parts: [{text: response.data.message}] 
            }]);
        } catch (error) {
            console.error("AI Chat Error:", error);
            setMessages(prev => [...prev, { 
                role: 'model', 
                parts: [{text: "I'm having trouble right now. Please try asking about the specific coding problem you're working on."}]
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full max-h-[70vh] bg-gray-800/50 rounded-lg border border-gray-600/50">
            <div className="flex items-center space-x-3 p-4 border-b border-gray-600/50 bg-gray-700/50">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h3 className="font-semibold text-white">DSA AI Tutor</h3>
                    <p className="text-xs text-gray-400">Ask me about algorithms and data structures</p>
                </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, index) => (
                    <motion.div 
                        key={index} 
                        className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                        <div className={`flex items-start space-x-2 max-w-[80%] ${
                            msg.role === "user" ? "flex-row-reverse space-x-reverse" : ""
                        }`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                                msg.role === "user" 
                                    ? "bg-blue-600" 
                                    : "bg-gradient-to-r from-purple-500 to-pink-500"
                            }`}>
                                {msg.role === "user" ? (
                                    <User className="w-4 h-4 text-white" />
                                ) : (
                                    <Bot className="w-4 h-4 text-white" />
                                )}
                            </div>
                            <div className={`p-3 rounded-lg ${
                                msg.role === "user" 
                                    ? "bg-blue-600 text-white" 
                                    : "bg-gray-700/70 text-gray-100 border border-gray-600/50"
                            }`}>
                                <pre className="whitespace-pre-wrap text-sm font-sans">
                                    {msg.parts[0].text}
                                </pre>
                            </div>
                        </div>
                    </motion.div>
                ))}
                
                {isLoading && (
                    <motion.div 
                        className="flex justify-start"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <div className="flex items-start space-x-2 max-w-[80%]">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                                <Bot className="w-4 h-4 text-white" />
                            </div>
                            <div className="p-3 rounded-lg bg-gray-700/70 border border-gray-600/50">
                                <div className="flex space-x-1">
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
                
                <div ref={messagesEndRef} />
            </div>
            
            <form 
                onSubmit={handleSubmit(onSubmit)} 
                className="p-4 border-t border-gray-600/50 bg-gray-700/30"
            >
                <div className="flex items-center space-x-3">
                    <div className="flex-1 relative">
                        <input 
                            placeholder="Ask about algorithms, debugging, hints, or solutions..." 
                            className="w-full p-3 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" 
                            {...register("message", { required: true, minLength: 1 })}
                            disabled={isLoading}
                        />
                        {errors.message && (
                            <p className="text-red-400 text-xs mt-1">Please enter a message</p>
                        )}
                    </div>
                    <motion.button 
                        type="submit" 
                        className="px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center space-x-2"
                        disabled={errors.message || isLoading}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <Send className="w-4 h-4" />
                        <span>{isLoading ? 'Sending...' : 'Send'}</span>
                    </motion.button>
                </div>
            </form>
        </div>
    );
}

export default ChatAi;