// Powered by OnSpace.AI
import { KRONOP_SYSTEM_PROMPT } from './kronopKnowledge';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isTyping?: boolean;
}

const GEMINI_API_KEY = 'AIzaSyA9ihrAKi2b2vONZe_i5bLZvbEWJI6t71I';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:streamGenerateContent?key=${GEMINI_API_KEY}&alt=sse`;

export async function sendMessageToAI(
  messages: ChatMessage[],
  onChunk: (chunk: string) => void,
  onComplete: () => void,
  onError: (err: string) => void
): Promise<void> {
  try {
    const contents = messages
      .filter(m => !m.isTyping && m.content.trim())
      .map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }));

    const response = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: KRONOP_SYSTEM_PROMPT }],
        },
        contents,
        generationConfig: {
          maxOutputTokens: 800,
          temperature: 0.7,
        },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`API Error ${response.status}: ${errText}`);
    }

    const reader = response.body?.getReader();

    if (reader) {
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim();
            if (!data || data === '[DONE]') continue;
            try {
              const parsed = JSON.parse(data);
              const text = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
              if (text) onChunk(text);
            } catch {
              // skip malformed
            }
          }
        }
      }
    } else {
      const text = await response.text();
      const lines = text.split('\n');
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6).trim();
          if (!data || data === '[DONE]') continue;
          try {
            const parsed = JSON.parse(data);
            const content = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
            if (content) onChunk(content);
          } catch {
            // skip
          }
        }
      }
    }

    onComplete();
  } catch (err: any) {
    onError(err.message || 'Something went wrong. Please try again.');
  }
}

export async function transcribeAudio(
  base64Audio: string,
  mimeType: string = 'audio/m4a'
): Promise<string> {
  const SPEECH_URL = `https://speech.googleapis.com/v1/speech:recognize?key=${GEMINI_API_KEY}`;

  const response = await fetch(SPEECH_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      config: {
        encoding: 'LINEAR16',
        sampleRateHertz: 16000,
        languageCode: 'hi-IN',
        alternativeLanguageCodes: ['en-US'],
        model: 'default',
      },
      audio: {
        content: base64Audio,
      },
    }),
  });

  if (!response.ok) throw new Error('Speech transcription failed');
  const data = await response.json();
  const transcript = data.results?.[0]?.alternatives?.[0]?.transcript;
  if (!transcript) throw new Error('No speech detected');
  return transcript;
}
