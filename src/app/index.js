#!/usr/bin/env node

import fs from 'fs';
import { Command } from 'commander';
import debug from 'debug';
import logger from './Logger.js';
import JunitParser from './Parser/JunitParser.js';
import Client from './TestIt/Client.js';
import Exporter from './TestIt/Exporter.js';

logger.init(debug);

const program = new Command();
program
  .requiredOption('--testit-project-id <char>', 'Project Id in TestIT')
  .requiredOption('--testit-token <char>', 'TestIT token')
  .requiredOption('--report <char>', 'Filepath to JUnit report file')
  .option('--report-basedir <char>', 'Basedir to report file')
  .option('--testit-base-url <char>', 'Base url to TestIT');

program.parse();
const options = program.opts();

const REPORT_BASEDIR = (options.reportBasedir || '').trim().replace(/[/]*$/g, '');
const TESTIT_BASE_URL = options.testitBaseUrl || 'https://testit.software';
const TESTIT_PROJECT_ID = options.testitProjectId;
const TESTIT_TOKEN = options.testitToken;

let filepath;
if (REPORT_BASEDIR) {
  filepath = `${REPORT_BASEDIR}/${options.report.replace(/^[/]*/g, '')}`;
} else {
  filepath = options.report;
}

logger.debug('[Test IT] Base URL: %s', TESTIT_BASE_URL);
logger.debug('[Test IT] Project Id: %s', TESTIT_PROJECT_ID);
logger.debug('[Test IT] Token: %s', TESTIT_TOKEN.replace(/^(.{2}).*/, '$1*******'));
logger.debug('[JUnit] File: %s', filepath);

const report = fs.readFileSync(filepath, 'utf8');
const parser = new JunitParser();
parser.parse(report);

const tests = parser.getTests();
if (!tests.length) {
  logger.info('Nothing to import, exit now');
  process.exit();
}

const testit = new Client(TESTIT_BASE_URL, TESTIT_PROJECT_ID, TESTIT_TOKEN);
await testit.check();

const exporter = new Exporter(testit);
await exporter.export(tests);
