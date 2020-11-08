import * as core from '@actions/core';
import { Action } from './Action';

async function run(): Promise<void> {
  const path = core.getInput('path') || undefined;
  const version = core.getInput('version') || undefined;

  core.startGroup('Parse CHANGELOG');
  const entry = await new Action().run(version, path);
  core.info(`Version: "${entry?.version ?? ""}"`);
  core.info(`  Major: "${entry?.versionMajor ?? ""}"`);
  core.info(`  Minor: "${entry?.versionMinor ?? ""}"`);
  core.info(`  Patch: "${entry?.versionPatch ?? ""}"`);
  core.info(`Date: "${entry?.date ?? ""}"`);
  core.info(`Status: "${entry?.status ?? ""}"`);
  core.info(`Description:\n${entry?.description ?? ""}\n`);
  core.endGroup();

  core.setOutput('version', entry?.version ?? "");
  core.setOutput('versionMajor', entry?.versionMajor ?? "");
  core.setOutput('versionMinor', entry?.versionMinor ?? "");
  core.setOutput('versionPatch', entry?.versionPatch ?? "");
  core.setOutput('date', entry?.date ?? "");
  core.setOutput('status', entry?.status ?? "");
  core.setOutput('description', entry?.description ?? "");
}

async function main(): Promise<void> {
  try {
    await run();
  } catch (error) {
    core.setFailed(error.message);
  }
}

main();
