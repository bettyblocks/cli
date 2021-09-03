import test, { ExecutionContext } from 'ava';
import { doTranspile } from '../../src/components/transformers';
import { stripHandlers } from '../../src/components/transformers/stripHandlers';

const code = 'const test = <div onClick={e => console.log(e)}></div>';

test('it should transpile code', (t: ExecutionContext<unknown>) => {
  const transpiled = doTranspile(code);

  const expected = `var test = React.createElement("div", { onClick: function (e) { return console.log(e); } });
`;
  t.is(expected, transpiled);
});

test('it should transpile code and strip handlers', (t: ExecutionContext<
  unknown
>) => {
  const transpiled = doTranspile(code, [stripHandlers]);

  const expected = `var test = React.createElement("div", null);
`;

  t.is(expected, transpiled);
});
