async function allUsers() {
  const { results } = await gql(`{
    allUser {
      results {
        id
        email
      }
    }
  }`);

  return results;
}

export { allUsers };
