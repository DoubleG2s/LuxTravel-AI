export enum Role {
  USER = 'user',
  MODEL = 'model'
}

export interface MapLocation {
  latitude: number;
  longitude: number;
}

export interface GroundingChunk {
  maps?: {
    uri: string;
    title: string;
    placeId: string;
    placeAnswerSources?: {
      reviewSnippets?: {
        content: string;
      }[];
    };
  };
  web?: {
    uri: string;
    title: string;
  };
}

export interface Attachment {
  name: string;
  mimeType: string;
  base64: string; // Base64 encoded string without the data prefix
}

export interface Message {
  id: string;
  role: Role;
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
  groundingChunks?: GroundingChunk[];
  attachment?: Attachment;
  // Visual indicator for tool usage
  toolCalls?: { name: string; args: any }[];
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
}

// --- MONDE API TYPES ---

export interface JsonApiResource {
  id?: string;
  type: string;
  attributes: Record<string, any>;
}

export interface JsonApiResponse<T> {
  data: T;
  meta?: any;
  links?: any;
}

export interface PersonAttributes {
  name: string;
  email?: string;
  phone?: string;
  [key: string]: any;
}

export interface TaskAttributes {
  description: string;
  due_date?: string;
  [key: string]: any;
}
