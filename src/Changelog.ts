export class Changelog {
  private readonly entriesByVersion: { [version: string]: ChangelogEntry };

  constructor(private readonly entries: ChangelogEntry[]) {
    this.entriesByVersion = entries.reduce(
      (acc, value) => (acc[value.version] = value, acc),
      {} as { [version: string]: ChangelogEntry }
    )
  }

  getByVersion(version: string): ChangelogEntry {
    const entry = this.entriesByVersion[version];
    if (entry == null) {
      throw new Error("Could not find CHANGELOG entry for version: " + version);
    }
    return entry
  }

  getLatestVersion(): ChangelogEntry|undefined {
    return this.getReleaseEntries()[0];
  }

  getReleasedVersionsCount(): number {
    return this.getReleaseEntries().length;
  }

  getReleaseEntries(): ChangelogEntry[] {
    return this.entries
      .filter(entry => entry.status !== "unreleased");
  }

  getEntries(): ChangelogEntry[] {
    return [...this.entries];
  }
}

export interface ChangelogEntry {
  version: string,
  status: string,
  date?: string,
  description: string
}
