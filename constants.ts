import { ChatMode } from './types';

export const APP_NAME = "TerraChat AI";

export const MODEL_CONFIGS = {
  [ChatMode.EXPLORER]: {
    modelName: 'gemini-2.5-flash',
    label: 'Explorer (Maps & Search)',
    description: 'Best for finding places, local info, and real-time facts.',
    icon: 'Map'
  },
  [ChatMode.REASONING]: {
    modelName: 'gemini-3-pro-preview',
    label: 'Deep Reasoning',
    description: 'Best for complex questions, coding, and creative writing.',
    icon: 'Brain'
  }
};

export const INITIAL_SYSTEM_INSTRUCTION = `
You are TerraChat, a helpful AI assistant. 
When in EXPLORER mode, you specialize in providing location-based information and up-to-date search results. 
When in REASONING mode, you provide deep, thoughtful, and complex answers.
Always be polite, concise, and helpful.
`;