// Model and Mode definitions
export enum ChatMode {
  EXPLORER = 'EXPLORER', // Uses gemini-2.5-flash with Search & Maps
  REASONING = 'REASONING', // Uses gemini-3-pro-preview
}

export interface LocationData {
  latitude: number;
  longitude: number;
}

// Chat Message Structure
export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  isError?: boolean;
  groundingMetadata?: GroundingMetadata;
}

// Grounding Data Types
export interface GroundingMetadata {
  groundingChunks?: GroundingChunk[];
  searchEntryPoint?: {
    renderedContent?: string;
  };
}

export interface GroundingChunk {
  web?: {
    uri?: string;
    title?: string;
  };
  maps?: {
    uri?: string;
    title?: string;
    placeAnswerSources?: {
      reviewSnippets?: {
        content?: string;
      }[];
    };
  };
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  mode: ChatMode;
  location: LocationData | null;
  locationError: string | null;
}