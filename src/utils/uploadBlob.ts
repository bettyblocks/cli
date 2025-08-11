import {
  Aborter,
  BlobURL,
  BlockBlobURL,
  ContainerURL,
  Pipeline,
  RestError,
  ServiceURL,
  SharedKeyCredential,
  StorageURL,
} from '@azure/storage-blob';
import chalk from 'chalk';

interface UploadBlobProps {
  blobContainerName: string;
  blobName: string;
  blobContent: string;
  blobContentType: string;
}

const { AZURE_BLOB_ACCOUNT, AZURE_BLOB_ACCOUNT_KEY } = process.env;

if (!AZURE_BLOB_ACCOUNT) {
  throw new Error(chalk.red('\n$AZURE_BLOB_ACCOUNT is required\n'));
}

if (!AZURE_BLOB_ACCOUNT_KEY) {
  throw new Error(chalk.red('\n$AZURE_BLOB_ACCOUNT_KEY is required\n'));
}

interface SetCorsRulesProps {
  clientRequestId?: string;
  date?: Date;
  errorCode?: string;
  requestId?: string;
  version?: string;
}

interface BlockBlobUploadResponse {
  clientRequestId?: string;
  contentMD5?: Uint8Array;
  date?: Date;
  encryptionKeySha256?: string;
  encryptionScope?: string;
  errorCode?: string;
  eTag?: string;
  isServerEncrypted?: boolean;
  lastModified?: Date;
  requestId?: string;
  version?: string;
}

export interface BlockBlobUploadResponseExtended
  extends BlockBlobUploadResponse {
  url: string;
}

const getServiceUrl = (): ServiceURL => {
  const sharedKeyCredential: SharedKeyCredential = new SharedKeyCredential(
    AZURE_BLOB_ACCOUNT,
    AZURE_BLOB_ACCOUNT_KEY,
  );

  const pipeline: Pipeline = StorageURL.newPipeline(sharedKeyCredential);

  const url = `https://${AZURE_BLOB_ACCOUNT}.blob.core.windows.net`;

  return new ServiceURL(url, pipeline);
};

const setCorsRules = (serviceURL: ServiceURL): Promise<SetCorsRulesProps> =>
  serviceURL.setProperties(Aborter.none, {
    cors: [
      {
        allowedHeaders: '*',
        allowedMethods: 'GET',
        allowedOrigins: '*',
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
    const { statusCode } = error as RestError;

    if (statusCode !== 409) {
      throw new Error(chalk.red(error));
    }
  }

  const blobURL: BlobURL = BlobURL.fromContainerURL(url, name);

  return BlockBlobURL.fromBlobURL(blobURL);
};

const upload = (
  url: BlockBlobURL,
  content: string,
  blobContentType: string,
): Promise<BlockBlobUploadResponse> =>
  url.upload(Aborter.none, content, content.length, {
    blobHTTPHeaders: {
      blobCacheControl: 'private, max-age=0, no-transform',
      blobContentType,
    },
  });

export default async ({
  blobContainerName,
  blobName,
  blobContent,
  blobContentType,
}: UploadBlobProps): Promise<BlockBlobUploadResponseExtended> => {
  const serviceURL = getServiceUrl();
  await setCorsRules(serviceURL);
  const containerURL = getContainerURL(serviceURL, blobContainerName);
  const blockURL = await getBlockURL(containerURL, blobName);
  const uploadResponse = await upload(blockURL, blobContent, blobContentType);

  return { ...uploadResponse, url: containerURL.url };
};
