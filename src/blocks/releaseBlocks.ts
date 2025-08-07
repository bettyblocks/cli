import type { RequestInit, Response } from 'node-fetch';
import fetch from 'node-fetch';

import Config from '../functions/config';
import FusionAuth from '../utils/login';

const GET_DEV_BLOCKS = '/blocks/my-dev-blocks';
const POST_RELEASE_BLOCKS = '/blocks/release';

const sendBlockstoreRequest = async (
  urlPath: string,
  method: string,
  body: RequestInit['body'],
  config: Config,
  fusionAuth: FusionAuth,
  applicationId: string,
): Promise<Response> => {
  const url = `${config.blockstoreApiUrl}${urlPath}`;
  return fetch(url, {
    agent: config.agent,
    method,
    body,
    headers: {
      'content-type': 'application/json',

      Authorization: `Bearer ${fusionAuth.jwt()}`,
      ApplicationId: applicationId,
      Accept: 'application/json',
    },
  }).then(async (res) => {
    if (res.status === 401 || res.status === 403) {
      await fusionAuth.ensureLogin();
      return sendBlockstoreRequest(
        urlPath,
        method,
        body,
        config,
        fusionAuth,
        applicationId,
      );
    }

    return res;
  });
};

const fetchAllDevBlocks = async (
  config: Config,
  fusionAuth: FusionAuth,
  applicationId: string,
): Promise<Response> =>
  sendBlockstoreRequest(
    GET_DEV_BLOCKS,
    'GET',
    undefined,
    config,
    fusionAuth,
    applicationId,
  );

const releaseBlocksInBlockstore = async (
  blockIds: string[],
  config: Config,
  fusionAuth: FusionAuth,
  applicationId: string,
): Promise<boolean> => {
  const response = await sendBlockstoreRequest(
    POST_RELEASE_BLOCKS,
    'POST',
    JSON.stringify({ block_ids: blockIds }),
    config,
    fusionAuth,
    applicationId,
  );
  if (!response.ok) {
    await response
      .text()
      .then((text) =>
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

  return releaseBlocksInBlockstore(
    blockIdsToBeReleased,
    config,
    fusionAuth,
    applicationId,
  );
};

export default releaseBlocks;
