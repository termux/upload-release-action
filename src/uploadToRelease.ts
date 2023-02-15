import getRepo from './getRepo';
import * as core from '@actions/core';
import {GitHub} from '@actions/github/lib/utils';
import {statSync, readFileSync} from 'fs';
import {
  ReleaseByTagResp,
  CreateReleaseResp,
  UploadAssetResp,
  RepoAssetsResp,
  Checksums
} from './types';
import calculateChecksum from './calculateChecksum';

export async function uploadFile(
  release: ReleaseByTagResp | CreateReleaseResp,
  file: string,
  file_bytes: Buffer,
  file_size: number,
  asset_name: string,
  tag: string,
  octokit: InstanceType<typeof GitHub>
): Promise<undefined | string> {
  core.debug(`Uploading ${file} to ${asset_name} in release ${tag}.`);
  const uploaded_asset: UploadAssetResp =
    await octokit.rest.repos.uploadReleaseAsset({
      ...getRepo(),
      name: asset_name,
      data: file_bytes as unknown as string,
      release_id: release.data.id,
      headers: {
        'content-type': 'binary/octet-stream',
        'content-length': file_size
      }
    });
  return uploaded_asset.data.browser_download_url;
}

export default async function uploadToRelease(
  release: ReleaseByTagResp | CreateReleaseResp,
  file: string,
  asset_name: string,
  tag: string,
  overwrite: boolean,
  octokit: InstanceType<typeof GitHub>,
  assets: RepoAssetsResp,
  checksum_algos: string[],
  checksums: Checksums
): Promise<undefined | string> {
  const stat = statSync(file);
  if (!stat.isFile()) {
    core.debug(`Skipping ${file}, since its not a file`);
    return;
  }
  const file_size = stat.size;
  const file_bytes = readFileSync(file);
  const checksum = calculateChecksum(file_bytes, checksum_algos);
  checksums[asset_name] = checksum;

  // Check for duplicates
  const duplicate_asset = assets.find(a => a.name === asset_name);
  if (duplicate_asset !== undefined) {
    if (overwrite) {
      core.debug(
        `An asset called ${asset_name} already exists in release ${tag} so we'll overwrite it.`
      );
      await octokit.rest.repos.deleteReleaseAsset({
        ...getRepo(),
        asset_id: duplicate_asset.id
      });
    } else {
      core.setFailed(`An asset called ${asset_name} already exists.`);
      return duplicate_asset.browser_download_url;
    }
  } else {
    core.debug(
      `No pre-existing asset called ${asset_name} found in release ${tag}. All good.`
    );
  }

  return uploadFile(
    release,
    file,
    file_bytes,
    file_size,
    asset_name,
    tag,
    octokit
  );
}
