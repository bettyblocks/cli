import chalk from 'chalk';

import uploadBlob, {
  type BlockBlobUploadResponseExtended,
} from '../utils/uploadBlob';

export const upload = async (
  objects: string,
  fileName: string,
  bucketName: string,
  blobContentType: string,
): Promise<BlockBlobUploadResponseExtended> => {
  try {
    return await uploadBlob(bucketName, fileName, objects, blobContentType);
  } catch (error) {
    const defaultMessage =
      'There was an error trying to publish your component set';
    const { body, message } = error;

    if (!body) {
      throw new Error(chalk.red([defaultMessage, message].join('\n')));
    }

    const { code, message: bodyMessage } = body;

    const extraMessage =
      code === 'AuthenticationFailed'
        ? 'Make sure your azure blob account and key are correct'
        : bodyMessage;

    throw new Error(chalk.red([defaultMessage, extraMessage].join('\n')));
  }
};

export const publish = async (
  fileName: string,
  bucketName: string,
  objects: string,
  blobContentType: string,
): Promise<BlockBlobUploadResponseExtended> => {
  console.log(`Publishing ${fileName}.`);

  return upload(objects, fileName, bucketName, blobContentType);
};

export const validateBucketName = (name: string) => {
  if (!name || typeof name !== 'string' || !name.length) {
    throw new Error(chalk.red('\n-b or --bucket [name] is required\n'));
  }
};
