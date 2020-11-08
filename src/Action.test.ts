import * as path from 'path';
import * as os from 'os';
import { promises as fs } from 'fs';
import { Action } from './Action';

let tmpdir: string;
let action: Action;

beforeAll(async () => {
  tmpdir = await fs.mkdtemp(path.join(os.tmpdir(), "changlog-parser-test"));
  action = new Action(tmpdir);
});

afterAll(async () => {
  if (tmpdir) {
    await fs.rmdir(tmpdir, { recursive: true });
  }
});

const writeChangelog = async (content: string[], fileName = "CHANGELOG.md"): Promise<void> => {
  await fs.writeFile(path.join(tmpdir, fileName), content.join("\n"), 'utf8');
};

test('should throw error on missing CHANGELOG in default locations', async () => {
  expect.assertions(1);
  try {
    await action.run();
  } catch (e) {
    expect(e.message).toEqual("Could not find CHANGELOG file. Searched in locations: CHANGELOG.md, CHANGELOG, changelog.md, changelog");
  }
});

test('should throw error on missing CHANGELOG in specific loaction', async () => {
  expect.assertions(1);
  try {
    await action.run(undefined, "CHANGELOGGG.md");
  } catch (e) {
    expect(e.message).toEqual("Could not find CHANGELOG file: CHANGELOGGG.md");
  }
});

test('should load CHANGELOG from default location', async () => {
  writeChangelog([
    "## 1.0.0",
  ]);
  const entry = await action.run();
  expect(entry?.version).toBe("1.0.0");
});

test('should load CHANGELOG from specific location', async () => {
  writeChangelog([
    "## 2.0.0",
  ], "CHANGELOGGG.md");
  const entry = await action.run(undefined, "CHANGELOGGG.md");
  expect(entry?.version).toBe("2.0.0");
});

test('should read latest released version from CHANGELOG using entry order', async () => {
  writeChangelog([
    "## unreleased",
    "## 2.0.0",
    "## 3.0.0",
    "## 1.0.0"
  ]);
  const entry = await action.run();
  expect(entry?.version).toBe("2.0.0");
});

test('should return empty entry if no version was specified and changelog is empty', async () => {
  writeChangelog([""]);
  const entry = await action.run();
  expect(entry).toBeUndefined();
});

test('should throw error on missing entry', async () => {
  expect.assertions(1);
  writeChangelog([""]);
  try {
    await action.run("0.0.1");
  } catch (e) {
    expect(e.message).toEqual("Could not find CHANGELOG entry for version: 0.0.1");
  }
});
