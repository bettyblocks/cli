import join from 'lodash/join';

async function sayHello(ctx, { name }) {
  if (name === 'oops') {
    throw 'Ooops. Something went wrong.';
  } else {
    return {
      greet: join(['Hello', name], ',')
    };
  }
}

export default sayHello;
