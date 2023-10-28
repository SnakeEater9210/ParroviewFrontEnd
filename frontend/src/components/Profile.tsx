// @ts-nocheck
import { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useAirtableAPI } from '../hooks/useAirtableAPI';
import { ArrowLeftIcon, ClipboardIcon } from '@heroicons/react/24/solid';
import { useNavigate } from 'react-router-dom';
import { useStudyContext } from '../contexts/StudyContext';
import { useStripe } from '@stripe/react-stripe-js';
import SuccessNotification from './SuccessNotification';
import formatDate from '../utils';

export default function Profile() {
  const { user: auth0User, getIdTokenClaims } = useAuth0();
  const [user, setUser] = useState(null);
  const [claims, setClaims] = useState(null);
  const [showNotification, setShowNotification] = useState(false);
  const navigate = useNavigate();
  const { completedInterviews } = useStudyContext();
  const stripe = useStripe();

  const { records, error, isLoading } = useAirtableAPI({
    baseId: import.meta.env.VITE_AIRTABLE_BASE_ID,
    tableName: 'Users',
  });

  useEffect(() => {
    async function getClaims() {
      const claims = await getIdTokenClaims();
      setClaims(claims);
    }
    getClaims();
  }, []);

  useEffect(() => {
    if (records) {
      const currentUser = records.find(
        (record) => record.fields.Email === auth0User?.email
      );
      setUser(currentUser);
    }
  }, [records]);

  useEffect(() => {
    if (showNotification === true) {
      setTimeout(() => {
        setShowNotification(false);
      }, 3000);
    }
  }, [showNotification]);

  return (
    <>
      <ArrowLeftIcon
        onClick={() => navigate('/study')}
        className="mb-8 cursor-pointer"
        height={45}
        width={45}
      />
      <p className="text-3xl font-bold leading-tight tracking-tight text-gray-900 mb-8">
        Your Account
      </p>
      <div className="overflow-hidden bg-white shadow sm:rounded-lg">
        <div className="px-4 py-6 sm:px-6">
          <h3 className="text-base font-semibold leading-7 text-gray-900">
            Account Information
          </h3>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-gray-500">
            Manage your subscription and account here.
            <div className="mt-2 sm:mt-4 flex-col sm:flex sm:flex-row  items-center">
              Need support? Send us an email at{' '}
              <ClipboardIcon
                className="hidden sm:block sm:ml-2 mt-2 sm:mt-0 cursor-pointer"
                height={15}
                width={15}
              />
              <span
                className="text-purple-800 sm:ml-[2px] cursor-pointer"
                onClick={() => {
                  navigator.clipboard.writeText('aman@parroview.com');
                  setShowNotification(true);
                }}
              >
                aman@parroview.com
              </span>
            </div>
          </p>
        </div>
        <div className="border-t border-gray-100">
          <dl className="divide-y divide-gray-100">
            <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-900">
                Email address
              </dt>
              <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                {auth0User?.email}
              </dd>
            </div>
            <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-900">Plan</dt>
              <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                {claims?.['parroviewUser/app_metadata']?.['tier']}
              </dd>
            </div>
            <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-900">Usage</dt>
              <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                {completedInterviews} /{' '}
                {claims?.['parroviewUser/app_metadata']?.['interviewCount']}
              </dd>
            </div>
            {claims?.['parroviewUser/app_metadata']?.['tier'] ===
              'Professional' && (
              <div className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-900">
                  Subscription renewal date
                </dt>
                <dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
                  {formatDate(
                    new Date(
                      claims?.['parroviewUser/app_metadata']?.[
                        'subscriptionEndDate'
                      ] * 1000
                    ).toISOString()
                  )}
                </dd>
              </div>
            )}
            {claims?.['parroviewUser/app_metadata']?.['tier'] !==
              'Professional' && (
              <div className="px-4 py-6 sm:grid sm:grid-cols-4 sm:gap-4 sm:px-6 relative">
                <button
                  className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                  onClick={async () => {
                    // debugger;
                    if (auth0User?.sub) {
                      const response = await fetch(
                        import.meta.env.PROD
                          ? import.meta.env.VITE_STRIPE_PROD_URL
                          : import.meta.env.VITE_STRIPE_DEV_URL,
                        {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                          },
                          body: JSON.stringify({
                            customerId: import.meta.env.PROD
                              ? claims?.['parroviewUser/app_metadata']?.[
                                  'stripe_customer_id'
                                ]
                              : claims?.['parroviewUser/app_metadata']?.[
                                  'test_stripe_customer_id'
                                ],
                            auth0userId: auth0User?.sub,
                          }),
                        }
                      );
                      const data = await response.json();
                      if (data) {
                        debugger;
                        const result = await stripe.redirectToCheckout({
                          sessionId: data.sessionId,
                        });
                        if (result.error) {
                          console.log(result.error.message);
                        }
                      }
                    }
                  }}
                >
                  Upgrade
                </button>
              </div>
            )}
          </dl>
        </div>
      </div>
      {showNotification && (
        <SuccessNotification body={'Successfully copied email address'} />
      )}
    </>
  );
}
