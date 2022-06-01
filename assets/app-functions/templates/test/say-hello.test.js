test('sayHello 1.0', async () => {
  const output = await $app['sayHello 1.0']({ name: 'Bruce' });
  assert(output, { greet: 'Hello, Bruce' });
});
