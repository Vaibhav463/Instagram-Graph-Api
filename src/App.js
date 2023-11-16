import React, { useState, useCallback } from 'react';
import DynamicComponent from '../src/Components/DynamicComponent';
import Login from './Components/Login';

const App = React.memo(() => {
  const [accessToken, setAccessToken] = useState(null);

  const handleLoginSuccess = useCallback((token) => {
    setAccessToken(token);
  }, []);

  return (
    <div>
      {accessToken ? (
        <DynamicComponent accessToken={accessToken} />
      ) : (
        <Login onLoginSuccess={handleLoginSuccess} />
      )}
    </div>
  );
});

export default React.memo(App); 