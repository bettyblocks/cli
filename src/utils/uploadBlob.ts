import chalk from 'chalk';

import {
  Aborter,
  BlobURL,
  BlockBlobURL,
  ContainerURL,
  ServiceURL,
  SharedKeyCredential,
  StorageURL,
  Pipeline,
  RestError,
} from '@azure/storage-blob';

import {
  ServiceSetPropertiesResponse,
  BlockBlobUploadResponse,
} from '@azure/storage-blob/src/generated/src/models';

const { AZURE_BLOB_ACCOUNT, AZURE_BLOB_ACCOUNT_KEY } = process.env;

export interface BlockBlobUploadResponseExtended
  extends BlockBlobUploadResponse {
  url: string;
}

const getServiceUrl = (): ServiceURL => {
  const sharedKeyCredential: SharedKeyCredential = new SharedKeyCredential(
    AZURE_BLOB_ACCOUNT as string,
    AZURE_BLOB_ACCOUNT_KEY as string,
  );

  const pipeline: Pipeline = StorageURL.newPipeline(sharedKeyCredential);

  const url = `https://${AZURE_BLOB_ACCOUNT as string}.blob.core.windows.net`;

  return new ServiceURL(url, pipeline);
};

const setCorsRules = (
  serviceURL: ServiceURL,
): Promise<ServiceSetPropertiesResponse> =>
  serviceURL.setProperties(Aborter.none, {
    cors: [
      {
        allowedOrigins: '*',
        allowedHeaders: '*',
        allowedMethods: 'GET',
        exposedHeaders: '*',
        maxAgeInSeconds: 86400,
      },
    ],
  });

const getContainerURL = (
  serviceURL: ServiceURL,
  blobContainerName: string,
): ContainerURL => ContainerURL.fromServiceURL(serviceURL, blobContainerName);

const getBlockURL = async (
  url: ContainerURL,
  name: string,
): Promise<BlockBlobURL> => {
  // Ensure there is a container, ignore 'ContainerAlreadyExists' errors on purpose
  try {
    await url.create(Aborter.none, { access: 'blob' });
  } catch (error) {
    const { statusCode }: RestError = error;

    if (statusCode !== 409) {
      throw chalk.red(error);
    }
  }

  const blobURL: BlobURL = BlobURL.fromContainerURL(url, name);

  return BlockBlobURL.fromBlobURL(blobURL);
};

const upload = (
  url: BlockBlobURL,
  content: string,
): Promise<BlockBlobUploadResponse> =>
  url.upload(Aborter.none, content, content.length, {
    blobHTTPHeaders: {
      blobCacheControl: 'private, max-age=0, no-transform',
      blobContentType: 'text/html',
    },
  });

export default async (
  blobContainerName: string,
  blobName: string,
  blobContent: string,
): Promise<BlockBlobUploadResponseExtended> => {
  const serviceURL = getServiceUrl();
  await setCorsRules(serviceURL);
  const containerURL = getContainerURL(serviceURL, blobContainerName);
  const blockURL = await getBlockURL(containerURL, blobName);
  const uploadResponse = await upload(blockURL, blobContent);

  return { ...uploadResponse, url: containerURL.url };
};
