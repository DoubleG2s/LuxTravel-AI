import React, { useState, useEffect, useRef } from 'react';
import { Layout } from './components/Layout';
import { ChatInterface } from './components/ChatInterface';
import { Message, Role, ChatState, Attachment } from './types';
import { createChatSession, sendMessageToAgent } from './services/geminiService';

export default function App() {
  // Use a ref to hold the chat session instance to persist across renders
  const chatSessionRef = useRef<any>(null);
  
  // Session ID used to force re-mount of ChatInterface when clearing chat
  const [sessionId, setSessionId] = useState(0);

  const [chatState, setChatState] = useState<ChatState>({
    messages: [
      {
        id: 'welcome-1',
        role: Role.MODEL,
        content: "Olá. Sou o agente virtual da Clube Turismo Jardinópolis. Como posso ajudar com suas reservas, cotações, ou consultas no sistema Monde hoje?",
        timestamp: new Date(),
      }
    ],
    isLoading: false,
    error: null,
  });

  const [userLocation, setUserLocation] = useState<{latitude: number, longitude: number} | undefined>(undefined);

  // Initialize Chat Session & Geolocation on Mount or when sessionId changes
  useEffect(() => {
    try {
      chatSessionRef.current = createChatSession();
    } catch (e) {
      console.error("Failed to initialize chat session", e);
      setChatState(prev => ({ ...prev, error: "Falha ao inicializar serviço de IA." }));
    }
  }, [sessionId]);

  // Request location only once on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (err) => {
          console.warn("Location access denied or error:", err);
        }
      );
    }
  }, []);

  const handleNewChat = () => {
    // Increment session ID to force ChatInterface to remount (clearing inputs/attachments)
    setSessionId(prev => prev + 1);
    
    // Reset state to initial welcome message
    setChatState({
      messages: [
        {
          id: `welcome-${Date.now()}`,
          role: Role.MODEL,
          content: "Olá. Sou o agente virtual da Clube Turismo Jardinópolis. Como posso ajudar com suas reservas, cotações, ou consultas no sistema Monde hoje?",
          timestamp: new Date(),
        }
      ],
      isLoading: false,
      error: null,
    });
    
    // The useEffect [sessionId] will handle re-creating the gemini chat instance
  };

  const handleSendMessage = async (text: string, attachment?: Attachment) => {
    if ((!text.trim() && !attachment) || !chatSessionRef.current) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: Role.USER,
      content: text,
      timestamp: new Date(),
      attachment: attachment
    };

    setChatState(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      isLoading: true,
      error: null,
    }));

    try {
      // Send to Gemini with Maps Grounding, Attachments, and Monde Tools
      const result = await sendMessageToAgent(chatSessionRef.current, text, userLocation, attachment);
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: Role.MODEL,
        content: result.text,
        timestamp: new Date(),
        groundingChunks: result.groundingChunks,
        toolCalls: result.toolCalls
      };

      setChatState(prev => ({
        ...prev,
        messages: [...prev.messages, botMessage],
        isLoading: false,
      }));

    } catch (error: any) {
      console.error("Error sending message:", error);
      setChatState(prev => ({
        ...prev,
        isLoading: false,
        error: "Peço desculpas, encontrei um problema temporário. Se for um erro de conexão com o Monde, verifique se o serviço está acessível.",
      }));
    }
  };

  return (
    <Layout onNewChat={handleNewChat}>
      <ChatInterface 
        key={sessionId} // Key forces remount on new chat, clearing inputs
        messages={chatState.messages} 
        isLoading={chatState.isLoading}
        onSendMessage={handleSendMessage}
        error={chatState.error}
      />
    </Layout>
  );
}