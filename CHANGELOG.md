# Changelog

## [5.0.0] - STAGING
- BREAKING: Generate checksum files similar to GNU Coreutils. This allows GNU's `sha256sum -c <checksums-file>` to be used along with `md5sum -c <checksums-file>`, and so on.
Earlier format:
```
file1.txt	xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
file2.txt	xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
...
```
New format:
```
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx	file1.txt
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx	file2.txt
```
- BREAKING: Only print basename of files in checksum files. Previous behaviour was to use the path name as is provided in the glob (after expanding), or simply using the file_name parameter.
This behaviour is inconsistent, since GitHub releases does not have this directory structure (basically it's missing).
Earlier:
```
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx	path/to/file.txt
...
```
Now:
```
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx	file.txt
...
```
- feat: Allow setting checksums file name using `checksums_file_name` input. The variable optionally supports `%algo%` which will be replaced with the respective algorithm.

## [4.1.0] - 2023-01-DD
- Add support for generating checksums automatically

## [4.0.2] - 2022-12-29
- Prevent API overuse [#5](https://github.com/termux/upload-release-action/issues/5)

## [4.0.1] - 2022-12-28
- Target Node.js v18 (EVENTUALLY REVERTED as Node.js v18 is not available for actions usage)

## [4.0.0] - 2022-12-28
- Added `skip_of_no_glob_match` input paramater. Setting this to true will supress error when no files are to be uploaded when no file matches the glob.
- `browser_download_url` has now been replaced with `browser_download_urls` which is now an array of uploaded files.
- Dependency updates (as usual)

## [3.0.3] - 2022-04-24
- Update all npm dependencies
- Use yarn as a package manager
- Fix lot's of legacy code that ceases to work with newer deps

## [2.2.1] - 2020-12-16
- Added support for the GitHub pagination API for repositories with many releases [#36](https://github.com/svenstaro/upload-release-action/pull/36) (thanks @djpohly)

## [2.2.0] - 2020-10-07
- Add support for ceating a new release in a foreign repository [#25](https://github.com/svenstaro/upload-release-action/pull/25) (thanks @kittaakos)
- Upgrade all deps

## [2.1.1] - 2020-09-25
- Fix `release_name` option [#27](https://github.com/svenstaro/upload-release-action/pull/27) (thanks @kittaakos)

## [2.1.0] - 2020-08-10
- Strip refs/heads/ from the input tag [#23](https://github.com/svenstaro/upload-release-action/pull/23) (thanks @OmarEmaraDev)

## [2.0.0] - 2020-07-03
- Add `prerelease` input parameter. Setting this marks the created release as a pre-release.
- Add `release_name` input parameter. Setting this explicitly sets the title of the release.
- Add `body` input parameter. Setting this sets the text content of the created release.
- Add `browser_download_url` output variable. This contains the publicly accessible download URL of the uploaded artifact.
- Allow for leaving `asset_name` unset. This will cause the asset to use the filename.
