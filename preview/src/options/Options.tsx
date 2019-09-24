import React, { useContext } from 'react';
import './Options.css';
import { Input } from '@betty-blocks/design-system';
import { PrefabContextProps } from '../types';
import { PrefabContext } from '../prefab/Prefab';

function Options(): JSX.Element {
  const { options, setOptions } = useContext<PrefabContextProps>(PrefabContext);

  function handleOptionChange(value: string, id: string, index: number): void {
    const componentOptions = options[id];

    setOptions({
      ...options,
      [id]: [
        ...componentOptions.slice(0, index),
        {
          ...componentOptions[index],
          value,
        },
        ...componentOptions.slice(index + 1),
      ],
    });
  }

  return (
    <section>
      <h1 className="options__title">Options</h1>
      <div className="option">
        {Object.keys(options).map((id, mapIndex) => (
          <section key={id}>
            <h1 className="option__title">{mapIndex}</h1>
            {options[id].map(({ id: optionId, label, value }, optionIndex) => (
              <div key={optionId} className="option__wrapper">
                <Input
                  full
                  label={label}
                  value={value}
                  onChange={({
                    target: { value: valueNew },
                  }: {
                    target: { value: string };
                  }): void => handleOptionChange(valueNew, id, optionIndex)}
                />
              </div>
            ))}
          </section>
        ))}
      </div>
    </section>
  );
}

export default Options;
