import { XMLParser } from 'fast-xml-parser';
import logger from '../Logger.js';
import Test from './Model/Test.js';
import ParseError from './Error/ParseError.js';

const ATTRIBUTE_FILEPATH = '@_file';
const ATTRIBUTE_FULLNAME = '@_name'; // Полное название - это комбинация из разных корневых describe блоков
const ATTRIBUTE_NAME = '@_classname'; // Название только этого тест кейса
const ATTRIBUTE_TIME = '@_time';

/**
 * Парсер Junit отчёта для получения списка тестов.
 */
export default class JunitParser {
  constructor() {
    this.parser = new XMLParser({
      ignoreAttributes: false,
    });
  }

  /**
   * Парсинг JUnit отчёта.
   *
   * @param {string} report
   */
  parse(report) {
    this.parsed = this.parser.parse(report);
    this.validate();

    logger.debug('[JUnit] File parsed, found %d test suites', this.parsed.testsuites.testsuite.length);
  }

  /**
   * Валидация полученного результата.
   * @protected
   */
  validate() {
    if (!this.parsed.testsuites) {
      throw new ParseError('JUnit report must contains root testsuites element');
    }
    if (!this.parsed.testsuites.testsuite) {
      throw new ParseError('JUnit report must contains at least one testsuite element');
    }
    if (this.parsed.testsuites.testsuite.length > 0 && !this.parsed.testsuites.testsuite[0][ATTRIBUTE_FILEPATH]) {
      throw new ParseError('First test suite must be root element with filename, is it JUnit from Cypress?');
    }
  }

  /**
   * @return Test[]
   */
  getTests() {
    const tests = [];

    if (!Array.isArray(this.parsed.testsuites.testsuite)) {
      return [];
    }

    // Cypress генерирует JUnit отчёт с последовательными элементами testsuite:
    // - Корневой testsuite (Root Suite) с названием файла
    // - Прочие testsuite с testcase из этого файла
    // - И так по кругу
    // Стоит иметь в виду, что хуки Cypress записывает как отдельные тесткейсы - их надо исключать
    let filepath;
    this.parsed.testsuites.testsuite.forEach((item) => {
      if (item[ATTRIBUTE_FILEPATH]) {
        filepath = item[ATTRIBUTE_FILEPATH];
        return;
      }

      if (!item.testcase) {
        return;
      }

      let testcases = [];
      if (!Array.isArray(item.testcase)) {
        testcases.push(item.testcase);
      } else {
        testcases = item.testcase;
      }

      testcases.forEach((testcase) => {
        if (this.isHook(testcase)) {
          return;
        }

        tests.push(new Test(testcase[ATTRIBUTE_FULLNAME], parseFloat(testcase[ATTRIBUTE_TIME]), filepath, testcase.failure !== undefined));
      });
    });

    logger.debug('[JUnit] Created %d test objects', tests.length);

    return tests;
  }

  /**
   * Проверка, является ли тест кейс хуком.
   *
   * @protected
   *
   * @param {Object} testcase
   *
   * @return {boolean}
   */
  isHook(testcase) {
    return testcase[ATTRIBUTE_NAME] && testcase[ATTRIBUTE_NAME].includes('hook for');
  }
}
