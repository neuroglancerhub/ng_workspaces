import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

const accessUrl = 'https://storage.cloud.google.com/smalltest_barry/neuroglancer/jpeg/info?authuser=1';
const testUrl = 'https://www.googleapis.com/download/storage/v1/b/smalltest_barry/o/neuroglancer%2Fjpeg%2Finfo?generation=1587926116746057&alt=media';

export default function AuthTest() {
  const [info, setInfo] = useState();
  const user = useSelector((state) => state.user.get('user'));

  useEffect(() => {
    if (user) {
      fetch(testUrl, {
        headers: {
          Authorization: `Bearer ${user.getAuthResponse().access_token}`,
        },
      })
        .then((response) => {
          console.log(response);
          return response.json();
        })
        .then((json) => setInfo(json));
    }
  }, [user]);

  return (
    <div>
      <p>
        If Auth is working you should see the contents of:
        <br />
        {testUrl}
      </p>
      <code>{JSON.stringify(info)}</code>
      <p>If Auth is working, clicking on this link should show some JSON</p>
      <a href={accessUrl}>{accessUrl}</a>
    </div>
  );
}
