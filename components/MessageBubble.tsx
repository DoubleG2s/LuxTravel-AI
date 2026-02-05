import React from 'react';
import { Message, Role, GroundingChunk } from '../types';
import { User, Bot, MapPin, ExternalLink, Star, FileText, Wrench } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MessageBubbleProps {
  message: Message;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === Role.USER;

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex max-w-[85%] sm:max-w-[75%] ${isUser ? 'flex-row-reverse' : 'flex-row'} items-start gap-3`}>

        {/* Avatar */}
        <div className={`flex-none w-8 h-8 rounded-full flex items-center justify-center ${isUser ? 'bg-slate-200' : 'bg-brand-600'
          }`}>
          {isUser ? <User className="w-5 h-5 text-slate-600" /> : <Bot className="w-5 h-5 text-white" />}
        </div>

        {/* Content Container */}
        <div className="flex flex-col space-y-2 w-full">

          {/* Attachment Indicator (User only) */}
          {isUser && message.attachment && (
            <div className="self-end mb-1">
              <div className="bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 flex items-center space-x-2 text-xs text-slate-700">
                <FileText className="w-3.5 h-3.5 text-slate-500" />
                <span className="font-medium truncate max-w-[150px]">{message.attachment.name}</span>
                <span className="text-slate-400 text-[10px] uppercase border px-1 rounded">PDF</span>
              </div>
            </div>
          )}

          {/* Tool Usage Indicator (Model only) */}
          {!isUser && message.toolCalls && message.toolCalls.length > 0 && (
            <div className="flex flex-col space-y-1 mb-1">
              {message.toolCalls.map((tool, idx) => (
                <div key={idx} className="bg-blue-50 border border-blue-100 rounded-lg px-3 py-1.5 flex items-center space-x-2 text-xs text-blue-700 self-start">
                  <Wrench className="w-3 h-3 text-blue-500" />
                  <span>
                    {tool.name === 'list_sales' ? 'Acessando Viagens: ' : 'Acessando Monde: '}
                    <span className="font-mono font-medium">{tool.name}</span>
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Text Bubble */}
          <div className={`px-5 py-4 rounded-2xl shadow-sm leading-relaxed text-sm sm:text-base w-full overflow-hidden ${isUser
              ? 'bg-slate-800 text-white rounded-tr-none'
              : 'bg-white border border-slate-100 text-slate-700 rounded-tl-none'
            }`}>
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />,
                ul: ({ node, ...props }) => <ul className="list-disc pl-4 mb-2" {...props} />,
                ol: ({ node, ...props }) => <ol className="list-decimal pl-4 mb-2" {...props} />,
                li: ({ node, ...props }) => <li className="mb-1" {...props} />,
                strong: ({ node, ...props }) => <strong className="font-semibold text-brand-900" {...props} />,
                table: ({ node, ...props }) => <div className="overflow-x-auto my-3"><table className="min-w-full text-left text-xs sm:text-sm border-collapse" {...props} /></div>,
                thead: ({ node, ...props }) => <thead className="bg-slate-50 border-b border-slate-200" {...props} />,
                th: ({ node, ...props }) => <th className="px-3 py-2 font-semibold text-slate-700" {...props} />,
                td: ({ node, ...props }) => <td className="px-3 py-2 border-b border-slate-100 text-slate-600" {...props} />,
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>

          {/* Grounding Cards (Google Maps Data) */}
          {message.groundingChunks && message.groundingChunks.length > 0 && (
            <div className="grid grid-cols-1 gap-2 mt-2">
              {message.groundingChunks.map((chunk, index) => {
                if (chunk.maps) {
                  return <MapCard key={index} data={chunk.maps} />;
                }
                return null;
              })}
            </div>
          )}

          {/* Timestamp */}
          <span className={`text-[10px] ${isUser ? 'text-right text-slate-400' : 'text-left text-slate-400'}`}>
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>
    </div>
  );
};

// Sub-component for Maps Data
const MapCard: React.FC<{ data: NonNullable<GroundingChunk['maps']> }> = ({ data }) => {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm hover:shadow-md transition-shadow flex items-start space-x-3 max-w-sm">
      <div className="bg-brand-50 p-2 rounded-lg flex-none">
        <MapPin className="w-5 h-5 text-brand-600" />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-slate-900 text-sm truncate">{data.title}</h4>

        {data.placeAnswerSources?.reviewSnippets && data.placeAnswerSources.reviewSnippets.length > 0 && (
          <div className="mt-1 flex items-start space-x-1">
            <Star className="w-3 h-3 text-amber-400 mt-0.5 fill-current" />
            <p className="text-xs text-slate-500 line-clamp-2 italic">
              "{data.placeAnswerSources.reviewSnippets[0].content}"
            </p>
          </div>
        )}

        <a
          href={data.uri}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center mt-2 text-xs font-medium text-brand-600 hover:text-brand-800"
        >
          View on Google Maps <ExternalLink className="w-3 h-3 ml-1" />
        </a>
      </div>
    </div>
  );
};