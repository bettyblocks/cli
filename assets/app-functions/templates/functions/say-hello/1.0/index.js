import join from 'lodash/join';

const sayHello = async ({ name }) => {
  if (name === 'oops') {
    throw new Error('Ooops. Something went wrong.');
  } else {
    return {
      greet: join(['Hello', name], ', ')
    };
  }
};

export default sayHello;