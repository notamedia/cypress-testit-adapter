import fs from 'fs';
import debug from 'debug';
import logger from './Logger.js';
import JunitParser from './Parser/JunitParser.js';
import Client from './TestIt/Client.js';
import Exporter from './TestIt/Exporter.js';

logger.init(debug);

const REPORT_BASEDIR = (process.env.REPORT_BASEDIR || '').trim().replace(/[/]*$/g, '');
const TESTIT_BASE_URL = process.env.TESTIT_BASE_URL;
const TESTIT_PROJECT_ID = process.env.TESTIT_PROJECT_ID;
const TESTIT_TOKEN = process.env.TESTIT_TOKEN;

const args = process.argv.slice(2);

if (args.length < 1) {
  throw new Error('Input string requires filepath to junit file as first argument');
}

let filepath;
if (REPORT_BASEDIR) {
  filepath = `${REPORT_BASEDIR}/${args[0].replace(/^[/]*/g, '')}`;
} else {
  filepath = args[0];
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
