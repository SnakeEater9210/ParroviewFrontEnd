// @ts-nocheck
import { useState, useEffect } from 'react';
import { ClipboardIcon } from '@heroicons/react/24/solid';
import { useAuth0 } from '@auth0/auth0-react';
import SuccessNotification from './SuccessNotification';
import { useNavigate } from 'react-router-dom';
import { useStudyContext } from '../contexts/StudyContext';

export default function Table() {
  const [showNotification, setShowNotification] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth0();

  const { records, isLoading, transcripts, completedInterviews } =
    useStudyContext();

  useEffect(() => {
    if (showNotification === true) {
      setTimeout(() => {
        setShowNotification(false);
      }, 3000);
    }
  }, [showNotification]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <p className="mt-2 text-sm text-gray-700">
            A list of all studies created and their assosciated data.
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <button
            type="button"
            onClick={() => {
              navigate('create/');
            }}
            // disabled={completedInterviews >= 3}
            className="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Create study
          </button>
        </div>
      </div>
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
                    Name
                  </th>
                  <th
                    scope="col"
                    className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0"
                  >
                    ID
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                  >
                    Responses
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                  >
                    Public URL
                  </th>
                  <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-0">
                    <span className="sr-only">Expand</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {records.map((r: any) => {
                  if (r.fields['Email'] === user?.email) {
                    return (
                      <tr key={r.fields['Session ID']}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">
                          {r.fields['StudyName']
                            ? r.fields['StudyName']
                            : 'Name not provided'}
                        </td>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">
                          {r.fields['Session ID']}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {
                            transcripts?.filter(
                              (record) =>
                                record.fields['Session ID'] ===
                                r.fields['Session ID']
                            ).length
                          }
                        </td>
                        <td
                          className="flex whitespace-nowrap px-3 py-4 text-sm text-indigo-600 cursor-pointer"
                          onClick={() => {
                            navigator.clipboard.writeText(
                              r.fields['Generated Link']
                            );
                            setShowNotification(true);
                          }}
                        >
                          <ClipboardIcon className="h-4 w-4 mr-1 text-gray-400" />
                          Copy link
                        </td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                          <button
                            type="button"
                            className="text-indigo-600 hover:text-indigo-900 cursor-pointer bg-white border border-indigo-600 py-1 px-3 rounded-md shadow-sm"
                            onClick={() => {
                              navigate(`view/${r.fields['Session ID']}`);
                            }}
                          >
                            View study
                            <span className="sr-only">{`, ${r.fields['StudyName']}`}</span>
                          </button>
                        </td>
                      </tr>
                    );
                  }
                })}
              </tbody>
            </table>
            {showNotification && (
              <SuccessNotification
                body={'Successfully copied link'}
                subText={'Anyone with a link can now start a chat session.'}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
