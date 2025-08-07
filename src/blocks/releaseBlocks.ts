import fetch, { type RequestInit, type Response } from 'node-fetch';

import Config from '../functions/config';
import FusionAuth from '../utils/login';

const GET_DEV_BLOCKS = '/blocks/my-dev-blocks';
const POST_RELEASE_BLOCKS = '/blocks/release';

interface SendBlockstoreRequestProps {
  urlPath: string;
  method: string;
  body: RequestInit['body'];
  config: Config;
  fusionAuth: FusionAuth;
  applicationId: string;
}

interface ReleaseBlocksInBlockstoreProps {
  blockIds: string[];
  config: Config;
  fusionAuth: FusionAuth;
  applicationId: string;
}

const sendBlockstoreRequest = async ({
  urlPath,
  method,
  body,
  config,
  fusionAuth,
  applicationId,
}: SendBlockstoreRequestProps): Promise<Response> => {
  const url = `${config.blockstoreApiUrl}${urlPath}`;
  return fetch(url, {
    agent: config.agent,
    body,
    headers: {
      Accept: 'application/json',
      ApplicationId: applicationId,
      Authorization: `Bearer ${fusionAuth.jwt()}`,
      'content-type': 'application/json',
    },
    method,
  }).then(async (res: Response) => {
    if (res.status === 401 || res.status === 403) {
      await fusionAuth.ensureLogin();
      return sendBlockstoreRequest({
        applicationId,
        body,
        config,
        fusionAuth,
        method,
        urlPath,
      });
    }

    return res;
  });
};

const fetchAllDevBlocks = async (
  config: Config,
  fusionAuth: FusionAuth,
  applicationId: string,
): Promise<Response> =>
  sendBlockstoreRequest({
    applicationId,
    body: undefined,
    config,
    fusionAuth,
    method: 'GET',
    urlPath: GET_DEV_BLOCKS,
  });

const releaseBlocksInBlockstore = async ({
  blockIds,
  config,
  fusionAuth,
  applicationId,
}: ReleaseBlocksInBlockstoreProps): Promise<boolean> => {
  const response = await sendBlockstoreRequest({
    applicationId,
    body: JSON.stringify({ block_ids: blockIds }),
    config,
    fusionAuth,
    method: 'POST',
    urlPath: POST_RELEASE_BLOCKS,
  });

  if (!response.ok) {
    await response
      .text()
      .then((text: string) =>
        console.error(`Failed to release blocks in Blockstore: ${text}`),
      );
    return false;
  }
  return true;
};

const releaseBlocks = async ({
  all,
  blockIds,
}: {
  all?: boolean;
  blockIds: string[];
}): Promise<boolean> => {
  const config = new Config();
  const fusionAuth = new FusionAuth(config);
  const applicationId = await config.applicationId();
  if (!applicationId) {
    throw new Error(
      "Couldn't publish block(s), Error: application id not found",
    );
  }

  let blockIdsToBeReleased: string[] = blockIds;
  if (all) {
    const res = await fetchAllDevBlocks(config, fusionAuth, applicationId);
    blockIdsToBeReleased = (await res.json()) as string[];
  }

  return releaseBlocksInBlockstore({
    applicationId,
    blockIds: blockIdsToBeReleased,
    config,
    fusionAuth,
  });
};

export default releaseBlocks;
