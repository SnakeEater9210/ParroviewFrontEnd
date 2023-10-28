// @ts-nocheck
import React, { useEffect } from 'react';
import { Formik } from 'formik';
import { useAuth0 } from '@auth0/auth0-react';
import { useNavigate, useLocation } from 'react-router-dom';
import FailureNotification from './FailureNotification';
import LoadingNotification from './LoadingNotification';
import { useStudyContext } from '../contexts/StudyContext';
import { Tooltip } from 'react-tooltip';

type FormikErrorValues = Record<string, string | undefined>;

export default function CreateStudy() {
  const { user } = useAuth0();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as any;
  const [editModeEnabled, setEditModeEnabled] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  const [showFailureNotification, setShowFailureNotification] =
    React.useState(false);

  const { updateStudy, createStudy, error, fetchStudies } = useStudyContext();

  const ASSISTANT_MESSAGE =
    "Welcome to the product research interview! I'm an AI research designer, and I'll be conducting this interview to gather insights related to our research goal. We'll have a conversation, and I'll be asking you a series of questions. I'll also ask follow-up questions to better understand your perspective. Please feel free to share your thoughts and experiences in your own words. Before we begin, is everything clear, and do you have any questions?";

  useEffect(() => {
    if (location.state) {
      setEditModeEnabled(true);
    }
  }, [state]);

  useEffect(() => {
    if (showFailureNotification === true) {
      setTimeout(() => {
        setShowFailureNotification(false);
      }, 3000);
    }
  }, [showFailureNotification]);

  function isValidURL(string) {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  }

  return (
    <>
      <Formik
        initialValues={{
          studyName: state ? state?.fields['StudyName'] : '',
          redirectUrl: state ? state?.fields['RedirectUrl'] : '',
          messagePrompt: state ? state?.fields['MessagePrompt'] : '',
          goal: state ? state?.fields['Goal'] : '',
          question1: state ? state?.fields['Question 1'] : '',
          question2: state ? state?.fields['Question 2'] : '',
          question3: state ? state?.fields['Question 3'] : '',
          question4: state ? state?.fields['Question 4'] : '',
          question5: state ? state?.fields['Question 5'] : '',
        }}
        validate={(values) => {
          const errors: FormikErrorValues = {};

          if (!values.studyName) {
            errors.studyName = 'Please enter a study name';
          }
          if (!values.goal) {
            errors.goal = 'Please enter a goal';
          }
          if (values.redirectUrl) {
            if (isValidURL(values.redirectUrl) === false) {
              errors.redirectUrl = 'Please enter a valid url';
            }
          }
          if (!values.question1) {
            errors.question1 = 'Please enter this question';
          }
          if (!values.question2) {
            errors.question2 = 'Please enter this question';
          }
          if (!values.question3) {
            errors.question3 = 'Please enter this question';
          }
          if (!values.question4) {
            errors.question4 = 'Please enter this question';
          }
          if (!values.question5) {
            errors.question5 = 'Please enter this question';
          }
          return errors;
        }}
        onSubmit={async (values) => {
          const fields = {
            StudyName: values.studyName,
            MessagePrompt: values.messagePrompt,
            RedirectUrl: values.redirectUrl,
            Goal: values.goal,
            'Question 1': values.question1,
            'Question 2': values.question2,
            'Question 3': values.question3,
            'Question 4': values.question4,
            'Question 5': values.question5,
            Email: user?.email,
          };

          let result;
          if (editModeEnabled) {
            result = await updateStudy(state?.fields['Session ID'], fields);
          } else {
            setIsLoading(true);
            result = await createStudy(fields);
          }

          if (!editModeEnabled) {
            // Define a retry function for exponential backoff.
            const retryFetchStudyWithBackOff = async (retryCount = 0) => {
              const delay = Math.pow(2, retryCount) * 1000; // Exponential backoff
              const studies = await fetchStudies();
              const latestStudy = studies[0];

              if (!latestStudy?.fields['Generated Link']) {
                setTimeout(
                  () => retryFetchStudyWithBackOff(retryCount + 1),
                  delay
                ); // Recursive retry
              }

              if (latestStudy?.fields['Generated Link']) {
                setIsLoading(false);
                navigate(`/study/view/${latestStudy?.fields['Session ID']}`);
              }
            };

            await retryFetchStudyWithBackOff();
            if (!result) {
              setShowFailureNotification(true);
            }
          } else {
            navigate(`/study/view/${state?.fields['Session ID']}`);
          }
        }}
      >
        {({
          values,
          errors,
          touched,
          handleChange,
          handleBlur,
          handleSubmit,
        }) => (
          <form onSubmit={handleSubmit}>
            <div className="space-y-12">
              <div className="grid grid-cols-1 gap-x-8 gap-y-10 border-b border-gray-900/10 pb-12 md:grid-cols-3">
                <div>
                  <h2 className="text-base font-semibold leading-7 text-gray-900">
                    Personal Information
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-gray-600">
                    This information will help us to calibrate your desired
                    study for you. <br></br>Please fill in a goal, which is the
                    intended outcome of the study alongside some questions that
                    you would like the AI interviewer to ask on your behalf.
                  </p>
                </div>

                <div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6 md:col-span-2">
                  <div className="sm:col-span-4">
                    <label
                      htmlFor="studyName"
                      className="block text-sm font-medium leading-6 text-gray-900"
                    >
                      Study name
                    </label>
                    <div className="mt-2">
                      <input
                        id="studyName"
                        name="studyName"
                        type="text"
                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                        value={values.studyName}
                        onChange={handleChange}
                        onBlur={handleBlur}
                      />
                      <p
                        className="mt-2 text-sm text-gray-500"
                        id="email-description"
                      >
                        Enter a name for your study. Make it as descriptive as
                        possible so that you can easily identify your insights
                        later.
                      </p>
                      {touched.studyName && errors.studyName ? (
                        <div className="text-red-500 text-sm">
                          {errors.studyName}
                        </div>
                      ) : null}
                    </div>
                  </div>
                  <div className="sm:col-span-4">
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium leading-6 text-gray-900"
                    >
                      Goal
                    </label>
                    <div className="mt-2">
                      <textarea
                        rows={4}
                        name="goal"
                        id="goal"
                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                        value={values.goal}
                        onChange={handleChange}
                        onBlur={handleBlur}
                      />
                      {touched.goal && errors.goal ? (
                        <div className="text-red-500 text-sm">
                          {errors.goal}
                        </div>
                      ) : null}
                    </div>
                    <p
                      className="mt-2 text-sm text-gray-500"
                      id="email-description"
                    >
                      Define study goal for the AI interviewer to emphasize
                      relevant points and devise insightful follow-up questions
                      based on user responses.
                    </p>
                  </div>
                  <div className="sm:col-span-4">
                    <label
                      htmlFor="redirectUrl"
                      className="block text-sm font-medium leading-6 text-gray-900"
                    >
                      Redirect url (Optional)
                    </label>
                    <div className="mt-2">
                      <input
                        name="redirectUrl"
                        id="redirectUrl"
                        type="text"
                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                        value={values.redirectUrl}
                        onChange={handleChange}
                        onBlur={handleBlur}
                      />
                      {touched.redirectUrl && errors.redirectUrl ? (
                        <div className="text-red-500 text-sm">
                          {errors.redirectUrl}
                        </div>
                      ) : null}
                    </div>
                    <p
                      className="mt-2 text-sm text-gray-500"
                      id="email-description"
                    >
                      This lets you redirect the user at the end of an
                      interview. If left blank, then the participant will not be
                      redirected.
                    </p>
                  </div>

                  <div className="sm:col-span-4">
                    <label
                      htmlFor="messagePrompt"
                      className="block text-sm font-medium leading-6 text-gray-900"
                    >
                      Welcome Message (Optional)
                    </label>
                    <div className="mt-2">
                      <textarea
                        rows={4}
                        name="messagePrompt"
                        id="messagePrompt"
                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                        value={values.messagePrompt}
                        onChange={handleChange}
                        onBlur={handleBlur}
                      />
                      {touched.messagePrompt && errors.messagePrompt ? (
                        <div className="text-red-500 text-sm">
                          {errors.messagePrompt}
                        </div>
                      ) : null}
                    </div>
                    <p
                      className="mt-2 text-sm text-gray-500"
                      id="email-description"
                    >
                      This is the first message shown when the user starts the
                      interview. If left blank, the
                      <a
                        data-tooltip-id="insight-tt"
                        data-tooltip-content={ASSISTANT_MESSAGE}
                        className="underline px-[0.3rem]"
                      >
                        default message
                      </a>
                      <Tooltip
                        id="insight-tt"
                        style={{ maxWidth: '26rem', whiteSpace: 'normal' }}
                      />
                      will be used.
                    </p>
                  </div>
                  <div className="sm:col-span-4">
                    <label
                      htmlFor="question1"
                      className="block text-sm font-medium leading-6 text-gray-900"
                    >
                      Question 1
                    </label>
                    <div className="mt-2">
                      <input
                        id="question1"
                        name="question1"
                        type="text"
                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                        value={values.question1}
                        onChange={handleChange}
                        onBlur={handleBlur}
                      />
                      <p
                        className="mt-2 text-sm text-gray-500"
                        id="email-description"
                      >
                        Question 1 that the interviewer will ask the user.
                      </p>
                      {touched.question1 && errors.question1 ? (
                        <div className="text-red-500 text-sm">
                          {errors.question1}
                        </div>
                      ) : null}
                    </div>
                  </div>
                  <div className="sm:col-span-4">
                    <label
                      htmlFor="question2"
                      className="block text-sm font-medium leading-6 text-gray-900"
                    >
                      Question 2
                    </label>
                    <div className="mt-2">
                      <input
                        id="question2"
                        name="question2"
                        type="text"
                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                        value={values.question2}
                        onChange={handleChange}
                        onBlur={handleBlur}
                      />
                      <p
                        className="mt-2 text-sm text-gray-500"
                        id="email-description"
                      >
                        Question 2 that the interviewer will ask the user.
                      </p>
                      {touched.question2 && errors.question2 ? (
                        <div className="text-red-500 text-sm">
                          {errors.question2}
                        </div>
                      ) : null}
                    </div>
                  </div>
                  <div className="sm:col-span-4">
                    <label
                      htmlFor="question3"
                      className="block text-sm font-medium leading-6 text-gray-900"
                    >
                      Question 3
                    </label>
                    <div className="mt-2">
                      <input
                        id="question3"
                        name="question3"
                        type="text"
                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                        value={values.question3}
                        onChange={handleChange}
                        onBlur={handleBlur}
                      />
                      <p
                        className="mt-2 text-sm text-gray-500"
                        id="email-description"
                      >
                        Question 3 that the interviewer will ask the user.
                      </p>
                      {touched.question3 && errors.question3 ? (
                        <div className="text-red-500 text-sm">
                          {errors.question3}
                        </div>
                      ) : null}
                    </div>
                  </div>
                  <div className="sm:col-span-4">
                    <label
                      htmlFor="question4"
                      className="block text-sm font-medium leading-6 text-gray-900"
                    >
                      Question 4
                    </label>
                    <div className="mt-2">
                      <input
                        id="question4"
                        name="question4"
                        type="text"
                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                        value={values.question4}
                        onChange={handleChange}
                        onBlur={handleBlur}
                      />
                      <p
                        className="mt-2 text-sm text-gray-500"
                        id="email-description"
                      >
                        Question 4 that the interviewer will ask the user.
                      </p>
                      {touched.question4 && errors.question4 ? (
                        <div className="text-red-500 text-sm">
                          {errors.question4}
                        </div>
                      ) : null}
                    </div>
                  </div>
                  <div className="sm:col-span-4">
                    <label
                      htmlFor="question5"
                      className="block text-sm font-medium leading-6 text-gray-900"
                    >
                      Question 5
                    </label>
                    <div className="mt-2">
                      <input
                        id="question5"
                        name="question5"
                        type="text"
                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                        value={values.question5}
                        onChange={handleChange}
                        onBlur={handleBlur}
                      />
                      <p
                        className="mt-2 text-sm text-gray-500"
                        id="email-description"
                      >
                        Question 5 that the interviewer will ask the user.
                      </p>
                      {touched.question5 && errors.question5 ? (
                        <div className="text-red-500 text-sm">
                          {errors.question5}
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-x-6">
              <button
                type="button"
                className="text-sm font-semibold leading-6 text-gray-900"
                onClick={() => {
                  editModeEnabled
                    ? navigate(`/study/view/${state?.fields['Session ID']}`)
                    : navigate('/study/');
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className={`${
                  isLoading ? 'opacity-50' : ''
                } rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600`}
              >
                Save
              </button>
            </div>
          </form>
        )}
      </Formik>
      {isLoading && <LoadingNotification />}
      {showFailureNotification && <FailureNotification />}
    </>
  );
}
