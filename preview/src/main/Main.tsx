import * as R from 'ramda';
import { Location } from 'history';
import React, { useState, useEffect, FC } from 'react';
import { createTheming } from 'react-jss';
import { match as Match } from 'react-router';
import { parse } from 'query-string';
import uuid from 'uuid';

import { OptionsMap, PrefabRaw, ComponentConfiguration } from '../types';
import Prefab, { PrefabContext } from '../prefab/Prefab';
import './Main.css';
import theme from '../theme';
import Header from '../header/Header';
import Options from '../options/Options';
import Settings from '../settings/Settings';

const { REACT_APP_COMPONENT_SET_URL: uri } = process.env;
const { ThemeProvider } = createTheming('__APP_THEME__');

// FIXME: `as unknown` should be avoided
const ComponentSetThemeProvider = (ThemeProvider as unknown) as FC<{
  theme: object;
}>;

function getOptions(configurations: (ComponentConfiguration)[]): OptionsMap {
  return configurations.reduce(
    (
      acc: OptionsMap,
      { descendants, id, options }: ComponentConfiguration,
    ) => ({
      ...acc,
      [id as string]: options,
      ...getOptions(descendants),
    }),
    {} as OptionsMap,
  );
}

function generateComponentIds(
  configurations: ComponentConfiguration[],
): ComponentConfiguration[] {
  return configurations.reduce(
    (
      acc: ComponentConfiguration[],
      { descendants, ...component }: ComponentConfiguration,
    ) => [
      ...acc,
      {
        ...component,
        descendants: generateComponentIds(descendants),
        id: uuid(),
      },
    ],
    [] as ComponentConfiguration[],
  );
}

function Main({
  match,
  location: { search },
}: {
  location: Location;
  match: Match;
}): JSX.Element {
  const [prefabs, setPrefabs] = useState([] as PrefabRaw[]);
  const [selectedPrefab, setSelectedPrefab] = useState();
  const [options, setOptions] = useState({});
  const [prodMode, setProdMode] = useState(false);
  const [fetchError, setFetchError] = useState();
  const [stateMode, setStateMode] = useState('success');
  const [errorMessage, setErrorMessage] = useState();
  const [records, setRecords] = useState();
  const { env, error, state, searchRecords } = parse(search);

  useEffect(() => {
    fetch(`${uri}/prefabs.json`, { cache: 'no-cache' })
      .then(response => response.json())
      .then(data => setPrefabs(data))
      .catch(({ message }) => setFetchError(message));
  }, []);

  useEffect(() => {
    const prefab = prefabs.find(
      ({ name }) => name === R.path(['params', 'prefabName'], match),
    ) as PrefabRaw;

    const structure = generateComponentIds(R.pathOr([], ['structure'], prefab));

    const updatedPrefab = {
      ...prefab,
      structure,
    };

    setSelectedPrefab(updatedPrefab);

    R.pipe(
      getOptions,
      setOptions,
    )(structure);
  }, [match, prefabs]);

  useEffect(() => {
    setProdMode(env === 'prod');
    setStateMode(state as string);
    setErrorMessage(error);
    setRecords(searchRecords);
  }, [env, error, searchRecords, state]);

  return (
    <div className="siteWrapper">
      <PrefabContext.Provider
        value={{
          errorMessage,
          options,
          prefabs,
          prodMode,
          records,
          selectedPrefab,
          setOptions,
          setProdMode,
          setSelectedPrefab,
          stateMode,
        }}
      >
        <Header />
        <main className="content">
          <aside className="sidebar">
            <Settings />
            <Options />
          </aside>
          <section className="canvas">
            <ComponentSetThemeProvider theme={theme}>
              <div className="prefabContainer">
                {fetchError ? (
                  <>
                    <p>
                      {/* eslint-disable-next-line no-console */}
                      {console.log(fetchError)}
                      The following error occured: <code>{fetchError}</code>.
                    </p>
                    <p>
                      Did you supply a component set url in the environment
                      variables?
                    </p>
                  </>
                ) : (
                  <Prefab />
                )}
              </div>
            </ComponentSetThemeProvider>
          </section>
        </main>
      </PrefabContext.Provider>
    </div>
  );
}

export default Main;
