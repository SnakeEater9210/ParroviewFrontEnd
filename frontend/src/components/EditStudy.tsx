// @ts-nocheck
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LinkIcon } from '@heroicons/react/24/outline';
import { ArrowLeftIcon } from '@heroicons/react/24/solid';
import { useStudyContext } from '../contexts/StudyContext';
import { useAuth0 } from '@auth0/auth0-react';
import formatDate from '../utils';
import SuccessNotification from './SuccessNotification';

export default function ViewStudy() {
  const { user, getIdTokenClaims } = useAuth0();
  const [transcriptionModalProps, setTranscriptionModalProps] = useState({});
  const [currentStudy, setCurrentStudy] = useState(null);
  const [percentage, setPercentage] = useState(0);
  const [transcriptsForStudy, setTranscriptsForStudy] = useState([]);
  const [insightsForStudy, setInsightsForStudy] = useState([]);
  const [
    completedTranscriptsForThisSession,
    setCompletedTranscriptsForThisSession,
  ] = useState([]);
  const [sessionIdFromSession, setSessionIdFromSession] = useState(() => {
    let path = window.location.pathname;
    let pathParts = path.split('/');
    let sessionId = pathParts[3];
    return sessionId;
  });
  const [showNotification, setShowNotification] = useState(false);
  const [claims, setClaims] = useState(null);

  const navigate = useNavigate();

  const { records, transcripts, fetchInsights, insights } = useStudyContext();

  useEffect(() => {
    if (!insights.length > 0) {
      fetchInsights();
      return;
    }
    return;
  }, [insights]);

  useEffect(() => {
    if (showNotification === true) {
      setTimeout(() => {
        setShowNotification(false);
      }, 2000);
    }
  }, [showNotification]);

  useEffect(() => {
    async function getClaims() {
      const claims = await getIdTokenClaims();
      setClaims(claims);
    }
    getClaims();
  }, []);

  useEffect(() => {
    if (transcriptsForStudy.length > 0) {
      const completedTranscriptsForThisSession = transcripts?.filter(
        (record) =>
          record.fields['Session ID'] === sessionIdFromSession &&
          record.fields['isComplete']
      );
      setCompletedTranscriptsForThisSession(completedTranscriptsForThisSession);
    }
  }, [transcriptsForStudy]);

  useEffect(() => {
    if (sessionIdFromSession) {
      const study = records?.find(
        (record) => record.fields['Session ID'] === sessionIdFromSession
      );
      setCurrentStudy(study);
    }
  }, [records, sessionIdFromSession]);

  useEffect(() => {
    if (transcripts?.length > 0) {
      const t = transcripts?.filter(
        (record) => record.fields['Session ID'] === sessionIdFromSession
      );
      setTranscriptsForStudy(t);
    }
  }, [transcripts]);

  useEffect(() => {
    if (insights?.length > 0) {
      const i = insights?.filter(
        (record) => record.fields['Session ID'] === sessionIdFromSession
      );
      setInsightsForStudy(i);
    }
  }, [insights]);

  useEffect(() => {
    async function calculatePercentage() {
      const completed = transcriptsForStudy?.filter(
        (t) => t.fields['isComplete']
      ).length;
      const total = transcriptsForStudy?.length;
      if (total) {
        setPercentage(Math.round((completed / total) * 100));
      }
    }
    calculatePercentage();
  }, [transcripts, transcriptsForStudy]);

  if (!currentStudy) {
    return <div>Loading...</div>;
  }

  console.log(insights);

  return (
    <div>
      <ArrowLeftIcon
        onClick={() => navigate('/study')}
        className="mb-8 cursor-pointer"
        height={45}
        width={45}
      />
      <div className="sm:px-0 px-2">
        <div className="flex justify-between">
          <p className="text-3xl font-bold leading-tight tracking-tight text-gray-900">
            {currentStudy?.fields['StudyName']}
          </p>
          <button
            className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            onClick={() => {
              navigate(`/study/edit/${currentStudy?.fields['Session ID']}`, {
                state: { fields: currentStudy?.fields },
              });
            }}
          >
            Edit
          </button>
        </div>
        <div className="mt-2 sm:mt-4 flex-col sm:flex sm:flex-row  items-center">
          Link to share with your users:{' '}
          <LinkIcon
            className="hidden sm:block sm:ml-2 mt-2 sm:mt-0 cursor-pointer"
            height={15}
            width={15}
          />
          <span
            className="text-purple-800 sm:ml-[2px] cursor-pointer"
            onClick={() => {
              navigator.clipboard.writeText(
                currentStudy?.fields['Generated Link']
              );
              setShowNotification(true);
            }}
          >
            {currentStudy?.fields['Generated Link']}
          </span>
        </div>
      </div>

      <div className="mt-6 border-t border-gray-100">
        <dl className="divide-y divide-gray-100">
          <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <dt className="text-sm font-medium leading-6 text-gray-900">
              Study Name
            </dt>
            <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
              {currentStudy?.fields['StudyName']}
            </dd>
          </div>
          <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <dt className="text-sm font-medium leading-6 text-gray-900">
              Redirect url
            </dt>
            <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
              {currentStudy?.fields['RedirectUrl'] ? (
                <a
                  href={currentStudy?.fields['RedirectUrl']}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-800 sm:ml-[2px] cursor-pointer"
                >
                  {currentStudy?.fields['RedirectUrl']}
                </a>
              ) : (
                'No redirect URL specified for this study.'
              )}
            </dd>
          </div>

          <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <dt className="text-sm font-medium leading-6 text-gray-900">
              Message Prompt
            </dt>
            <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
              {currentStudy?.fields['MessagePrompt']
                ? currentStudy?.fields['MessagePrompt']
                : 'Using system default prompt for this study.'}
            </dd>
          </div>
          <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <dt className="text-sm font-medium leading-6 text-gray-900">
              Goal
            </dt>
            <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
              {currentStudy?.fields['Goal']}
            </dd>
          </div>
          <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <dt className="text-sm font-medium leading-6 text-gray-900">
              Question 1
            </dt>
            <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
              {currentStudy?.fields['Question 1']}
            </dd>
          </div>
          <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <dt className="text-sm font-medium leading-6 text-gray-900">
              Question 2
            </dt>
            <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
              {currentStudy?.fields['Question 2']}
            </dd>
          </div>
          <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <dt className="text-sm font-medium leading-6 text-gray-900">
              Question 3
            </dt>
            <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
              {currentStudy?.fields['Question 3']}
            </dd>
          </div>
          <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <dt className="text-sm font-medium leading-6 text-gray-900">
              Question 4
            </dt>
            <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
              {currentStudy?.fields['Question 4']}
            </dd>
          </div>
          <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <dt className="text-sm font-medium leading-6 text-gray-900">
              Question 5
            </dt>
            <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
              {currentStudy?.fields['Question 5']}
            </dd>
          </div>
        </dl>
        <div className="mt-4">
          <dl className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
            <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
              <dt className="truncate text-sm font-medium text-gray-500">
                Total Started
              </dt>
              <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
                {transcriptsForStudy?.length}
              </dd>
            </div>
            <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
              <dt className="truncate text-sm font-medium text-gray-500">
                Total Completed
              </dt>
              <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
                {
                  transcriptsForStudy?.filter((t) => t.fields['isComplete'])
                    .length
                }
              </dd>
            </div>
            <div
              hidden
              className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6"
            >
              <dt className="truncate text-sm font-medium text-gray-500">
                Avg. Completion Rate
              </dt>
              <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
                {`${percentage}%`}
              </dd>
            </div>
          </dl>
        </div>
        {transcriptsForStudy?.length > 0 && (
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="mt-8 flow-root">
              <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                  <table className="min-w-full divide-y divide-gray-300">
                    <thead>
                      <tr>
                        <th
                          scope="col"
                          className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0"
                        >
                          Interview #
                        </th>
                        <th
                          scope="col"
                          className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0"
                        >
                          Timestamp
                        </th>
                        <th
                          scope="col"
                          className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                        >
                          Status
                        </th>
                        <th
                          scope="col"
                          className="relative py-3.5 pl-3 pr-4 sm:pr-0"
                        >
                          <span className="sr-only">View insights</span>
                        </th>
                        <th
                          scope="col"
                          className="relative py-3.5 pl-3 pr-4 sm:pr-0"
                        >
                          <span className="sr-only">View Transcript</span>
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-200">
                      {transcriptsForStudy?.map((transcript, index) => {
                        const usageBlockedAt =
                          claims?.['parroviewUser/app_metadata']?.[
                            'usageBlockedAt'
                          ];

                        const shouldBlockUsage =
                          usageBlockedAt <
                          Date.parse(transcript?.fields['CreatedAt']) / 1000;

                        return (
                          <tr key={index}>
                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">
                              {transcriptsForStudy.length - index}
                            </td>
                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">
                              {formatDate(transcript.fields['CreatedAt'])}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                              {transcript?.fields['isComplete']
                                ? 'Completed'
                                : 'Started'}
                            </td>
                            <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                              <button
                                type="button"
                                disabled={shouldBlockUsage}
                                className="hover:text-indigo-900 text-indigo-600"
                                onClick={() => {
                                  navigate(
                                    `/study/interview/${transcript?.fields['Session ID']}/${transcript?.fields['ChatSessionId']}`,
                                    {
                                      state: {
                                        sessionId:
                                          transcript?.fields['Session ID'],
                                        transcript:
                                          transcript?.fields['Transcript'],
                                        chatId:
                                          transcript?.fields['ChatSessionId'],
                                        type: 'transcript',
                                        timestamp:
                                          transcript?.fields['CreatedAt'],
                                        status: transcript?.fields['isComplete']
                                          ? 'Completed'
                                          : 'Started',
                                        insights: insightsForStudy,
                                      },
                                    }
                                  );
                                }}
                              >
                                <span>View interview</span>
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      {showNotification && (
        <SuccessNotification
          body={'Successfully copied link'}
          subText={'Anyone with a link can now start a chat session.'}
        />
      )}
    </div>
  );
}
