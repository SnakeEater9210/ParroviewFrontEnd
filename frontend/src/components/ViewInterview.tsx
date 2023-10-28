// @ts-nocheck
import { ArrowLeftIcon } from '@heroicons/react/24/solid';
import { useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import InformationModal from './InformationModal';
import InsightModal from './InsightModal';
import { useStudyContext } from '../contexts/StudyContext';

export default function ViewInterview() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as any;
  const { sessionId, chatId, status, timestamp, transcript, insights } = state;
  const [transcriptionModalProps, setTranscriptionModalProps] = useState({});
  const [insightModalProps, setInsightModalProps] = useState({});
  const [showTranscript, setShowTranscript] = useState(false);
  const [showInsights, setShowInsights] = useState(false);

  const { interviewDataRecords } = useStudyContext();

  const memoizedInformationModalHandlerProps = useMemo(() => {
    return {
      showModal: showTranscript,
      closeModalHandler: setShowTranscript,
    };
  }, [showTranscript]);

  const memoizedInsightModalHandlerProps = useMemo(() => {
    return {
      showModal: showInsights,
      closeModalHandler: setShowInsights,
    };
  }, [showInsights]);

  console.log(interviewDataRecords);

  function retrieveInterviewDataRecordData() {
    if (interviewDataRecords) {
      const interviewDataRecord = interviewDataRecords.find(
        (record) => record.fields.ChatSessionId === chatId
      );

      return interviewDataRecord;
    }
  }

  console.log(retrieveInterviewDataRecordData());
  console.log(chatId);

  return (
    <div>
      <ArrowLeftIcon
        onClick={() => navigate(`/study/view/${state.sessionId}`)}
        className="mb-8 cursor-pointer"
        height={45}
        width={45}
      />
      <div className="sm:px-0 px-2">
        <div className="flex justify-between">
          <p className="text-3xl font-bold leading-tight tracking-tight text-gray-900 mb-4">
            Viewing details for interview {state.chatId}
          </p>
        </div>
      </div>

      <div className="overflow-hidden bg-white shadow sm:rounded-lg">
        <div className="border-t border-gray-100">
          <dl className="divide-y divide-gray-100">
            <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-900">Full name</dt>
              <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                {retrieveInterviewDataRecordData()?.fields?.FullName ||
                  'User has not provided a name'}
              </dd>
            </div>
            <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-900">Email</dt>
              <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                {retrieveInterviewDataRecordData()?.fields?.Email ||
                  'User has not provided an email'}
              </dd>
            </div>
            <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-900">
                Phone number
              </dt>
              <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                {retrieveInterviewDataRecordData()?.fields?.PhoneNumber ||
                  'User has not provided a phone number'}
              </dd>
            </div>
            <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-900">
                <button
                  type="button"
                  className="hover:text-indigo-900 text-indigo-600"
                  onClick={async () => {
                    setInsightModalProps({
                      chatId: chatId,
                      type: 'insight',
                      timestamp: timestamp,
                      status: status,
                      sessionId: sessionId,
                      insights: insights,
                      content: transcript,
                    });

                    return setShowInsights(true);
                  }}
                >
                  <span>View insights</span>
                </button>
              </dt>
              <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                <button
                  type="button"
                  className="hover:text-indigo-900 text-indigo-600"
                  onClick={() => {
                    setTranscriptionModalProps({
                      content: transcript,
                      chatId: chatId,
                      type: 'transcript',
                      timestamp: timestamp,
                      status: status,
                    });

                    return setShowTranscript(true);
                  }}
                >
                  <span>View Transcript</span>
                </button>
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {showTranscript && (
        <InformationModal
          transcriptionModalProps={transcriptionModalProps}
          handlerProps={memoizedInformationModalHandlerProps}
        />
      )}
      {showInsights && (
        <InsightModal
          insightModalProps={insightModalProps}
          handlerProps={memoizedInsightModalHandlerProps}
        />
      )}
    </div>
  );
}
