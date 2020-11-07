# chengelog-parser
[![GitHub Action Build](https://github.com/coditory/changelog-parser-action/workflows/Build/badge.svg)](https://github.com/coditory/changelog-parser-action/actions?query=workflow%3ABuild+branch%3Amaster)
[![Coverage Status](https://coveralls.io/repos/github/coditory/changelog-parser-action/badge.svg?branch=master)](https://coveralls.io/github/coditory/changelog-parser-action?branch=master)

> A GitHub action that parses your `CHANGELOG.md` written in [Keep a Changelog format](https://github.com/olivierlacan/keep-a-changelog).

## Usage

### Inputs
- `path` (optional) - Path to the CHANGELOG file. If path is not specified tha ection will look for a changelog is standard locations (`changelog.md`, `CHANGELOG.md`, ...).
- `version` (optional) - Version of the changelog entry to parse. By default the last released version is used.

### Outputs
- `version` - Version of the log entry found. Ex: `2.0.0`.
- `date` - Release date of the log entry found. Ex: `2020-08-22`.
- `status` - Status of the log entry found (`prereleased`, `released`, `unreleased`).
- `description` - Description text of the log entry found.

### Example
Typical `README.md` file:
```md
# Changelog
Some description

## [Unreleased]
### Added
- Another important feature

## [0.2.0] - 2020-11-10
### Added
- Important feature

## [0.1.1] - 2020-10-10
### Changed
- Fixed small bug

## [0.1.0] - 2020-09-10
### Added
- Initialized project

[Unreleased]: https://github.com/coditory/changelog-parser-action/compare/v0.2.0...HEAD
[0.2.0]: https://github.com/coditory/changelog-parser-action/compare/v0.1.1...v0.2.0
[0.1.1]: https://github.com/coditory/changelog-parser-action/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/coditory/changelog-parser-action/releases/tag/v0.1.0
```

Action executed with no inputs
```bash
version: "0.2.0"
date: "2020-11-10"
status: "released"
description: "### Added\n- Important feature"
```

Action executed with input `version: 0.1.1`
```bash
version: "0.1.1"
date: "2020-10-10"
status: "released"
description: "### Changed\n- Fixed small bug"
```

## Sample usage in actions

### Trigger release process from CHANGELOG.md

In this example release steps are triggered when:
- it's a master branch
- changelog has different version then last publish `v*` tag

This is just a sample action that uses java with gradle.

```yaml
name: Build

on: [ push ]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v2
      - name: Set up JDK 11
        uses: actions/setup-java@v1
        with:
          java-version: 11
      - name: Build with Gradle
        run: ./gradlew build
      - name: Get last version from tag
        id: lasttag
        shell: bash
        run: echo ::set-output name=version::$(git describe --abbrev=0 --tags --match 'v[0-9]*' | cut -c2-)
      - name: Parse Changelog Entry
        id: changelog
        uses: coditory/changelog-parser@v1
      - name: Release
        if: "github.ref == 'refs/heads/master' && steps.changelog.outputs.version != steps.lasttag.outputs.version"
        env:
          RELEASE_VERSION: ${{ steps.changelog.outputs.version }}
        run: ./gradlew release
      - name: GitHub Release
        if: "github.ref == 'refs/heads/master' && steps.changelog.outputs.version != steps.lasttag.outputs.version"
        uses: actions/create-release@v1
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          body: ${{ steps.changelog.outputs.description }}
          tag_name: ${{ steps.changelog.outputs.version }}
          release_name: Release ${{ steps.changelog.outputs.version }}
```

### Create [GitHub Release](https://docs.github.com/en/free-pro-team@latest/github/administering-a-repository/managing-releases-in-a-repository) on a new tag

This action creates [GitHub Release](https://docs.github.com/en/free-pro-team@latest/github/administering-a-repository/managing-releases-in-a-repository) on new tag `v*`.

```yaml
name: Create Release

on:
  push:
    tags:
      - v*

jobs:
  build:
    name: Create Release
    runs-on: ubuntu-latest
    steps:
      - name: Get version from tag
        id: lasttag
        run: echo ::set-output name=version::${GITHUB_REF#refs/tags/v}
        shell: bash
      - name: Checkout code
        uses: actions/checkout@v2
      - name: Parse Changelog Entry
        id: changelog
        uses: coditory/changelog-parser@v1
        with:
          version: version: ${{ steps.lasttag.outputs.version }}
      - name: Create GitHub Release
        id: create_release
        uses: actions/create-release@v1
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          tag_name: ${{ steps.changelog.outputs.version }}
          release_name: Release ${{ steps.changelog.outputs.version }}
          body: ${{ steps.changelog.outputs.description }}
```
