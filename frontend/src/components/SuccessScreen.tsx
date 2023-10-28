import parroviewLogo from '../assets/parroview_logo.png';
import { useNavigate } from 'react-router-dom';

export default function SuccessScreen() {
  const navigate = useNavigate();
  return (
    <>
      {/*
          This example requires updating your template:
  
          ```
          <html class="h-full">
          <body class="h-full">
          ```
        */}
      <main className="grid min-h-full place-items-center bg-white px-6 py-24 sm:py-32 lg:px-8">
        <div className="text-center">
          <div>
            <img
              className="block h-8 w-auto lg:hidden"
              src={parroviewLogo}
              alt="Parroview logo"
            />
          </div>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Successfully upgraded to the Pro tier!
          </h1>
          <p className="mt-6 text-base leading-7 text-gray-600">
            Congratulations, and thank you for supporting Parroview!
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <button
              className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              onClick={() => navigate('/study/')}
            >
              Go back home
            </button>
            <a href="#" className="text-sm font-semibold text-gray-900">
              Contact support <span aria-hidden="true">&rarr;</span>
            </a>
          </div>
        </div>
      </main>
    </>
  );
}
