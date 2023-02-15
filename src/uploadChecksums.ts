import {Checksums, CreateReleaseResp, ReleaseByTagResp} from './types';
import {GitHub} from '@actions/github/lib/utils';
import {uploadFile} from './uploadToRelease';

export default function uploadChecksums(
  checksums: Checksums,
  algos: string[],
  release: ReleaseByTagResp | CreateReleaseResp,
  tag: string,
  octokit: InstanceType<typeof GitHub>
): void {
  for (const algo of algos) {
    let checksumsFileContent = '';
    const checksumsFileName = 'CHECKSUMS-' + algo + '.txt';
    for (const file of Object.keys(checksums)) {
      checksumsFileContent += `${checksums[file][algo]}\t${file}\n`;
    }
    uploadFile(
      release,
      checksumsFileName,
      Buffer.from(checksumsFileContent),
      checksumsFileContent.length,
      checksumsFileName,
      tag,
      octokit
    );
  }
}
