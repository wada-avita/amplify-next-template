'use client';

import type { AppProps } from 'next/app';
import { Authenticator } from '@aws-amplify/ui-react';
import { Amplify } from 'aws-amplify';
import outputs from '@/amplify_outputs.json';
import '@aws-amplify/ui-react/styles.css';
import { useCallback, useEffect, useState } from 'react';
import { fetchAuthSession } from 'aws-amplify/auth';
import { InvokeCommand, LambdaClient } from '@aws-sdk/client-lambda';

Amplify.configure(outputs);

export default function App() {
  const [status, setStatus] = useState('');

  const sendRequest = useCallback(async () => {
    const { credentials } = await fetchAuthSession();
    console.log(JSON.stringify(credentials));
    const lambda = new LambdaClient({
      credentials,
      region: 'ap-northeast-1'
    });
    try {
      const res = await lambda.send(new InvokeCommand({
        FunctionName: 'fetch-status'
      }));
      if (res?.Payload) {
        setStatus(Buffer.from(res.Payload).toString());
      }
    } catch (error) {
      console.error(error);
      setStatus('Error');
    }
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
