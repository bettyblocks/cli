import { prompt } from 'inquirer';

const QUESTION_NAME_PREFIX =
  'The name of your component set should start with @, followed by your organization id, /, and the name of your set.';

const QUESTION_NAME_VALIDATION =
  'Make sure the name starts with @, followed by your organization id, /, and the name of your set. For example: @betty-blocks/layout';

const QUESTION_PUBLIC_CONFIRM =
  'Are you ABSOLUTELY SURE that your component set should be public? Once published as such, it cannot be unpublished.';

const QUESTION_PUBLIC_MESSAGE = 'Is this component set public?';
const VALID_NAME_PATTERN = /[a-z0-8-_]+\/[a-z0-9-_]/;

export interface Answers {
  name: string;
  isPublic: boolean;
  isPublicConfirmed: boolean;
}

export default (): Promise<Answers> =>
  prompt([
    {
      name: 'name',
      message: 'Name',
      prefix: QUESTION_NAME_PREFIX,
      validate: (nameValue: string): true | string =>
        VALID_NAME_PATTERN.test(nameValue) || QUESTION_NAME_VALIDATION,
    },
    {
      default: false,
      message: QUESTION_PUBLIC_MESSAGE,
      name: 'isPublic',
      type: 'confirm',
    },
    {
      default: false,
      name: 'isPublicConfirmed',
      message: QUESTION_PUBLIC_CONFIRM,
      type: 'confirm',
      when: ({ isPublic: isPublicValue }): boolean => isPublicValue,
    },
  ]);
