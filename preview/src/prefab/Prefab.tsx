import React, { useEffect, useState, useContext, createContext } from 'react';

import {
  ComponentConfiguration,
  ComponentContextProps,
  PrefabContextProps,
} from '../types';

import Component from '../component/Component';

const { REACT_APP_COMPONENT_SET_URL: uri } = process.env;

export const PrefabContext = createContext<PrefabContextProps>({
  options: {},
  prefabs: [],
  prodMode: false,
  selectedPrefab: {
    category: '',
    icon: '',
    structure: [],
  },
  setOptions: () => undefined,
});

export const EnvContext = createContext({
  env: 'dev',
});

export const ComponentContext = createContext<ComponentContextProps>({});

function Prefab(): JSX.Element | null {
  const [components, setComponents] = useState([]);

  const { selectedPrefab: prefab, prodMode } = useContext<PrefabContextProps>(
    PrefabContext,
  );

  const env = prodMode ? 'prod' : 'dev';

  useEffect(() => {
    fetch(`${uri}/templates.json`, { cache: 'no-cache' })
      .then(response => response.json())
      .then(data => setComponents(data))
      // eslint-disable-next-line no-console
      .catch(error => console.log(error));
  }, []);

  if (components.length === 0 || !prefab) {
    return null;
  }

  return (
    <EnvContext.Provider value={{ env }}>
      <ComponentContext.Provider value={{ components }}>
        {prefab.structure.map(
          ({ descendants, id, name }: ComponentConfiguration): JSX.Element => (
            <Component
              key={id}
              id={id as string}
              name={name}
              descendants={descendants}
            />
          ),
        )}
      </ComponentContext.Provider>
    </EnvContext.Provider>
  );
}

export default Prefab;
