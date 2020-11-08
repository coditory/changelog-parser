import { promises as fs } from 'fs';
import * as path from 'path';

export class ChangelogReader {
  static readonly DEFAULT_LOCATIONS: string[] = [
    "CHANGELOG.md",
    "CHANGELOG",
    "changelog.md",
    "changelog",
  ];

  constructor(private readonly basedir: string = "./") {}

  async readChangelog(filePath: string|undefined): Promise<string> {
    if (filePath === undefined) {
      return this.findAndReadChangelog();
    }
    const content = await this.readFile(filePath);
    if (content === undefined) {
      throw new Error(`Could not find CHANGELOG file: ` + filePath);
    }
    return content;
  }

  private async findAndReadChangelog(): Promise<string> {
    const locations = ChangelogReader.DEFAULT_LOCATIONS;
    let content = null;
    for (let i = 0; i < locations.length && content == null; i++) {
      const location = locations[i];
      content = await this.readFile(location);
    }
    if (content == null) {
      throw new Error(`Could not find CHANGELOG file. Searched in locations: ${locations.join(', ')}`);
    }
    return content;
  }

  private async readFile(filePath: string): Promise<string|undefined> {
    return fs.readFile(path.join(this.basedir, filePath), 'utf8')
      .catch(() => undefined);
  }
}
