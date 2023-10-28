import React, { createContext, useState, useContext } from 'react';
import { useAirtableAPI } from '../hooks/useAirtableAPI';
import { useStudyContext } from './StudyContext';

const InsightsContext = createContext({} as any);

export function InsightsProvider({ children }: { children: React.ReactNode }) {
  const [insight, setInsight] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null); // add type annotation

  const { createRecord } = useAirtableAPI({
    baseId: import.meta.env.VITE_AIRTABLE_BASE_ID,
    tableName: 'Insights',
  });

  const { fetchInsights } = useStudyContext();

  async function computeInsights(
    message: string,
    sessionId: string | undefined,
    chatId: string
  ) {
    setIsLoading(true);
    debugger;
    try {
      const response = await fetch(
        'https://qzvyzskiiaxfqohw7a2lcocwtm0txudh.lambda-url.eu-west-2.on.aws/',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ transcript: message }),
        }
      );
      const data = await response.json();
      if (response.ok) {
        createRecord({
          'Session ID': sessionId,
          Insights: data.message,
          ChatSessionId: chatId,
        });
        setIsLoading(false);
        fetchInsights();
        setInsight(data);
        return data;
      }
    } catch (error: unknown) {
      // add type annotation
      setIsLoading(false);
      setError(error as Error);
      throw new Error(`Failed to generate insights: ${error}`);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <InsightsContext.Provider
      value={{ isLoading, error, computeInsights, insight }}
    >
      {children}
    </InsightsContext.Provider>
  );
}

export function useInsights() {
  const context = useContext(InsightsContext);
  if (!context) {
    throw new Error('useInsights must be used within an InsightsProvider');
  }
  return context;
}
