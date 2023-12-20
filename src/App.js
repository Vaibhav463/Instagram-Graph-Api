import React, { useState, useCallback } from 'react';
import DynamicComponent from '../src/Components/DynamicComponent';
import Login from './Components/Login';
import YouTubeChannelVideos from './Components/YouTubeChannelVideos ';
import FirstAccount from './Components/FirstAccount';
const App = React.memo(() => {
  const [accessToken, setAccessToken] = useState(null);

  const handleLoginSuccess = useCallback((token) => {
    setAccessToken(token);
  }, []);

  return (
    <div>
      <FirstAccount/>
      {accessToken ? (
        <DynamicComponent accessToken={accessToken} />
      ) : (
        <Login onLoginSuccess={handleLoginSuccess} />
      )}
      <YouTubeChannelVideos/>
    </div>
  );
});

export default React.memo(App); 