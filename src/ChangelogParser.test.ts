import { ChangelogParser } from "./ChangelogParser";

const sampleChangelog = `
# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]
### Fixed
- Fix typos in recent README changes.
- Update outdated unreleased diff link.

## [0.0.4] - 2014-08-09
### Added
- Better explanation of the difference between the file ("CHANGELOG")
and its function "the change log".

### Changed
- Refer to a "change log" instead of a "CHANGELOG" throughout the site
to differentiate between the file and the purpose of the file — the
logging of changes.

## [0.0.1] - 2014-07-10
### Added
- Explanation of the recommended reverse chronological release ordering.

## [0.0.1-SNAPSHOT] - 2014-07-09
### Added
- First file

[Unreleased]: https://github.com/olivierlacan/keep-a-changelog/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/olivierlacan/keep-a-changelog/compare/v0.3.0...v1.0.0
[0.3.0]: https://github.com/olivierlacan/keep-a-changelog/compare/v0.2.0...v0.3.0
`;

test("should parse sample CHANGELOG", () => {
  const changelog = ChangelogParser.parseChangelog(sampleChangelog);
  expect(changelog.getEntries()).toStrictEqual([
    {
      version: 'unreleased',
      status: 'unreleased',
      date: undefined,
      description: '### Fixed\n' +
        '- Fix typos in recent README changes.\n' +
        '- Update outdated unreleased diff link.'
    },
    {
      version: '0.0.4',
      status: 'release',
      date: '2014-08-09',
      description: '### Added\n' +
        '- Better explanation of the difference between the file ("CHANGELOG")\n' +
        'and its function "the change log".\n' +
        '\n' +
        '### Changed\n' +
        '- Refer to a "change log" instead of a "CHANGELOG" throughout the site\n' +
        'to differentiate between the file and the purpose of the file — the\n' +
        'logging of changes.'
    },
    {
      version: '0.0.1',
      status: 'release',
      date: '2014-07-10',
      description: '### Added\n' +
        '- Explanation of the recommended reverse chronological release ordering.'
    },
    {
      version: '0.0.1-SNAPSHOT',
      status: 'prerelease',
      date: '2014-07-09',
      description: '### Added\n- First file'
    }
  ]);
});


test("should parse CHANGELOG with inlined version links", () => {
  const changelog = ChangelogParser.parseChangelog([
    "## [0.0.1-SNAPSHOT](https://github.com/olivierlacan/keep-a-changelog/compare/v0.2.0...v0.3.0) - 2014-07-09",
    "inlined link with date",
    "## [0.0.1](https://github.com/olivierlacan/keep-a-changelog/compare/v0.2.0...v0.3.0)",
    "inlined link without date"
  ].join("\n"));
  expect(changelog.getEntries()).toStrictEqual([
    {
      version: '0.0.1-SNAPSHOT',
      status: 'prerelease',
      date: '2014-07-09',
      description: 'inlined link with date'
    },
    {
      version: '0.0.1',
      status: 'release',
      date: undefined,
      description: 'inlined link without date'
    }
  ]);
});

test("should parse CHANGELOG with version as link label", () => {
  const changelog = ChangelogParser.parseChangelog([
    "## [0.0.1-SNAPSHOT] - 2014-07-09",
    "link with date",
    "## [0.0.1]",
    "link without date"
  ].join("\n"));
  expect(changelog.getEntries()).toStrictEqual([
    {
      version: '0.0.1-SNAPSHOT',
      status: 'prerelease',
      date: '2014-07-09',
      description: 'link with date'
    },
    {
      version: '0.0.1',
      status: 'release',
      date: undefined,
      description: 'link without date'
    }
  ]);
});

test("should parse CHANGELOG with out version links", () => {
  const changelog = ChangelogParser.parseChangelog([
    "## 0.0.1-SNAPSHOT - 2014-07-09",
    "link with date",
    "## 0.0.1",
    "link without date"
  ].join("\n"));
  expect(changelog.getEntries()).toStrictEqual([
    {
      version: '0.0.1-SNAPSHOT',
      status: 'prerelease',
      date: '2014-07-09',
      description: 'link with date'
    },
    {
      version: '0.0.1',
      status: 'release',
      date: undefined,
      description: 'link without date'
    }
  ]);
});

test("should parse CHANGELOG without dates", () => {
  const changelog = ChangelogParser.parseChangelog([
    "## 0.0.1-SNAPSHOT",
    "link with date",
    "## 0.0.1 - some release description",
    "link without date"
  ].join("\n"));
  expect(changelog.getEntries()).toStrictEqual([
    {
      version: '0.0.1-SNAPSHOT',
      status: 'prerelease',
      date: undefined,
      description: 'link with date'
    },
    {
      version: '0.0.1',
      status: 'release',
      date: undefined,
      description: 'link without date'
    }
  ]);
});

["unreleased", "[unreleased]", "UNRELEASED", "[UNRELEASED]"]
  .forEach(unreleasedTag => {
    test("should parse CHANGELOG with unreleased entry: " + unreleasedTag, () => {
      const changelog = ChangelogParser.parseChangelog([
        "## " + unreleasedTag,
        "unreleased feature",
        "## 0.0.1",
        "released feature",
      ].join("\n"));
      expect(changelog.getEntries()).toStrictEqual([
        {
          version: 'unreleased',
          status: 'unreleased',
          date: undefined,
          description: 'unreleased feature'
        },
        {
          version: '0.0.1',
          status: 'release',
          date: undefined,
          description: 'released feature'
        }
      ]);
    });
  });

test('should throw error on undefined entry header', async () => {
  expect.assertions(1);
  try {
    ChangelogParser.parseChangelog("## something");
  } catch (e) {
    expect(e.message).toEqual("Could not parse CHANGELOG entry:\nsomething");
  }
});

test('should return empty entries when changelog is empty', async () => {
  const changelog = ChangelogParser.parseChangelog("");
  expect(changelog.getEntries()).toStrictEqual([]);
});

test('should return empty entries when changelog has no version headers', async () => {
  const changelog = ChangelogParser.parseChangelog([
    "# Changelog",
    "Some notice"
  ].join("\n"));
  expect(changelog.getEntries()).toStrictEqual([]);
});

test('should throw error on duplicated versions', async () => {
  expect.assertions(1);
  try {
    ChangelogParser.parseChangelog([
      "## 1.0.0",
      "## 1.0.0 - 2020.10.10",
    ].join("\n"));
  } catch (e) {
    expect(e.message).toEqual("Duplicated version in changelog: 1.0.0");
  }
});
