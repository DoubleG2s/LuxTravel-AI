import { GoogleGenAI, Chat, GenerateContentResponse, Part } from "@google/genai";
import { GroundingChunk, Attachment } from "../types";
import { mondeToolsSchema, executeMondeTool } from "./toolDefinitions";

// Standard prompt to enforce persona
const SYSTEM_INSTRUCTION = `
Você é um agente virtual de viagens da empresa Clube Turismo Jardinópolis, integrado ao sistema "Monde".

Seu objetivo é auxiliar agentes e clientes, tanto com informações gerais quanto com operações no sistema Monde.

CAPACIDADES (FERRAMENTAS):
Você tem acesso a ferramentas para consultar e manipular dados no Monde:
- Clientes (Listar, Criar, Atualizar)
- Tarefas (Listar, Criar)
- Cidades (Consultar)

REGRAS DE USO DE FERRAMENTAS:
1. Sempre que o usuário pedir algo que exija dados do sistema (ex: "Quem é o cliente X?", "Crie uma tarefa"), USE A FERRAMENTA apropriada.
2. Não invente IDs ou dados. Pesquise antes de atualizar.
3. Se uma operação falhar, explique o erro de forma amigável.
4. Após executar uma ferramenta, use o resultado devolvido para responder ao usuário.

CAPACIDADE DE ANÁLISE DE DOCUMENTOS (PDF/VOUCHERS):
Ao receber um PDF, leia-o completamente para extrair datas, nomes e locais.

DIRETRIZES GERAIS:
- Português do Brasil.
- Formal e cordial.
- Não confirme pagamentos reais.
`;

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const createChatSession = (): Chat => {
  return ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      temperature: 0.5,
      // Register both Maps and our new Monde Tools
      tools: [
        { googleMaps: {} },
        { functionDeclarations: mondeToolsSchema }
      ], 
    },
  });
};

export interface AgentResponse {
  text: string;
  groundingChunks?: GroundingChunk[];
  toolCalls?: { name: string; args: any }[];
}

export const sendMessageToAgent = async (
  chat: Chat, 
  message: string, 
  userLocation?: { latitude: number; longitude: number },
  attachment?: Attachment
): Promise<AgentResponse> => {
  
  // Dynamic config for Maps Grounding
  let requestConfig: any = undefined;
  if (userLocation) {
    requestConfig = {
      toolConfig: {
        retrievalConfig: {
          latLng: {
            latitude: userLocation.latitude,
            longitude: userLocation.longitude
          }
        }
      }
    };
  }

  // Construct initial message payload
  let messagePayload: string | any[] = message;

  if (attachment) {
    const parts: any[] = [
      {
        inlineData: {
          mimeType: attachment.mimeType,
          data: attachment.base64
        }
      }
    ];
    if (message && message.trim()) {
      parts.push({ text: message });
    } else {
      parts.push({ text: "Por favor, analise este documento em anexo." });
    }
    messagePayload = parts;
  }

  // --- THE TOOL LOOP ---
  // We need to keep sending responses back to the model as long as it asks to call functions.
  
  // 1. First Turn
  let response = await chat.sendMessage({
    message: messagePayload, 
    config: requestConfig
  });

  const toolCallsLog: { name: string; args: any }[] = [];

  // 2. Loop while the model wants to call functions
  // The SDK simplifies this, but we need to check 'functionCalls' in the response candidates
  while (response.candidates?.[0]?.content?.parts?.some(p => p.functionCall)) {
    
    const parts = response.candidates[0].content.parts;
    const functionCallPart = parts.find(p => p.functionCall);
    
    if (functionCallPart && functionCallPart.functionCall) {
      const { name, args } = functionCallPart.functionCall;
      
      // Log for UI display
      toolCallsLog.push({ name, args });

      // Execute local code
      const functionResult = await executeMondeTool(name, args);

      // Send result back to model
      // Note: We use the *same* chat session.
      response = await chat.sendMessage({
        message: [{
          functionResponse: {
            name: name,
            response: { result: functionResult }
          }
        }]
      });
    } else {
      break; // Should not happen if loop condition is met, but safety break
    }
  }

  // 3. Final Text Extraction
  const text = response.text || "Processado com sucesso.";

  // Extract Grounding Metadata
  const candidates = response.candidates;
  let groundingChunks: GroundingChunk[] = [];
  if (candidates && candidates[0] && candidates[0].groundingMetadata) {
    const metadata = candidates[0].groundingMetadata;
    if (metadata.groundingChunks) {
      groundingChunks = metadata.groundingChunks as GroundingChunk[];
    }
  }

  return {
    text,
    groundingChunks,
    toolCalls: toolCallsLog.length > 0 ? toolCallsLog : undefined
  };
};