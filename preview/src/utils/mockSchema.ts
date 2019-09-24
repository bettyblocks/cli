import {
  makeExecutableSchema,
  addMockFunctionsToSchema,
  MockList,
} from 'graphql-tools';

import faker from 'faker';
import { GraphQLSchema } from 'graphql';

interface TodoMock {
  text: () => string;
  completed: () => boolean;
}

interface UserMock {
  name: () => string;
  lastName: () => string;
}

interface QueryResultMock {
  results: MockList[];
  totalCount: string;
}

export default (records = '10'): GraphQLSchema => {
  const schemaString = `
  type Query {
    users: Users
    todos: Todos
  }

  type Todos { results: [Todo], totalCount: Int }
  type Users { results: [User], totalCount: Int }

  type Todo { id: ID, text: String, completed: Boolean }
  type User { id: ID, name: String, lastName: String }

`;

  const schema = makeExecutableSchema({ typeDefs: schemaString });

  const mockListFactory = (digits: string): MockList[] =>
    Array.from(Array(parseInt(digits, 10)).keys()).map(
      (number: number): MockList => new MockList(number),
    );

  const mocks = {
    Query: (): {
      todos: () => QueryResultMock;
      users: () => QueryResultMock;
    } => ({
      todos: (): QueryResultMock => ({
        results: mockListFactory(records),
        totalCount: records,
      }),
      users: (): QueryResultMock => ({
        results: mockListFactory(records),
        totalCount: records,
      }),
    }),
    Todo: (): TodoMock => ({
      completed: (): boolean => faker.random.boolean(),
      text: (): string => faker.lorem.sentence(),
    }),
    User: (): UserMock => ({
      lastName: (): string => faker.name.lastName(),
      name: (): string => faker.name.findName(),
    }),
  };

  addMockFunctionsToSchema({ mocks, schema });

  return schema;
};
