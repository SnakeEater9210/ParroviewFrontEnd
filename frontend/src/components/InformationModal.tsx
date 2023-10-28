import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import formatDate from '../utils';

const ParseConversation = ({ conversation }: { conversation: string }) => {
  const assistantSplit = conversation.split('**Assistant**: ');
  const userSplit = assistantSplit.map((subStr) => subStr.split('**User**: '));
  const flattenedSplit = userSplit.flat();

  const formattedConversation = flattenedSplit.map((str, index) => {
    const paragraphStyle = { marginBottom: '16px' }; // Add spacing between paragraphs

    if (index === 0) {
      return null; // Ignore the first element since it's the introduction
    } else if (index % 2 === 1) {
      return (
        <p key={index} style={paragraphStyle}>
          <strong>Assistant:</strong> {str}
        </p>
      );
    } else {
      return (
        <p key={index} style={paragraphStyle}>
          <strong>User:</strong> {str}
        </p>
      );
    }
  });

  return <div>{formattedConversation}</div>;
};

type TranscriptModalProps = {
  type: string;
  content: string;
  chatId: string;
  timestamp: string;
  status: string;
};

type HandlerProps = {
  showModal: boolean;
  closeModalHandler: (input: boolean) => void;
};

export default function InformationModal({
  transcriptionModalProps,
  handlerProps,
}: {
  transcriptionModalProps: TranscriptModalProps;
  handlerProps: HandlerProps;
}) {
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
                  <div className="flex flex-col">
                    <div className="mt-3 text-center sm:mt-0 sm:text-left">
                      <Dialog.Title
                        as="h3"
                        className="text-xl leading-6 text-gray-900 mb-2"
                      >
                        Transcript Interview ID:{' '}
                        {transcriptionModalProps.chatId}
                      </Dialog.Title>
                      {transcriptionModalProps.chatId &&
                        transcriptionModalProps.timestamp &&
                        transcriptionModalProps.status && (
                          <div className="flex flex-col mb-2">
                            <span>
                              Status:{' '}
                              <span
                                className={
                                  transcriptionModalProps.status === 'Completed'
                                    ? 'text-green-500'
                                    : ''
                                }
                              >
                                {transcriptionModalProps.status}
                              </span>
                            </span>
                            <span>
                              Timestamp:{' '}
                              {formatDate(transcriptionModalProps.timestamp)}
                            </span>
                          </div>
                        )}
                    </div>
                    <div className="border border-solid w-[100%]"></div>
                    <div className="mt-2">
                      <ParseConversation
                        conversation={transcriptionModalProps.content}
                      />
                    </div>
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
