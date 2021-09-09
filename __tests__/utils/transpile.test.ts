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

test('it should not inject a click triggerEvent', (t: ExecutionContext<
  unknown
>) => {
  const codeWithTriggerEvent = `const test = () => {
    const clickHandler = e => {
        B.triggerEvent('Click', e);
    }

    return <div onClick={clickHandler}></div>
}`;

  const transpiled = doTranspile(codeWithTriggerEvent);

  const expected = `var test = function () {
    var clickHandler = function (e) {
        B.triggerEvent('Click', e);
    };
    return React.createElement("div", { onClick: clickHandler });
};
`;

  t.is(expected, transpiled);
});

test.skip('it should inject a click triggerEvent', (t: ExecutionContext<
  unknown
>) => {
  const codeWithoutTriggerEvent = `const test = () => {
    return <div></div>;
};`;

  const transpiled = doTranspile(codeWithoutTriggerEvent);

  const expected = `var test = function () {
    return React.createElement("div", { onClick: function (e) { B.triggerEvent('Click', e) } });
};
`;

  t.is(expected, transpiled);
});
