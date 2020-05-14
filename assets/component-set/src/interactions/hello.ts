const hello = (event: Event, name: string): string => {
  return `Hello ${name || 'World'}!`;
};
