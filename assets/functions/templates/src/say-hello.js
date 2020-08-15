import join from 'lodash/join';

async function sayHello() {
  const name = await context('name');

  if (name === 'oops') {
    throw 'Ooops. Something went wrong.';
  } else {
    return join(['Hello', name], ',');
  }
}

export { sayHello };
