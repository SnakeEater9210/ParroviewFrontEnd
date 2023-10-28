// @ts-nocheck
import { Fragment, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import formatDate from '../utils';
import { useInsights } from '../contexts/InsightContext';

type insightModalProps = {
  type: string;
  content: string;
  chatId: string;
  timestamp: string;
  status: string;
  isInsight?: boolean;
  sessionId?: string;
  insights?: Array<any>;
};

type HandlerProps = {
  showModal: boolean;
  closeModalHandler: (input: boolean) => void;
};

export default function InsightModal({
  insightModalProps,
  handlerProps,
}: {
  insightModalProps: insightModalProps;
  handlerProps: HandlerProps;
}) {
  const { sessionId, chatId, insights } = insightModalProps;
  const { isLoading, computeInsights, insight } = useInsights(); // <-- Use the new hook

  useEffect(() => {
    if (
      insights?.some((insight) => insight.fields.ChatSessionId === chatId) ||
      insight?.message
    ) {
      return;
    }
    debugger;
    computeInsights(insightModalProps.content, sessionId, chatId); // <-- Updated this call
  }, []);

  function formatContent(content: string) {
    if (content) {
      const formattedContent = content
        .replace(/<b>Executive Summary:<\/b>/, `<b>Executive Summary:</b>`)
        .replace(/<b>Key Points:<\/b>/, `<b>Key Points:</b>`)
        .replace(/<b>Notable Quotes:<\/b>/, `<br><b>Notable Quotes:</b>`)
        .replace(
          /<b>Suggested Next Steps:<\/b>/,
          `<br><b>Suggested Next Steps:</b>`
        )
        .replace(/- /g, '<br>- ')
        .replace(/\d\./g, '<br>$&')
        .replace(/\n/g, '<br>');

      return formattedContent;
    }
  }

  function renderContent() {
    if (isLoading) {
      return (
        <>
          <div role="status" className="flex flex-col items-center my-2">
            <svg
              aria-hidden="true"
              className="w-20 h-20 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600 mt-4"
              viewBox="0 0 100 101"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                fill="currentColor"
              />
              <path
                d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                fill="currentFill"
              />
            </svg>
            <span className="sr-only"></span>
            <span className="mt-4 font text-xl">
              Generating your insights...This may take up to 30 seconds..
            </span>
          </div>
        </>
      );
    } else {
      const matchingInsight = insights?.find(
        (insight) => insight.fields.ChatSessionId === chatId
      );

      const messageContent =
        matchingInsight?.fields?.Insights ||
        insight?.message ||
        'Default Message';

      const message = formatContent(messageContent);

      return <div dangerouslySetInnerHTML={{ __html: message || '' }}></div>;
    }
  }

  return (
    <Transition.Root show={handlerProps.showModal} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-10"
        onClose={handlerProps.closeModalHandler}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-[85%] sm:p-6">
                <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
                  <button
                    type="button"
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    onClick={() => handlerProps.closeModalHandler(false)}
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>
                <div className="sm:flex sm:items-start">
                  <div className="flex flex-col w-[100%]">
                    <div className="mt-3 text-center sm:mt-0 sm:text-left">
                      <Dialog.Title
                        as="h3"
                        className="text-xl leading-6 text-gray-900 mb-2"
                      >
                        Insight Interview ID: {insightModalProps.chatId}
                      </Dialog.Title>
                      {insightModalProps.chatId &&
                        insightModalProps.timestamp &&
                        insightModalProps.status && (
                          <div className="flex flex-col mb-2">
                            <span>
                              Status:{' '}
                              <span
                                className={
                                  insightModalProps.status === 'Completed'
                                    ? 'text-green-500'
                                    : ''
                                }
                              >
                                {insightModalProps.status}
                              </span>
                            </span>
                            <span>
                              Timestamp:{' '}
                              {formatDate(insightModalProps.timestamp)}
                            </span>
                          </div>
                        )}
                    </div>
                    <div className="border border-solid w-[100%]"></div>
                    <div className="mt-2">{renderContent()}</div>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
