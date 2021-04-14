import join from 'lodash/join';

export const sayHello = async (ctx, { name }) => {
  if (name === 'oops') {
    throw 'Ooops. Something went wrong.';
  } else {
    return {
      greet: join(['Hello', name], ',')
    };
  }
}
