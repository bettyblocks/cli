import chalk from 'chalk';

import uploadBlob, {
  type BlockBlobUploadResponseExtended,
} from '../utils/uploadBlob';

interface UploadProps {
  blobContentType: string;
  bucketName: string;
  fileName: string;
  objects: string;
}

const upload = async ({
  blobContentType,
  bucketName,
  fileName,
  objects,
}: UploadProps): Promise<BlockBlobUploadResponseExtended> => {
  try {
    return await uploadBlob({
      blobContainerName: bucketName,
      blobContent: objects,
      blobContentType,
      blobName: fileName,
    });
  } catch (error) {
    const defaultMessage =
      'There was an error trying to publish your component set';

    const errorObject = error as {
      body?: { code?: string; message?: string };
      message?: string;
    };
    const { body, message } = errorObject;

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

export const publish = async ({
  blobContentType,
  bucketName,
  fileName,
  objects,
}: UploadProps): Promise<BlockBlobUploadResponseExtended> => {
  console.log(`Publishing ${fileName}.`);

  return upload({
    blobContentType,
    bucketName,
    fileName,
    objects,
  });
};

export const validateBucketName = (name: string): void => {
  if (!name || typeof name !== 'string' || !name.length) {
    throw new Error(chalk.red('\n-b or --bucket [name] is required\n'));
  }
};
