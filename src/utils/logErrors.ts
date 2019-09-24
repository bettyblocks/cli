import { RestError } from '@azure/ms-rest-js';

export const logIOError = (error: NodeJS.ErrnoException): void => {
  console.error('There was an error trying to publish your component set');
  if (error.code === 'ENOENT') {
    console.error(error.message);

    return;
  }

  console.error(error);
};

export const logUploadError = (error: RestError): void => {
  console.error('There was an error trying to publish your component set');

  if (!error.body) {
    console.error(error.message);

    return;
  }

  switch (error.body.code) {
    case 'AuthenticationFailed':
      console.error(
        `Code: ${
          error.body.code
        }\nMessage: Make sure your azure blob account and key are correct`,
      );
      break;
    default:
      console.error(`Code: ${error.body.code}\nMessage: ${error.body.message}`);
      break;
  }
};
