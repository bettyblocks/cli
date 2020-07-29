import join from 'lodash/join'

async function sayHello() {
  const name = await context('name')

  if (name == 'oops') {
    throw 'Ooops. Something went wrong.'
  } else {
    return _.join(['Hello', name], ',')
  }
}

export {
  sayHello
}
