import { useState } from 'react';
import { useAirtableAPI } from './useAirtableAPI';

type Error = {
  message: string;
};

export function useGenerateInsights({
  sessionId,
  chatId,
}: {
  sessionId: string | undefined;
  chatId: string;
}) {
  const [insight, setInsight] = useState([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const { createRecord } = useAirtableAPI({
    baseId: import.meta.env.VITE_AIRTABLE_BASE_ID,
    tableName: 'Insights',
  });

  async function computeInsights(message: string) {
    setIsLoading(true);
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
        setIsLoading(false);
        createRecord({
          'Session ID': sessionId,
          Insights: data.message,
          ChatSessionId: chatId,
        });
        setInsight(data);
        return data;
      }
    } catch (error: Error | any) {
      setIsLoading(false);
      setError(error);
      throw new Error(`Failed to generate insights: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  }

  return {
    isLoading,
    error,
    computeInsights,
    insight,
  };
}
