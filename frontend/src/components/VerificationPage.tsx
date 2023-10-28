// @ts-nocheck
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';

export default function VerificationPage() {
  const { user, loginWithRedirect } = useAuth0();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.email_verified) {
      navigate('/study/');
    } else {
      loginWithRedirect({
        redirectUri: window.location.origin + '/verify/',
      });
    }
  }, [user, navigate, loginWithRedirect]);

  const handleLoginClick = () => {
    loginWithRedirect({
      redirectUri: window.location.origin + '/login/',
    });
  };

  return (
    <div className="bg-white">
      <div className="px-6 py-24 sm:px-6 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Email Verification
          </h2>
          <div className="flex justify-center p-4"></div>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-gray-600">
            Please check your email for a verification link. If you can't spot
            it, check your spam folder. You can close this window after you have
            verified
          </p>
          <p className="mt-4 text-xl">
            Return to{' '}
            <button className="text-blue-800" onClick={handleLoginClick}>
              login
            </button>{' '}
            page
          </p>
          <p className="mt-4 text-xl">
            Something went wrong? Reach out to{' '}
            <a className="text-blue-800" href="mailto:aman@parroview.com">
              aman@parroview.com
            </a>{' '}
            for support
          </p>
        </div>
      </div>
    </div>
  );
}
