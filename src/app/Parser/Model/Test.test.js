import Test from './Test.js';

test('id was not change in time', () => {
  const test = new Test('test', 0, '/a/b', false);

  expect(test.id).toBe(test.id);
});

test('only filepath and title affects to id', () => {
  const test1 = new Test('test1', 0, '/a/b', false);
  const test2 = new Test('test2', 0, '/a/b', false);
  const test3 = new Test('test1', 0, '/a/c', false);
  const test4 = new Test('test1', 1, '/a/b', true);

  expect(test1.id).not.toBe(test2.id);
  expect(test1.id).not.toBe(test3.id);
  expect(test1.id).toBe(test4.id);
});
