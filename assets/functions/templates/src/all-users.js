async function allUsers() {
  const { allUser } = await gql(`{
    allUser {
      results {
        id
        email
      }
    }
  }`);

  return allUser.results;
}

export default allUsers;
