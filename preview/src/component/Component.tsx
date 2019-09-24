import React, { useContext } from 'react';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';
import makeComponent from '@betty-blocks/component-generator';
import { makeBuilder, makeRuntime } from '@betty-blocks/component-helpers';
import ErrorBoundary from './ErrorBoundary';
import { ComponentContext, EnvContext, PrefabContext } from '../prefab/Prefab';
import artifact from '../utils/artifact';
import MockedProvider from '../utils/mockedProvider';

import {
  OptionRaw,
  PrefabContextProps,
  ComponentRaw,
  ComponentConfiguration,
} from '../types';

interface LinkProps {
  children?: JSX.Element | JSX.Element[];
}

function Link({
  children,
}: LinkProps): JSX.Element | JSX.Element[] | undefined {
  return children;
}

const optionsToKV = (options: OptionRaw[]): { [key: string]: string } =>
  options.reduce(
    (acc, { key, value }: OptionRaw) => ({
      ...acc,
      [key]: value,
    }),
    {},
  );

function Component({
  id,
  name,
  descendants,
}: {
  descendants: ComponentConfiguration[];
  id: string;
  name: string;
}): JSX.Element {
  const { components } = useContext(ComponentContext);

  const { jsx, styles } = (components as ComponentRaw[]).find(
    ({ name: componentName }: ComponentRaw): boolean => componentName === name,
  ) as ComponentRaw;

  const { options, stateMode, errorMessage, records } = useContext<
    PrefabContextProps
  >(PrefabContext);

  const { env } = useContext(EnvContext);

  const [error, ReactComponent] = makeComponent({
    global:
      env === 'prod'
        ? makeRuntime(artifact, { gql, Link, Query })
        : makeBuilder({ screenOffset: 320 }, { Link }),
    jsx,
    styles,
  });

  if (error) {
    // eslint-disable-next-line no-console
    console.log(error);

    return (
      <p style={{ textAlign: 'center' }}>
        An error occured in your component, check the browser console for the
        message and stack trace.
      </p>
    );
  }

  return (
    <ErrorBoundary>
      <MockedProvider
        state={stateMode}
        errorMessage={errorMessage as string}
        records={records as string}
      >
        <ReactComponent options={optionsToKV(options[id])}>
          {descendants.map(
            ({
              descendants: grandChildren,
              id: componentId,
              name: childName,
            }: ComponentConfiguration) => (
              <Component
                key={componentId}
                id={componentId as string}
                name={childName}
                descendants={grandChildren}
              />
            ),
          )}
        </ReactComponent>
      </MockedProvider>
    </ErrorBoundary>
  );
}

export default Component;
