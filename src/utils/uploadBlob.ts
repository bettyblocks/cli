import {
  Aborter,
  BlobURL,
  BlockBlobURL,
  ContainerURL,
  ServiceURL,
  SharedKeyCredential,
  StorageURL,
} from '@azure/storage-blob';

import {
  ServiceSetPropertiesResponse,
  BlockBlobUploadResponse,
} from '@azure/storage-blob/typings/src/generated/src/models';

const { AZURE_BLOB_ACCOUNT, AZURE_BLOB_ACCOUNT_KEY } = process.env;

interface BlockBlobUploadResponseExtended extends BlockBlobUploadResponse {
  url: string;
}

const getServiceUrl = (): ServiceURL => {
  const sharedKeyCredential = new SharedKeyCredential(
    AZURE_BLOB_ACCOUNT as string,
    AZURE_BLOB_ACCOUNT_KEY as string,
  );

  const pipeline = StorageURL.newPipeline(sharedKeyCredential);

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
    const { statusCode } = error;

    if (statusCode !== 409) {
      throw error;
    }
  }

  const blobURL = BlobURL.fromContainerURL(url, name);

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
  const serviceURL = await getServiceUrl();
  await setCorsRules(serviceURL);
  const containerURL = await getContainerURL(serviceURL, blobContainerName);
  const blockURL = await getBlockURL(containerURL, blobName);
  const uploadResponse = await upload(blockURL, blobContent);

  return { ...uploadResponse, url: containerURL.url };
};
