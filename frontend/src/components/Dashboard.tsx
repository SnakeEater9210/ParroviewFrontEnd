// @ts-nocheck
import { useEffect, useState } from 'react';
import { Disclosure, Menu, Transition } from '@headlessui/react';
import { Bars3Icon, BellIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useAuth0 } from '@auth0/auth0-react';
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import Table from './Table';
import CreateStudy from './CreateStudy';
import ViewStudy from './EditStudy';
import parroviewLogo from '../assets/parroview_logo.png';
import Profile from './Profile';
import UsageBanner from './UsageBanner';
import { useStudyContext } from '../contexts/StudyContext';
import ViewInterview from './ViewInterview';

const navigation = [{ name: 'Your Studies', current: true }];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default function Dashboard() {
  const { logout, user, isAuthenticated, getIdTokenClaims } = useAuth0();
  const navigate = useNavigate();
  const location = useLocation();
  const [claims, setClaims] = useState(null);
  let headerText = 'Your studies';

  const [isUsageBannerVisible, setIsUsageBannerVisible] = useState(
    () => sessionStorage.getItem('usageBannerDismissed') === null
  );

  const handleDismissUsageBanner = () => {
    setIsUsageBannerVisible(false);
    sessionStorage.setItem('usageBannerDismissed', 'true');
  };

  useEffect(() => {
    async function getClaims() {
      const claims = await getIdTokenClaims();
      setClaims(claims);
    }
    getClaims();
  }, []);

  const { completedInterviews } = useStudyContext();

  if (location.pathname.includes('create')) {
    headerText = 'Create Study';
  }

  if (location.pathname.includes('edit')) {
    headerText = 'Edit Study';
  }

  if (location.pathname.includes('view')) {
    headerText = '';
  }

  if (location.pathname.includes('me')) {
    headerText = '';
  }

  const userNavigation = [
    { name: 'Your Profile', handler: () => navigate('/profile/me') },
    {
      name: 'Sign out',
      handler: () => logout({ returnTo: 'https://app.parroview.com/login/' }),
      href: '#',
    },
  ];

  if (!isAuthenticated) {
    // TODO add error screens from tailwind UI?
    return <div>You don't have permission to view this page</div>;
  }
  return (
    <>
      <div className="min-h-full">
        {completedInterviews >=
          claims?.['parroviewUser/app_metadata']?.['interviewCount'] &&
          isUsageBannerVisible && (
            <UsageBanner onDismiss={handleDismissUsageBanner} />
          )}
        <Disclosure as="nav" className="border-b border-gray-200 bg-white">
          {({ open }) => (
            <>
              <div className="mx-auto max-w-7xl sm:px-4">
                <div className="flex h-16 px-4 sm:px-6 lg:px-8 justify-between">
                  <div className="flex">
                    <div
                      className="flex flex-shrink-0 items-center"
                      onClick={() => navigate('/')}
                    >
                      <img
                        className="block h-8 w-auto lg:hidden"
                        src={parroviewLogo}
                        alt="Parroview logo"
                      />
                      <img
                        className="hidden h-8 w-auto lg:block"
                        src={parroviewLogo}
                        alt="Parroview logo"
                      />
                    </div>
                    <div className="hidden sm:-my-px sm:ml-6 sm:flex sm:space-x-8">
                      {navigation.map((item) => (
                        <a
                          key={item.name}
                          onClick={() => navigate('/study/')}
                          className={classNames(
                            item.current
                              ? 'border-indigo-500 text-gray-900'
                              : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
                            'inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium cursor-pointer'
                          )}
                          aria-current={item.current ? 'page' : undefined}
                        >
                          {item.name}
                        </a>
                      ))}
                    </div>
                  </div>
                  <div className="hidden sm:ml-6 sm:flex sm:items-center">
                    <Menu as="div" className="relative ml-3">
                      <div>
                        <Menu.Button className="flex max-w-xs items-center rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                          <span className="sr-only">Open user menu</span>
                          <img
                            className="h-8 w-8 rounded-full"
                            src={user?.picture}
                            alt=""
                          />
                        </Menu.Button>
                      </div>
                      <Transition
                        as="div"
                        enter="transition ease-out duration-200"
                        enterFrom="transform opacity-0 scale-95"
                        enterTo="transform opacity-100 scale-100"
                        leave="transition ease-in duration-75"
                        leaveFrom="transform opacity-100 scale-100"
                        leaveTo="transform opacity-0 scale-95"
                      >
                        <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                          {userNavigation.map((item) => (
                            <Menu.Item key={item.name}>
                              {({ active }) => (
                                <a
                                  href={item.href}
                                  className={classNames(
                                    active ? 'bg-gray-100 cursor-pointer' : '',
                                    'block px-4 py-2 text-sm text-gray-700'
                                  )}
                                  onClick={item.handler}
                                >
                                  {item.name}
                                </a>
                              )}
                            </Menu.Item>
                          ))}
                        </Menu.Items>
                      </Transition>
                    </Menu>
                  </div>
                  <div className="-mr-2 flex items-center sm:hidden">
                    {/* Mobile menu button */}
                    <Disclosure.Button className="inline-flex items-center justify-center rounded-md bg-white p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                      <span className="sr-only">Open main menu</span>
                      {open ? (
                        <XMarkIcon
                          className="block h-6 w-6"
                          aria-hidden="true"
                        />
                      ) : (
                        <Bars3Icon
                          className="block h-6 w-6"
                          aria-hidden="true"
                        />
                      )}
                    </Disclosure.Button>
                  </div>
                </div>
              </div>

              <Disclosure.Panel className="sm:hidden">
                <div className="space-y-1 pb-3 pt-2">
                  {navigation.map((item) => (
                    <Disclosure.Button
                      key={item.name}
                      as="a"
                      href={item.href}
                      className={classNames(
                        item.current
                          ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                          : 'border-transparent text-gray-600 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-800',
                        'block border-l-4 py-2 pl-3 pr-4 text-base font-medium'
                      )}
                      aria-current={item.current ? 'page' : undefined}
                    >
                      {item.name}
                    </Disclosure.Button>
                  ))}
                </div>
                <div className="border-t border-gray-200 pb-3 pt-4">
                  <div className="flex items-center px-4">
                    <div className="flex-shrink-0">
                      <img
                        className="h-10 w-10 rounded-full"
                        src={user?.picture}
                        alt=""
                      />
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-500">
                        {user?.email}
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 space-y-1">
                    {userNavigation.map((item) => (
                      <Disclosure.Button
                        key={item.name}
                        as="a"
                        href={item.href}
                        onClick={item.handler}
                        className="block px-4 py-2 text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                      >
                        {item.name}
                      </Disclosure.Button>
                    ))}
                  </div>
                </div>
              </Disclosure.Panel>
            </>
          )}
        </Disclosure>

        <div className="py-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <header className="mb-2">
            <div>
              <h1 className="text-3xl font-bold leading-tight tracking-tight text-gray-900">
                {headerText}
              </h1>
            </div>
          </header>
          <main>
            <>
              <Routes>
                <Route path="/" element={<Table />} />
                <Route path="create" element={<CreateStudy />} />
                <Route path="edit/*" element={<CreateStudy />} />
                <Route path="view/*" element={<ViewStudy />} />
                <Route path="me/*" element={<Profile />} />
                <Route path="interview/*" element={<ViewInterview />} />
              </Routes>
            </>
          </main>
        </div>
      </div>
    </>
  );
}
