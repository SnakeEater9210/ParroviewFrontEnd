import { useState, useEffect } from 'react';
import Airtable from 'airtable';

interface AirtableRecord {
  id: string;
  fields: Record<string, any>;
}

interface UseAirtableAPIProps {
  baseId: string;
  tableName: string;
}

type Error = {
  message: string;
};

export function useAirtableAPI({ baseId, tableName }: UseAirtableAPIProps) {
  const [records, setRecords] = useState<AirtableRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  async function getRecords(baseId: string, tableName: string) {
    const response = await fetch(
      `https://api.airtable.com/v0/${baseId}/${tableName}?sort%5B0%5D%5Bfield%5D=CreatedAt&sort%5B0%5D%5Bdirection%5D=desc`,
      {
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_AIRTABLE_API_KEY}`,
        },
      }
    );
    const data = await response.json();
    const latestRecords = data.records.map((record: any) => ({
      id: record.id,
      fields: record.fields,
    }));
    return latestRecords;
  }

  async function fetchRecords(baseId: string, tableName: string) {
    try {
      const latestRecords = await getRecords(baseId, tableName);
      return latestRecords;
    } catch (error: Error | any) {
      throw new Error(`Failed to fetch records: ${error.message}`);
    }
  }

  useEffect(() => {
    setIsLoading(true);

    fetchRecords(baseId, tableName)
      .then((latestRecords) => {
        setIsLoading(false);
        setRecords(latestRecords);
      })
      .catch((error) => {
        setIsLoading(false);
        setError(error);
      });
  }, [baseId, tableName]);

  async function createRecord(fields: Record<string, any>) {
    try {
      const airtable = new Airtable({
        apiKey: import.meta.env.VITE_AIRTABLE_API_KEY,
      }).base(baseId);
      const record = await airtable(tableName).create(fields);
      setRecords([...records, { id: record.id, fields: record.fields }]);
    } catch (error: Error | any) {
      setError(error);
    }
  }

  async function updateRecord(id: string, fields: Record<string, any>) {
    try {
      const airtable = new Airtable({
        apiKey: import.meta.env.VITE_AIRTABLE_API_KEY,
      }).base(baseId);
      const record = await airtable(tableName).update(id, fields);
      const updatedRecords = records.map((r) =>
        r.id === record.id ? { id: record.id, fields: record.fields } : r
      );
      setRecords(updatedRecords);
    } catch (error: Error | any) {
      setError(error);
    }
  }

  return {
    records,
    isLoading,
    error,
    createRecord,
    updateRecord,
    fetchRecords,
  };
}
