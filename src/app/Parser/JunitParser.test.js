import JunitParser from './JunitParser.js';
import ParseError from './Error/ParseError.js';

test.each([
  {
    name: 'invalid data',
    junit: '<?xml version="1.0"?>',
  },
  {
    name: 'invalid elements',
    junit: '<?xml version="1.0"?><a><b/></a>',
  },
  {
    name: 'missed any testsuite',
    junit: '<?xml version="1.0"?><testsuites failures="0" errors="0" tests="0" />',
  },
  {
    name: 'invalid first testsuite',
    junit: '<?xml version="1.0"?><testsuites failures="0" errors="0" tests="0"><testsuite name="test1" tests="0" time="0.0000" failures="0"/><testsuite name="test2" tests="0" time="0.0000" failures="0"/></testsuites>',
  },
])('fail validation ($name)', ({ junit }) => {
  expect(() => {
    const parser = new JunitParser();
    parser.parse(junit);
  }).toThrow(ParseError);
});

test('tests extraction', () => {
  const junit = `<?xml version="1.0"?>
    <testsuites>
      <testsuite name="root suite" time="0.0" file="a/b/Test1.spec.js"/>
      <testsuite name="empty suite" time="0.0"/>
      <testsuite name="root suite" time="0.0" file="a/b/Test2.spec.js"/>
      <testsuite name="empty suite" time="0.0"/>
      <testsuite name="full suite with failure tests" time="0.0">
        <testcase name="Test1, not failure" time="0.0" classname="test1 short title"/>
        <testcase name="Test2, failure" time="0.0" classname="test2 short title">
          <failure />
        </testcase>
      </testsuite>
      <testsuite name="full suite without failure tests" time="0.0">
        <testcase name="Test3 full title" time="0.0" classname="test3 short title"/>
      </testsuite>
    </testsuites>`;

  const parser = new JunitParser();
  parser.parse(junit);
  const tests = parser.getTests();

  expect(tests).toHaveLength(3);
  expect(tests[0].executionTime).toBe(0);
  expect(tests[0].filepath).toBe('a/b/Test2.spec.js');
  expect(tests[0].isFailure).toBeFalsy();
  expect(tests[0].title).toBe('Test1, not failure');
  expect(tests[1].executionTime).toBe(0);
  expect(tests[1].filepath).toBe('a/b/Test2.spec.js');
  expect(tests[1].isFailure).toBeTruthy();
  expect(tests[1].title).toBe('Test2, failure');
  expect(tests[2].executionTime).toBe(0);
  expect(tests[2].filepath).toBe('a/b/Test2.spec.js');
  expect(tests[2].isFailure).toBeFalsy();
  expect(tests[2].title).toBe('Test3 full title');
});
