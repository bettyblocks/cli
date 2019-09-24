import { ApolloLink, Observable, FetchResult } from 'apollo-link';
import React, { FC } from 'react';
import { ApolloClient } from 'apollo-client';
import { ApolloProvider } from 'react-apollo';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { SchemaLink } from 'apollo-link-schema';
import { GraphQLError } from 'graphql';
import mockSchema from './mockSchema';

interface SuccessProviderProps {
  children?: JSX.Element | JSX.Element[];
  records: string;
}

interface LoadingProviderProps {
  children?: JSX.Element | JSX.Element[];
}

interface ErrorProviderProps {
  children?: JSX.Element | JSX.Element[];
  message: string;
}

interface MockedProviderProps {
  children?: JSX.Element | JSX.Element[];
  errorMessage: string;
  records: string;
  state: 'error' | 'loading' | unknown;
}

const SuccessProvider: FC<SuccessProviderProps> = ({
  children,
  records,
}: SuccessProviderProps): JSX.Element => {
  const schema = mockSchema(records);

  const client = new ApolloClient({
    cache: new InMemoryCache({ addTypename: false }),
    link: new SchemaLink({ schema }),
  });

  return <ApolloProvider client={client}>{children}</ApolloProvider>;
};

const LoadingProvider: FC<LoadingProviderProps> = ({
  children,
}: LoadingProviderProps): JSX.Element => {
  const link = new ApolloLink(
    (): Observable<{}> => new Observable((): void => {}),
  );

  const client = new ApolloClient({
    cache: new InMemoryCache({ addTypename: false }),
    link,
  });

  return <ApolloProvider client={client}>{children}</ApolloProvider>;
};

const ErrorProvider: FC<ErrorProviderProps> = ({
  children,
  message,
}: ErrorProviderProps): JSX.Element => {
  const link = new ApolloLink(
    (): Observable<FetchResult> => {
      return new Observable((observer): void => {
        observer.next({
          errors: [
            {
              message:
                message ||
                'Unspecified error. Use the query input "error" to display a custom message.',
            } as GraphQLError,
          ],
        });

        observer.complete();
      });
    },
  );

  const client = new ApolloClient({
    cache: new InMemoryCache({ addTypename: false }),
    link,
  });

  return <ApolloProvider client={client}>{children}</ApolloProvider>;
};

export default ({
  children,
  state,
  errorMessage,
  records,
}: MockedProviderProps): JSX.Element => {
  if (state === 'loading') {
    return <LoadingProvider>{children}</LoadingProvider>;
  }

  if (state === 'error') {
    return <ErrorProvider message={errorMessage}>{children}</ErrorProvider>;
  }

  return <SuccessProvider records={records}>{children}</SuccessProvider>;
};
