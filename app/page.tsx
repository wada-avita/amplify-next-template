'use client';

import type { AppProps } from 'next/app';
import { Authenticator } from '@aws-amplify/ui-react';
import { Amplify } from 'aws-amplify';
import outputs from '@/amplify_outputs.json';
import '@aws-amplify/ui-react/styles.css';
import { useCallback, useState } from 'react';
import { fetchAuthSession } from 'aws-amplify/auth';
import { Lambda } from 'aws-sdk';

Amplify.configure(outputs);

export default function App() {
  const [status, setStatus] = useState('');

  const sendRequest = useCallback(async () => {
    const { credentials } = await fetchAuthSession();
    console.log(JSON.stringify(credentials));
    const lambda = new Lambda({
      credentials,
      region: 'ap-northeast-1'
    });
    lambda.invoke({
      FunctionName: 'fetch-status'
    }, function (err, data) {
      if (err) {
        console.error(err);
        setStatus('Error');
        return;
      }
      setStatus(data.Payload as string);
    });
  }, []);

  const onClick = useCallback(() => {
    sendRequest()
      .catch((error) => {
        console.error(error);
      });
  }, [sendRequest]);

  return (
    <Authenticator hideSignUp>
      {({ signOut, user }) => (
        <main>
          <h1>Hello {user?.username}</h1>
          <button onClick={signOut}>Sign out</button>
          <div>
            <button onClick={onClick}>fetch status</button>
            <p>{status}</p>
          </div>
        </main>
      )}
    </Authenticator>
  );
};
