import { useState, useCallback } from 'react';
import { invoke } from '@tauri-apps/api/tauri';
import type { ParsedIntent } from '@/types';

export const useAI = () => {
  const [isParsing, setIsParsing] = useState(false);
  const [parsedIntent, setParsedIntent] = useState<ParsedIntent | null>(null);
  
  const parseIntent = useCallback(async (input: string, topicId?: string): Promise<ParsedIntent | null> => {
    if (!input.trim() || input.length < 5) {
      setParsedIntent(null);
      return null;
    }
    
    console.log('[useAI] Parsing intent:', input, 'topicId:', topicId);
    setIsParsing(true);
    try {
      const result = await invoke<ParsedIntent>('parse_intent', { 
        input,
        topicId: topicId || null,
      });
      console.log('[useAI] Intent parsed:', result);
      setParsedIntent(result);
      return result;
    } catch (error) {
      console.error('[useAI] AI parsing failed:', error);
      return null;
    } finally {
      setIsParsing(false);
    }
  }, []);
  
  const clearIntent = useCallback(() => {
    setParsedIntent(null);
  }, []);
  
  return { parseIntent, clearIntent, isParsing, parsedIntent };
};
