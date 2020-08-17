function hello({ name }: { name: string }): string {
  return `Hello ${name || 'World'}!`;
}
