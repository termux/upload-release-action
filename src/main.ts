import * as core from '@actions/core';
import * as github from '@actions/github';
import * as path from 'path';
import * as glob from 'glob';
import uploadToRelease from './uploadToRelease';
import getReleaseByTag from './getReleaseByTag';
import getRepo from './getRepo';
import {Checksums, RepoAssetsResp} from './types';
import {getHashes} from 'crypto';
import uploadChecksums from './uploadChecksums';

async function run(): Promise<void> {
  try {
    // Get the inputs from the workflow file: https://github.com/actions/toolkit/tree/master/packages/core#inputsoutputs
    const token = core.getInput('repo_token', {required: true});
    const file_name = core.getInput('file', {required: true});
    const tag = core
      .getInput('tag', {required: true})
      .replace('refs/tags/', '')
      .replace('refs/heads/', '');

    // NOTE: can't use core.getBooleanInput due to https://github.com/actions/toolkit/issues/844
    const file_glob = core.getInput('file_glob') === 'true' ? true : false;
    const overwrite = core.getInput('overwrite') === 'true' ? true : false;
    const prerelease = core.getInput('prerelease') === 'true' ? true : false;
    const release_name = core.getInput('release_name');
    const body = core.getInput('body');
    const checksums_algos = core.getInput('checksums').split(',');
    const checksums_file_name =
      core.getInput('checksums_file_name') || 'CHECKSUMS-%algo%.txt';
    const checksums: Checksums = {};

    // Make sure all checksums_algos are available
    const availableHashes = getHashes();
    for (const algo of checksums_algos) {
      if (!availableHashes.includes(algo)) {
        throw new Error('Unsupported cryptographic algorithm');
      }
    }

    const octokit = github.getOctokit(token);
    const release = await getReleaseByTag(
      tag,
      prerelease,
      release_name,
      body,
      octokit
    );

    // For checking duplicates
    const assets: RepoAssetsResp = await octokit.paginate(
      octokit.rest.repos.listReleaseAssets,
      {
        ...getRepo(),
        release_id: release.data.id,
        per_page: 100
      }
    );

    if (file_glob) {
      const files = glob.sync(file_name);
      if (files.length > 0) {
        const asset_download_urls: string[] = [];
        for (const file of files) {
          const asset_name = path.basename(file);
          const asset_download_url = await uploadToRelease(
            release,
            file,
            asset_name,
            tag,
            overwrite,
            octokit,
            assets,
            checksums_algos,
            checksums
          );
          if (typeof asset_download_url != 'undefined') {
            asset_download_urls.push(asset_download_url);
          }
        }
        core.setOutput('browser_download_urls', asset_download_urls);
      } else {
        const skip_if_no_glob_match =
          core.getInput('skip_if_no_glob_match') == 'true' ? true : false;
        if (skip_if_no_glob_match) {
          core.warning('No files matching the glob pattern found.');
        } else {
          core.setFailed('No files matching the glob pattern found.');
        }
      }
    } else {
      const asset_name =
        core.getInput('asset_name') !== ''
          ? core.getInput('asset_name').replace(/\$tag/g, tag)
          : path.basename(file_name);
      const asset_download_url = await uploadToRelease(
        release,
        file_name,
        asset_name,
        tag,
        overwrite,
        octokit,
        assets,
        checksums_algos,
        checksums
      );
      core.setOutput('browser_download_urls', [asset_download_url]);
    }
    uploadChecksums(
      checksums,
      checksums_algos,
      checksums_file_name,
      release,
      tag,
      octokit
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    core.setFailed(error.message);
  }
}

run();
