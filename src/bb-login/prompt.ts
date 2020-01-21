import { prompt } from 'inquirer';

export interface Answers {
  email: string;
  password: string;
}

const VALIDATE_EMAIL_PATTERN = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

export default (): Promise<Answers> =>
  prompt([
    {
      name: 'email',
      message: 'Email',
      validate: (emailValue: string): true | string =>
        VALIDATE_EMAIL_PATTERN.test(emailValue) ||
        'You are trying to log in with an invalid e-mail address.',
    },
    {
      name: 'password',
      message: 'Password',
      type: 'password',
    },
  ]);
