// import { useState } from 'react';
// import { useAuth0 } from '@auth0/auth0-react';

// type Error = {
//   message: string;
// };

// export function useAuth0() {
//   const { user: auth0User, getIdTokenClaims } = useAuth0();

//   const [isLoading, setIsLoading] = useState<boolean>(false);
//   const [error, setError] = useState<Error | null>(null);

//   async function computeInsights(message: string) {
//     setIsLoading(true);
//     try {
//       const response = await fetch(
//         'https://qzvyzskiiaxfqohw7a2lcocwtm0txudh.lambda-url.eu-west-2.on.aws/',
//         {
//           method: 'POST',
//           headers: {
//             'Content-Type': 'application/json',
//           },
//           body: JSON.stringify({ transcript: message }),
//         }
//       );
//       const data = await response.json();
//       if (response.ok) {
//         setIsLoading(false);
//         setInsight(data);
//         return data;
//       }
//     } catch (error: Error | any) {
//       setIsLoading(false);
//       setError(error);
//       throw new Error(`Failed to generate insights: ${error.message}`);
//     }
//   }

//   return {
//     isLoading,
//     error,
//     computeInsights,
//     insight,
//   };
// }
