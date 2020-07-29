async function allUsers() {
  const { results } = await gql(`{
    allUser {
      results {
        id
        email
      }
    }
  }`)

  return result
}

export {
  allUsers
}
