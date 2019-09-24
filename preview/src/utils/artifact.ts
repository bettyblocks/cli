export default {
  models: {
    a0e120d71a5f47b48607dd1cb45f3668: `{
      users {
        results {
          id, name, lastName
        },
        totalCount
      }
    }`,
    f3e82fe360ca4b7ba7b6491e5b8df78f: `{
      todos {
       results {
         id, text, completed
       },
       totalCount
      }
    }`,
  },
  properties: {
    d82e1bcccf1f11e9bb652a2ae2dbcce4: {
      kind: 'string',
      modelId: 'f3e82fe360ca4b7ba7b6491e5b8df78f',
      name: 'text',
    },
    d82e1d20cf1f11e9bb652a2ae2dbcce4: {
      kind: 'string',
      modelId: 'f3e82fe360ca4b7ba7b6491e5b8df78f',
      name: 'completed',
    },
    d82e1e56cf1f11e9bb652a2ae2dbcce4: {
      kind: 'id',
      modelId: 'f3e82fe360ca4b7ba7b6491e5b8df78f',
      name: 'id',
    },
    d82e12f8cf1f11e9bb652a2ae2dbcce4: {
      kind: 'id',
      modelId: 'a0e120d71a5f47b48607dd1cb45f3668',
      name: 'id',
    },
    d82e18e8cf1f11e9bb652a2ae2dbcce4: {
      kind: 'string',
      modelId: 'a0e120d71a5f47b48607dd1cb45f3668',
      name: 'lastName',
    },
    d82e156ecf1f11e9bb652a2ae2dbcce4: {
      kind: 'string',
      modelId: 'a0e120d71a5f47b48607dd1cb45f3668',
      name: 'name',
    },
  },
};
