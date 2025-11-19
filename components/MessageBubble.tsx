import React from 'react';
import { Message } from '../types';
import { GroundingChips } from './GroundingChips';
import { User, Bot, AlertCircle } from 'lucide-react';

interface MessageBubbleProps {
  message: Message;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === 'user';
  
  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} mb-6 animate-in fade-in slide-in-from-bottom-2 duration-300`}>
      <div className={`flex max-w-[90%] sm:max-w-[80%] gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        
        {/* Avatar */}
        <div className={`
          flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center
          ${isUser ? 'bg-indigo-600 text-white' : 'bg-emerald-600 text-white shadow-sm'}
        `}>
          {isUser ? <User size={16} /> : <Bot size={16} />}
        </div>

        {/* Content Bubble */}
        <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
          <div className={`
            relative px-5 py-3.5 rounded-2xl shadow-sm text-sm leading-relaxed
            ${isUser 
              ? 'bg-indigo-600 text-white rounded-tr-sm' 
              : message.isError 
                ? 'bg-red-50 text-red-800 border border-red-200 rounded-tl-sm'
                : 'bg-white border border-gray-100 text-gray-800 rounded-tl-sm'
            }
          `}>
            {message.isError && (
              <div className="flex items-center gap-2 mb-2 font-bold text-red-700">
                <AlertCircle size={16} />
                <span>Error</span>
              </div>
            )}
            
            {/* Message Text */}
            <div className="whitespace-pre-wrap break-words">
              {message.text}
            </div>
          </div>

          {/* Grounding Results (Only for Model) */}
          {!isUser && !message.isError && message.groundingMetadata?.groundingChunks && (
            <div className="w-full mt-1 pl-1">
              <GroundingChips chunks={message.groundingMetadata.groundingChunks} />
            </div>
          )}
          
          {/* Timestamp */}
          <div className={`text-[10px] text-gray-400 mt-1 px-1 ${isUser ? 'text-right' : 'text-left'}`}>
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>
    </div>
  );
};