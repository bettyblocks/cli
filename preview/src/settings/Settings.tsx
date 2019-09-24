import React from 'react';
import { withRouter } from 'react-router';
import { parse } from 'query-string';
import { History, Location } from 'history';
import { Dropdown, Options, Option } from '@betty-blocks/design-system';
import updateSearch from '../utils/updateSearch';
import './Settings.css';

interface SettingsProps {
  history: History;
  location: Location;
}

function Settings({
  history,
  location: { pathname, search },
}: SettingsProps): JSX.Element {
  const searchParsed = parse(search);
  const { env, state } = searchParsed;

  function handleStateChange({
    target: { value },
  }: {
    target: { value: string };
  }): void {
    history.push({
      pathname,
      search: updateSearch(searchParsed, 'state', value),
    });
  }

  function handleEnvChange({
    target: { value },
  }: {
    target: { value: string };
  }): void {
    history.push({
      pathname,
      search: updateSearch(searchParsed, 'env', value),
    });
  }

  const options = ['success', 'loading', 'error'];

  return (
    <section>
      <h1 className="settings__title">Settings</h1>
      <ul className="settings">
        <li className="setting">
          <Dropdown
            label="Data state"
            value={
              typeof state === 'string' && options.includes(state)
                ? state
                : options[0]
            }
            options={options}
            onChange={handleStateChange}
            full
          />
        </li>
        <li className="setting">
          <Options label="Environment">
            <Option
              name="env"
              value="dev"
              onChange={handleEnvChange}
              defaultChecked={!env || env === 'dev'}
            >
              Development
            </Option>
            <Option
              name="env"
              value="prod"
              onChange={handleEnvChange}
              defaultChecked={env === 'prod'}
            >
              Production
            </Option>
          </Options>
        </li>
      </ul>
    </section>
  );
}

export default withRouter(Settings);
