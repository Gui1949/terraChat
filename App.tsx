import React, { useState, useEffect, useRef } from 'react';
import { ChatMode, Message, LocationData } from './types';
import { generateResponse } from './services/geminiService';
import { MODEL_CONFIGS } from './constants';
import { MessageBubble } from './components/MessageBubble';
import { Send, MapPin, Info, Zap, Map as MapIcon, Brain, Bot } from 'lucide-react';

const App: React.FC = () => {
  // State
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<ChatMode>(ChatMode.EXPLORER);
  const [location, setLocation] = useState<LocationData | null>(null);
  const [locationStatus, setLocationStatus] = useState<'idle' | 'requesting' | 'success' | 'denied'>('idle');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Get location on mount
  useEffect(() => {
    requestLocation();
  }, []);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Focus input on mode change
  useEffect(() => {
    inputRef.current?.focus();
  }, [mode]);

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus('denied');
      return;
    }

    setLocationStatus('requesting');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
        setLocationStatus('success');
      },
      (error) => {
        console.warn("Location access denied or failed", error);
        setLocationStatus('denied');
      }
    );
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userText = inputValue.trim();
    setInputValue('');
    
    // Add User Message
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: userText,
      timestamp: Date.now()
    };
    
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const response = await generateResponse(messages, userText, mode, location);
      
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: response.text,
        timestamp: Date.now(),
        groundingMetadata: response.groundingMetadata
      };
      
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: "I'm sorry, something went wrong while processing your request. Please try again.",
        timestamp: Date.now(),
        isError: true
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100 overflow-hidden">
      
      {/* HEADER */}
      <header className="flex-shrink-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center text-white shadow-md">
            <MapIcon size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800 tracking-tight">TerraChat AI</h1>
            <p className="text-xs text-gray-500 font-medium">Location-Aware Intelligence</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
           {/* Location Status Badge */}
          <div 
            className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors cursor-pointer ${
              locationStatus === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
              locationStatus === 'denied' ? 'bg-red-50 text-red-700 border-red-200' :
              'bg-gray-50 text-gray-600 border-gray-200'
            }`}
            onClick={requestLocation}
            title={locationStatus === 'success' ? "Location active" : "Click to retry location"}
          >
            <MapPin size={12} />
            {locationStatus === 'success' ? 'GPS Active' : 
             locationStatus === 'requesting' ? 'Locating...' : 'GPS Inactive'}
          </div>

          <div className="h-8 w-[1px] bg-gray-200 mx-2 hidden sm:block"></div>
          
          <a href="https://github.com/google/generative-ai-js" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-gray-600 transition-colors">
            <Info size={20} />
          </a>
        </div>
      </header>

      {/* MAIN CONTENT: Split into Sidebar and Chat for larger screens */}
      <main className="flex-1 flex overflow-hidden relative">
        
        {/* SIDEBAR (Mode Selection) */}
        <aside className="hidden md:flex w-64 lg:w-80 bg-white border-r border-gray-200 flex-col p-4 gap-4 overflow-y-auto">
          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 px-2">Select Mode</div>
          
          {Object.values(ChatMode).map((m) => {
            const config = MODEL_CONFIGS[m];
            const isActive = mode === m;
            const Icon = m === ChatMode.EXPLORER ? MapIcon : Brain;
            
            return (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`text-left p-4 rounded-xl border-2 transition-all duration-200 group ${
                  isActive 
                    ? 'border-emerald-500 bg-emerald-50 shadow-md' 
                    : 'border-transparent bg-gray-50 hover:bg-gray-100 hover:border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className={`p-2 rounded-lg ${isActive ? 'bg-emerald-200 text-emerald-800' : 'bg-gray-200 text-gray-600'}`}>
                    <Icon size={20} />
                  </div>
                  {isActive && <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />}
                </div>
                <h3 className={`font-bold ${isActive ? 'text-emerald-900' : 'text-gray-700'}`}>{config.label}</h3>
                <p className={`text-xs mt-1 leading-relaxed ${isActive ? 'text-emerald-700' : 'text-gray-500'}`}>
                  {config.description}
                </p>
              </button>
            );
          })}

          <div className="mt-auto p-4 bg-blue-50 rounded-xl border border-blue-100">
            <h4 className="text-sm font-bold text-blue-800 flex items-center gap-2 mb-2">
              <Info size={16} />
              Tip
            </h4>
            <p className="text-xs text-blue-700 leading-relaxed">
              Switch to <strong>Explorer</strong> for real-time Google Maps data. Switch to <strong>Reasoning</strong> for complex problem solving.
            </p>
          </div>
        </aside>

        {/* CHAT AREA */}
        <div className="flex-1 flex flex-col relative w-full">
          
          {/* Chat History */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 scroll-smooth">
             {messages.length === 0 ? (
               <div className="h-full flex flex-col items-center justify-center text-center p-8 text-gray-400 opacity-60">
                 <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mb-6">
                    {mode === ChatMode.EXPLORER ? <MapIcon size={40} /> : <Brain size={40} />}
                 </div>
                 <h2 className="text-2xl font-bold text-gray-600 mb-2">
                   {mode === ChatMode.EXPLORER ? 'Explore the World' : 'Deep Reasoning'}
                 </h2>
                 <p className="max-w-md">
                   {mode === ChatMode.EXPLORER 
                     ? "Ask about nearby restaurants, find places on the map, or search for real-time events."
                     : "Ask complex questions, request code snippets, or brainstorm creative ideas."}
                 </p>
               </div>
             ) : (
               messages.map((msg) => (
                 <MessageBubble key={msg.id} message={msg} />
               ))
             )}
             
             {isLoading && (
               <div className="flex w-full justify-start mb-6">
                 <div className="flex max-w-[80%] gap-3">
                   <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white">
                     <Bot size={16} />
                   </div>
                   <div className="bg-white border border-gray-100 px-5 py-4 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-2">
                     <div className="flex space-x-1">
                       <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                       <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                       <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                     </div>
                     <span className="text-xs text-gray-400 font-medium ml-2">
                       {mode === ChatMode.EXPLORER ? 'Searching Maps...' : 'Thinking...'}
                     </span>
                   </div>
                 </div>
               </div>
             )}
             <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="flex-shrink-0 bg-white border-t border-gray-200 p-4 sm:p-6 z-10">
            
            {/* Mobile Mode Switcher (Visible only on small screens) */}
            <div className="md:hidden flex gap-2 mb-3 overflow-x-auto pb-2">
              {Object.values(ChatMode).map((m) => (
                 <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 whitespace-nowrap border transition-colors ${
                    mode === m 
                    ? 'bg-emerald-600 text-white border-emerald-600' 
                    : 'bg-gray-100 text-gray-600 border-transparent'
                  }`}
                 >
                   {m === ChatMode.EXPLORER ? <MapIcon size={12}/> : <Brain size={12}/>}
                   {MODEL_CONFIGS[m].label}
                 </button>
              ))}
            </div>

            <div className="relative max-w-4xl mx-auto">
              <textarea
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={mode === ChatMode.EXPLORER ? "Ask to find a place or search info..." : "Ask a complex question..."}
                className="w-full bg-gray-50 border border-gray-200 text-gray-800 rounded-2xl pl-5 pr-14 py-4 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all resize-none shadow-inner max-h-32 min-h-[60px]"
                rows={1}
                style={{ minHeight: '60px' }}
              />
              <button 
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md active:scale-95"
              >
                {isLoading ? <Zap size={20} className="animate-pulse" /> : <Send size={20} />}
              </button>
            </div>
            <div className="text-center mt-2">
               <p className="text-[10px] text-gray-400">
                 Powered by Gemini 2.5 Flash & 3.0 Pro. AI can make mistakes.
               </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;