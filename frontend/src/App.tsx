import Dashboard from './components/Dashboard';
import { useAuth0 } from '@auth0/auth0-react';
import Signup from './components/Signup';
import { Route, Routes, Navigate } from 'react-router-dom';
// import VerificationPage from './components/VerificationPage';
import { StudyProvider } from './contexts/StudyContext';
import { InsightsProvider } from './contexts/InsightContext';
import SuccessScreen from './components/SuccessScreen';
import FailureScreen from './components/FailureScreen';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

function App() {
  // TODO add user back into the list of d args below
  const { isLoading, isAuthenticated } = useAuth0();

  const key = import.meta.env.PROD
    ? import.meta.env.VITE_STRIPE_PROD_KEY
    : import.meta.env.VITE_STRIPE_TEST_KEY;

  const stripePromise = loadStripe(key);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  function DetermineRoute() {
    // && user?.email_verified TODO add this back in once we've got email verification required again
    if (isAuthenticated) {
      return <Navigate to="/study" />;
    }
    // if (isAuthenticated && !user?.email_verified) {
    //   return <Navigate to="/verify" />;
    // }
    if (!isAuthenticated) {
      return <Navigate to="/login" />;
    }
  }

  return (
    <StudyProvider>
      <InsightsProvider>
        <Elements stripe={stripePromise}>
          <div className="App">
            <Routes>
              <Route path="/" element={DetermineRoute()} />
              <Route path="/study/*" element={<Dashboard />} />
              <Route path="/login/*" element={<Signup />} />
              <Route path="/profile/*" element={<Dashboard />} />
              <Route path="/success/*" element={<SuccessScreen />} />
              <Route path="/failure/*" element={<FailureScreen />} />
              {/* <Route path="/verify/*" element={<VerificationPage />} /> */}
            </Routes>
          </div>
        </Elements>
      </InsightsProvider>
    </StudyProvider>
  );
}

export default App;
