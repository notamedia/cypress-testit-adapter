import { jest } from '@jest/globals';
import Exporter from './Exporter.js';
import Test from '../Parser/Model/Test.js';
import Autotest from './Model/Autotest.js';

// Это не задокументировано нигде, Jest всё ещё не умеет в нативный ESM
// https://github.com/facebook/jest/issues/10025#issuecomment-922062331
const mockGetAutotest = jest.fn();
const mockLinkToWorkItem = jest.fn();
mockGetAutotest.mockReturnValue(new Autotest('test-id', 'test-externalId', 'test-projectId', 'test-title', 'test-namespace', 'test-classname'));
jest.unstable_mockModule('./Client.js', () => ({
  default: jest.fn().mockImplementation(() => ({
    getAutotest: mockGetAutotest,
    linkToWorkItem: mockLinkToWorkItem,
  })),
}));
const { default: Client } = await import('./Client.js');

beforeEach(() => {
  Client.mockClear();
});

test('exports only not failure tests', async () => {
  const tests = [
    new Test('test1, not failure', 0, '/a/b', false),
    new Test('test2, failure', 0, '/a/b', true),
    new Test('test3, #1 not failure', 0, '/a/b', false),
    new Test('test4, #2 failure', 0, '/a/b', true),
  ];

  const client = new Client('', '', '');
  const exporter = new Exporter(client);

  await exporter.export(tests);

  expect(mockGetAutotest).toBeCalledTimes(1);
});

test('Test IT ids extraction', async () => {
  const tests = [
    new Test('#1 test me, please #2 # 3 #4,#5', 0, '/a/b', false),
    new Test('and me', 0, '/a/b', false),
    new Test('me too #123', 0, '/a/b', false),
    new Test('#456', 0, '/a/b', false),
    new Test('hello #789abc', 0, '/a/b', false),
  ];

  const client = new Client('', '', '');
  const exporter = new Exporter(client);

  await exporter.export(tests);

  expect(mockLinkToWorkItem).toBeCalledTimes(7);
  expect(mockLinkToWorkItem).toHaveBeenNthCalledWith(1, 'test-id', '1');
  expect(mockLinkToWorkItem).toHaveBeenNthCalledWith(2, 'test-id', '2');
  expect(mockLinkToWorkItem).toHaveBeenNthCalledWith(3, 'test-id', '4');
  expect(mockLinkToWorkItem).toHaveBeenNthCalledWith(4, 'test-id', '5');
  expect(mockLinkToWorkItem).toHaveBeenNthCalledWith(5, 'test-id', '123');
  expect(mockLinkToWorkItem).toHaveBeenNthCalledWith(6, 'test-id', '456');
  expect(mockLinkToWorkItem).toHaveBeenNthCalledWith(7, 'test-id', '789');
});
