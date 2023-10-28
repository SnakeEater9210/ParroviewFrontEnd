import { useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';

const Signup = () => {
  const { loginWithRedirect, isAuthenticated } = useAuth0();

  useEffect(() => {
    if (!isAuthenticated) {
      loginWithRedirect();
    }
  }, [loginWithRedirect, isAuthenticated]);

  // ... rest of your component
  return null; // Redirect happens before anything gets rendered
};

export default Signup;
