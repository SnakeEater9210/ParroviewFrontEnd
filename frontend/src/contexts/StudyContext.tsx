// @ts-nocheck
import {
  useState,
  useEffect,
  createContext,
  useContext,
  startTransition,
} from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import Airtable from 'airtable';

const StudyContext = createContext({} as any);

interface AirtableRecord {
  id: string;
  fields: Record<string, any>;
}

export const StudyProvider = ({ children }: { children: React.ReactNode }) => {
  const [records, setRecords] = useState<AirtableRecord[]>([]);
  const [transcripts, setTranscripts] = useState<AirtableRecord[]>([]);
  const [insights, setInsights] = useState<AirtableRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [claims, setClaims] = useState();
  const [completedInterviews, setCompletedInterviews] = useState();
  const [interviewDataRecords, setInterviewDataRecords] =
    useState<AirtableRecord>([]);

  const { user: auth0User, getIdTokenClaims } = useAuth0();

  useEffect(() => {
    async function getClaims() {
      const claims = await getIdTokenClaims();
      setClaims(claims);
    }
    getClaims();
  }, []);

  useEffect(() => {
    async function getClaims() {
      const claims = await getIdTokenClaims();
      setClaims(claims);
    }
    getClaims();
  }, []);

  useEffect(() => {
    setIsLoading(true);
    const startDate =
      claims?.['parroviewUser/app_metadata']?.['subscriptionStartDate'];
    const endDate =
      claims?.['parroviewUser/app_metadata']?.['subscriptionEndDate'];

    Promise.all([
      fetchStudies(),
      fetchTranscriptsToCalculateUsage(startDate, endDate),
      fetchTranscripts(),
      fetchInterviewUserData(),
    ])
      .then(async ([latestRecords, trfuc, transcriptRecords]) => {
        setIsLoading(false);
        setRecords(latestRecords);
        setTranscripts(transcriptRecords);
        let count = 0;
        latestRecords.filter((record) => {
          if (record.fields['Email'] === auth0User?.email) {
            trfuc.filter((trecord) => {
              if (
                trecord.fields['Session ID'] === record.fields['Session ID']
              ) {
                if (trecord.fields['isComplete'] === true) {
                  count = count + 1;
                }
              }
            });
          }
        }).length;
        setCompletedInterviews(count);

        if (
          count >= claims?.['parroviewUser/app_metadata']?.['interviewCount']
        ) {
          const response = await fetch(
            'https://ihpnxkeurlg4huyclbbt2xhake0fubum.lambda-url.eu-west-2.on.aws/',
            {
              method: 'GET',
            }
          );
          const token = await response.json();

          if (auth0User && auth0User.sub) {
            const auth0UserData = await fetch(
              `https://dev-dvr40f4l0hhs8jm2.uk.auth0.com/api/v2/users/${auth0User?.sub}`,
              {
                method: 'GET',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token.access_token}`,
                },
              }
            );

            const userData = await auth0UserData.json();
            if (userData?.app_metadata.usageBlockedAt) {
              return;
            }

            await fetch(
              `https://dev-dvr40f4l0hhs8jm2.uk.auth0.com/api/v2/users/${auth0User?.sub}`,
              {
                method: 'PATCH',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token.access_token}`,
                },
                body: JSON.stringify({
                  app_metadata: {
                    usageBlockedAt: Math.floor(Date.now() / 1000),
                  },
                }),
              }
            );
          }
        }
      })
      .catch((error) => {
        setIsLoading(false);
        setError(error);
      });
  }, [claims]);

  async function createStudy(fields: Record<string, any>) {
    try {
      const airtable = new Airtable({
        apiKey: import.meta.env.VITE_AIRTABLE_API_KEY,
      }).base(import.meta.env.VITE_AIRTABLE_BASE_ID);
      const record = await airtable('Session Configurations').create(fields);
      setRecords([...records, { id: record.id, fields: record.fields }]);
      return record;
    } catch (error: Error | any) {
      setError(error);
      return false;
    }
  }

  async function updateStudy(id: string, fields: Record<string, any>) {
    try {
      const airtable = new Airtable({
        apiKey: import.meta.env.VITE_AIRTABLE_API_KEY,
      }).base(import.meta.env.VITE_AIRTABLE_BASE_ID);
      const record = await airtable('Session Configurations').update(
        id,
        fields
      );
      const updatedRecords = records.map((r) =>
        r.id === record.id ? { id: record.id, fields: record.fields } : r
      );
      setRecords(updatedRecords);
      return true;
    } catch (error: Error | any) {
      setError(error);
      return false;
    }
  }

  async function fetchStudies() {
    const tableName = 'Session Configurations';
    const email = auth0User?.email;

    const filterFormula = encodeURIComponent(`{Email} = "${email}"`);

    try {
      const response = await fetch(
        `https://api.airtable.com/v0/${
          import.meta.env.VITE_AIRTABLE_BASE_ID
        }/${tableName}?filterByFormula=${filterFormula}&sort%5B0%5D%5Bfield%5D=CreatedAt&sort%5B0%5D%5Bdirection%5D=desc`,
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
      setRecords(latestRecords);
      return latestRecords;
    } catch (error: Error | any) {
      throw new Error(`Failed to fetch records: ${error.message}`);
    }
  }

  async function fetchTranscriptsToCalculateUsage(
    subscriptionStartDate,
    subscriptionEndDate
  ) {
    const tableName = 'Transcripts';

    // Convert timestamps to ISO date strings
    const startDate = new Date(subscriptionStartDate * 1000).toISOString();
    const endDate = new Date(subscriptionEndDate * 1000).toISOString();

    // Encode the filter formula for the URL
    const filterFormula = encodeURIComponent(
      `AND(IS_AFTER(CreatedAt, "${startDate}"), IS_BEFORE(CreatedAt, "${endDate}"))`
    );

    try {
      const response = await fetch(
        `https://api.airtable.com/v0/${
          import.meta.env.VITE_AIRTABLE_BASE_ID
        }/${tableName}?filterByFormula=${filterFormula}&sort%5B0%5D%5Bfield%5D=CreatedAt&sort%5B0%5D%5Bdirection%5D=desc`,
        {
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_AIRTABLE_API_KEY}`,
          },
        }
      );

      const data = await response.json();
      const transcriptRecords = data.records.map((record) => ({
        id: record.id,
        fields: record.fields,
      }));
      return transcriptRecords;
    } catch (error) {
      throw new Error(`Failed to fetch transcripts: ${error.message}`);
    }
  }

  async function fetchTranscripts() {
    // TODO - refactor this out into it's own context or hook
    const tableName = 'Transcripts';

    try {
      const response = await fetch(
        `https://api.airtable.com/v0/${
          import.meta.env.VITE_AIRTABLE_BASE_ID
        }/${tableName}?sort%5B0%5D%5Bfield%5D=CreatedAt&sort%5B0%5D%5Bdirection%5D=desc`,
        {
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_AIRTABLE_API_KEY}`,
          },
        }
      );

      const data = await response.json();
      const transcriptRecords = data.records.map((record: any) => ({
        id: record.id,
        fields: record.fields,
      }));
      return transcriptRecords;
    } catch (error) {
      throw new Error(`Failed to fetch transcripts: ${error.message}`);
    }
  }

  async function fetchInsights() {
    // TODO - refactor this out into it's own context or hook
    const tableName = 'Insights';

    try {
      const response = await fetch(
        `https://api.airtable.com/v0/${
          import.meta.env.VITE_AIRTABLE_BASE_ID
        }/${tableName}?sort%5B0%5D%5Bfield%5D=CreatedAt&sort%5B0%5D%5Bdirection%5D=desc`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_AIRTABLE_API_KEY}`,
          },
        }
      );

      const data = await response.json();
      const insightRecords = data.records.map((record: any) => ({
        id: record.id,
        fields: record.fields,
      }));
      setInsights(insightRecords);
      return insightRecords;
    } catch (error) {
      throw new Error(`Failed to fetch insights: ${error.message}`);
    }
  }

  async function fetchInterviewUserData() {
    // TODO - refactor this out into it's own context or hook
    const tableName = 'InterviewUserData';

    try {
      const response = await fetch(
        `https://api.airtable.com/v0/${
          import.meta.env.VITE_AIRTABLE_BASE_ID
        }/${tableName}?sort%5B0%5D%5Bfield%5D=CreatedAt&sort%5B0%5D%5Bdirection%5D=desc`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_AIRTABLE_API_KEY}`,
          },
        }
      );

      const data = await response.json();
      const interviewUserDataRecords = data.records.map((record: any) => ({
        id: record.id,
        fields: record.fields,
      }));
      setInterviewDataRecords(interviewUserDataRecords);
      return interviewUserDataRecords;
    } catch (error) {
      throw new Error(`Failed to fetch InterviewUserData: ${error.message}`);
    }
  }

  return (
    <StudyContext.Provider
      value={{
        createStudy,
        updateStudy,
        fetchStudies,
        fetchInsights,
        transcripts,
        interviewDataRecords,
        insights,
        records,
        error,
        isLoading,
        completedInterviews,
      }}
    >
      {children}
    </StudyContext.Provider>
  );
};

export const useStudyContext = () => {
  const context = useContext(StudyContext);
  if (context === undefined) {
    throw new Error('useMessageContext must be used within a MessageProvider');
  }
  return context;
};
