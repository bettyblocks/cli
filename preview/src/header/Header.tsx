import React, { useContext } from 'react';
import { match, withRouter } from 'react-router';
import { History, Location } from 'history';
import { Dropdown } from '@betty-blocks/design-system';

import './Header.css';
import { PrefabContext } from '../prefab/Prefab';

function Header({
  history: { push },
  match: {
    params: { prefabName },
  },
  location: { search },
}: {
  history: History;
  location: Location;
  match: match<{ prefabName: string }>;
}): JSX.Element {
  const { prefabs } = useContext(PrefabContext);
  const options = ['Choose prefab...', ...prefabs.map(({ name }) => name)];

  function handleComponentSwitch(value: string): void {
    push({
      pathname: value === 'Choose prefab...' ? '/' : value,
      search,
    });
  }

  return (
    <header>
      <div className="topBar" />
      <div className="header">
        <h1 className="title">Preview</h1>
        <Dropdown
          value={options.includes(prefabName) ? prefabName : options[0]}
          options={options}
          onChange={({
            target: { value },
          }: {
            target: { value: string };
          }): void => {
            handleComponentSwitch(value);
          }}
        />
      </div>
    </header>
  );
}

export default withRouter(Header);
