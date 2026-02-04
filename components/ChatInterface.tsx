import React, { useRef, useEffect, useState } from 'react';
import { Message, Attachment } from '../types';
import { MessageBubble } from './MessageBubble';
import { Send, Loader2, Paperclip, X, FileText } from 'lucide-react';

interface ChatInterfaceProps {
  messages: Message[];
  isLoading: boolean;
  onSendMessage: (text: string, attachment?: Attachment) => void;
  error: string | null;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ messages, isLoading, onSendMessage, error }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [inputText, setInputText] = useState('');
  const [attachment, setAttachment] = useState<Attachment | undefined>(undefined);
  const [isProcessingFile, setIsProcessingFile] = useState(false);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((inputText.trim() || attachment) && !isLoading && !isProcessingFile) {
      onSendMessage(inputText, attachment);
      setInputText('');
      setAttachment(undefined);
      // Reset file input
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      alert('Por favor, selecione apenas arquivos PDF.');
      return;
    }

    setIsProcessingFile(true);
    try {
      const base64 = await convertFileToBase64(file);
      setAttachment({
        name: file.name,
        mimeType: file.type,
        base64: base64
      });
    } catch (err) {
      console.error("Error reading file", err);
      alert("Erro ao processar arquivo.");
    } finally {
      setIsProcessingFile(false);
    }
  };

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        // Remove data URL prefix (e.g., "data:application/pdf;base64,")
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const clearAttachment = () => {
    setAttachment(undefined);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 scroll-smooth bg-slate-50/50"
      >
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
        
        {isLoading && (
          <div className="flex justify-start animate-pulse">
            <div className="bg-white border border-slate-100 rounded-2xl rounded-tl-none p-4 shadow-sm flex items-center space-x-2">
              <Loader2 className="w-4 h-4 text-brand-600 animate-spin" />
              <span className="text-sm text-slate-500 font-medium">Analisando...</span>
            </div>
          </div>
        )}

        {error && (
          <div className="flex justify-center my-4">
            <div className="bg-red-50 text-red-600 text-sm px-4 py-2 rounded-full border border-red-100">
              {error}
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="flex-none p-4 bg-white border-t border-slate-100">
        <div className="max-w-4xl mx-auto">
          
          {/* Attachment Preview */}
          {attachment && (
            <div className="mb-2 flex items-center inline-block">
              <div className="bg-brand-50 border border-brand-100 text-brand-800 rounded-lg px-3 py-2 flex items-center space-x-2 text-sm">
                <FileText className="w-4 h-4" />
                <span className="truncate max-w-[200px] font-medium">{attachment.name}</span>
                <button 
                  onClick={clearAttachment}
                  className="hover:bg-brand-100 rounded-full p-1 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="relative flex items-center space-x-2">
            
            {/* Hidden File Input */}
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileSelect} 
              accept=".pdf,application/pdf" 
              className="hidden" 
            />

            {/* Attachment Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading || isProcessingFile}
              className="p-3.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-colors disabled:opacity-50"
              title="Anexar PDF"
            >
              {isProcessingFile ? <Loader2 className="w-5 h-5 animate-spin" /> : <Paperclip className="w-5 h-5" />}
            </button>

            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={attachment ? "Pergunte sobre o documento (ex: 'Quais os horários dos voos?')..." : "Descreva a viagem ideal ou anexe um voucher..."}
              className="w-full pl-4 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-slate-800 placeholder:text-slate-400"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || (!inputText.trim() && !attachment) || isProcessingFile}
              className="absolute right-2 p-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-brand-500/20"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            </button>
          </form>
          <div className="text-center mt-2">
              <p className="text-[10px] text-slate-400">O Agente pode ler PDFs para extrair dados de vouchers. Não substitui conferência humana.</p>
          </div>
        </div>
      </div>
    </div>
  );
};