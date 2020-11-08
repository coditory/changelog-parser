import { Changelog, ChangelogEntry } from "./Changelog";

export class ChangelogParser {
  // https://regexr.com/5fp7a
  private static readonly realesedVersionRegex = /^\[? *([0-9]+\.[0-9]+\.[0-9]+)((?:-+.)[0-9A-Za-z-.+_]+)?(?: *\])?(?: *\( *[^)]* *\))?(?: +- +([0-9-]+)?)?/;
  private static readonly unreleasedHeaderRegex = /^\[? *unreleased *\]?(?: *\( *[^)]* *\))?/i;
  private static readonly linkLabelRegex = /^\[ *[^\]]+ *\]:.+/;

  static parseChangelog(changelog: string): Changelog {
    const changelogNoIntro = ChangelogParser.removeChangelogIntro(changelog);
    const changelogNoLinks = ChangelogParser.removeLinkLabels(changelogNoIntro);
    const entries = ("\n" + changelogNoLinks)
      .split('\n## ')
      .map(entry => entry.trim())
      .filter(entry => entry.length > 0)
      .map(entry => ChangelogParser.parseEntry(entry));
    ChangelogParser.validateUniqueVersions(entries);
    return new Changelog(entries);
  }

  private static validateUniqueVersions(entries: ChangelogEntry[]): void {
    const versions = new Set();
    entries.forEach(entry => {
      if (versions.has(entry.version)) {
        throw new Error(`Duplicated version in changelog: ${entry.version}`);
      }
      versions.add(entry.version);
    });
  }

  private static removeChangelogIntro(changelog: string): string {
    if (changelog.startsWith("## ")) {
      return changelog;
    }
    const index = changelog.indexOf('\n## ');
    return index > 0
      ? changelog.substring(index)
      : "";
  }

  private static removeLinkLabels(changelog: string): string {
    return changelog.split("\n")
      .filter(line => !ChangelogParser.linkLabelRegex.test(line))
      .join("\n");
  }

  private static parseEntry(entry: string): ChangelogEntry {
    const lines = entry.split("\n").map(line => line.trim());
    const header = lines.shift() || "";
    const description = lines.join("\n");
    const realesedHeaderMatch = header.match(ChangelogParser.realesedVersionRegex);
    if (realesedHeaderMatch != null) {
      const version = realesedHeaderMatch[1];
      const suffix = realesedHeaderMatch[2] ?? '';
      const date = realesedHeaderMatch[3];
      const status = suffix?.startsWith('-') === true
        ? 'prerelease'
        : 'release';
      return { version: version + suffix, status, date, description };
    }
    const unreleasedHeaderMatch = header.match(ChangelogParser.unreleasedHeaderRegex);
    if (unreleasedHeaderMatch != null) {
      return {
        version: 'unreleased',
        status: 'unreleased',
        date: undefined,
        description
      };
    }
    throw new Error("Could not parse CHANGELOG entry:\n" + entry);
  }
}
