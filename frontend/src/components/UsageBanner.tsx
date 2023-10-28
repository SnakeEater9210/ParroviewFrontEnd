// @ts-nocheck
import { useEffect, useState } from 'react';
import { ExclamationTriangleIcon, XMarkIcon } from '@heroicons/react/20/solid';
import { useStripe } from '@stripe/react-stripe-js';
import { useAuth0 } from '@auth0/auth0-react';

export default function UsageBanner({ onDismiss }) {
  const { user: auth0User, getIdTokenClaims } = useAuth0();
  const [claims, setClaims] = useState(null);
  const stripe = useStripe();

  useEffect(() => {
    async function getClaims() {
      const claims = await getIdTokenClaims();
      setClaims(claims);
    }
    getClaims();
  }, []);

  return (
    <div className="flex items-center justify-between gap-x-6 bg-red-500 px-6 py-2.5 sm:pr-3.5 lg:pl-8">
      <p className="text-sm leading-6 text-white flex">
        <ExclamationTriangleIcon height={25} width={25} className="mr-2" />
        You have finished your allowance, to continue using Parroview switch to
        a pro account.
      </p>

      <div className="flex">
        <button
          className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          onClick={async () => {
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
        <button
          type="button"
          className="-m-3 p-3 ml-3 focus-visible:outline-offset-[-4px]"
          onClick={onDismiss}
        >
          <span className="sr-only">Dismiss</span>
          <XMarkIcon className="h-5 w-5 text-white" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
