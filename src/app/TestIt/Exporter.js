import AutotestNotFoundError from './Error/AutotestNotFoundError.js';
import WorkitemNotFoundError from './Error/WorkitemNotFoundError.js';
import logger from '../Logger.js';

const TESTIT_AUTOTESTS_ID_PREFIX = '#';

/**
 * Экспортёр тестов в Test IT.
 */
export default class Exporter {
  /**
   * @param {Client} client
   * @param {string} namespacePrefix
   */
  constructor(client, namespacePrefix = '') {
    this.client = client;
    this.namespacePrefix = namespacePrefix;
  }

  /**
   * Экспортирование одного теста.
   *
   * @param {Array<Test>} tests
   */
  async export(tests) {
    logger.info('[Exporter] Export started...');
    logger.debug('[Exporter] Received %d test objects', tests.length);
    logger.debug('[Exporter] Not failed only %d tests', tests.filter((test) => !test.isFailure).length);

    // Специально сделано не параллельно, иначе под натиском запросов TestIT может начать отвечать странными ошибками
    for (let i = 0; i < tests.length; i++) {
      if (!this.isNeedProcess(tests[i])) {
        continue;
      }

      const test = tests[i];
      const namespace = this.getNamespace(test.filepath);
      const classname = this.getClassname(test.filepath);
      const workitemIds = this.extractWorkitemIds(test);
      let autotest;

      logger.debug('[Exporter] Export "%s" test', test.title);

      try {
        autotest = await this.client.getAutotest(test.id);
        logger.debug('[Exporter] Autotest with external id=%s is exists', test.id);

        // Обновляем автотест
        // Обновление пока отключено, потому что нечего обновлять (при смене названия меняется внешний ID, и тест будет создан заново)
        // logger.debug('[Exporter] Autotest with external id=%d is exists, update it...', test.id);
        // await this.client.updateAutotest(autotest.id, test.id, test.title, namespace, classname);
      } catch (e) {
        if (!(e instanceof AutotestNotFoundError)) {
          throw e;
        }

        // Создаём автотест
        logger.debug('[Exporter] Autotest with external id=%d is not exists, creating new...', test.id);
        autotest = await this.client.createAutotest(test.id, test.title, namespace, classname);
      }

      await Promise.all(workitemIds.map(async (workitemId) => {
        try {
          await this.client.linkToWorkItem(autotest.id, workitemId);
          logger.debug('[Exporter] Autotest with external id=%d was linked to workitem with id=%s', test.id, workitemId);
        } catch (e) {
          if (!(e instanceof WorkitemNotFoundError)) {
            throw e;
          }

          logger.error(`Workitem with id=${e.workitemId} or autotest with id=${e.autotestId} not found. Linking was skipped`);
        }
      }));
    }

    logger.info('[Exporter] Export finished');
  }

  /**
   * Определение, нужно ли обработать этот тест.
   *
   * @param {Test} test
   *
   * @return {boolean}
   */
  isNeedProcess(test) {
    return !test.isFailure && this.extractWorkitemIds(test).length > 0;
  }

  /**
   * Выборка всех ID автотестов в TestIT из тестов приложения.
   *
   * @protected
   *
   * @param {Test} test
   *
   * @return {array<string>}
   */
  extractWorkitemIds(test) {
    const pattern = new RegExp(`${TESTIT_AUTOTESTS_ID_PREFIX}\\d+`, 'g');

    return (test.title.match(pattern) || []).map((id) => id.replace(TESTIT_AUTOTESTS_ID_PREFIX, ''));
  }

  /**
   * Получение namespace для TestIT из пути к файлу с тестами в проекте.
   * - Из пути будет вырезано название файла
   * - Из пути будет вырезан префикс, если он задан
   * - Namespace не будет начинаться с "/"
   *
   * @protected
   *
   * @param {string} filepath
   *
   * @return {string}
   */
  getNamespace(filepath) {
    let namespace = '';

    if (filepath.lastIndexOf('/') !== -1) {
      namespace = filepath.substr(0, filepath.lastIndexOf('/'));
    }
    if (this.namespacePrefix) {
      namespace = namespace.replace(this.namespacePrefix, '');
    }
    if (namespace[0] === '/') {
      namespace = namespace.substr(1);
    }

    return namespace;
  }

  /**
   * Получение названия класса для TestIT из пути к тесту в приложении (по названию файла с тестом).
   * Из названия файла будет вырезано расширение и постфикс, то есть: SomeTest.spec.js -> SomeTest
   *
   * @protected
   *
   * @param {string} filepath
   *
   * @return {string}
   */
  getClassname(filepath) {
    return filepath.replace(/^.*\/([^.]+).*$/, '$1');
  }
}
