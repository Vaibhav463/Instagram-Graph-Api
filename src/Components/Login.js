// import React, { useCallback } from 'react';
// import '../Style/Login.css';

// const Login = React.memo(({ onLoginSuccess }) => {
//   const handleLogin = useCallback(() => {
//     window.FB.init({
//       appId: '687403303286081',
//       cookie: true,
//       xfbml: true,
//       version: 'v17.0',
//     });

//     window.FB.login(
//       function(response) {
//         if (response.status === 'connected') {
//           // console.log(response);
//           onLoginSuccess(response.authResponse.accessToken);
//         } else {
//           console.log('Login failed');
//         }
//       },
//       {
//         config_id: '996363428171069',
//         response_type: 'code',
//       }
//     );
//   }, [onLoginSuccess]);

//   return (
//     <div className='container facebookdiv'>
//       <button onClick={handleLogin}>Login with Facebook</button>
//     </div>
//   );
// });

// export default React.memo(Login); 


import React, { useCallback } from 'react';
import '../Style/Login.css';

const Login = React.memo(({ onLoginSuccess }) => {
  const handleLogin = useCallback(() => {
    window.FB.init({
      appId: '687403303286081',
      cookie: true,
      xfbml: true,
      version: 'v17.0',
    });

    window.FB.login(
      function(response) {
        if (response.status === 'connected') {
          // console.log(response);
          onLoginSuccess(response.authResponse.accessToken);
        } else {
          console.log('Login failed');
        }
      },
      {
        config_id: '996363428171069',
        response_type: 'code',
      }
    );
  }, [onLoginSuccess]);

  return (
    <div className='container facebookdiv'>
      <button onClick={handleLogin}>Login with Facebook</button>
    </div>
  );
});

export default React.memo(Login); 