import fetch from 'node-fetch';
import AutotestNotFoundError from './Error/AutotestNotFoundError.js';
import WorkitemNotFoundError from './Error/WorkitemNotFoundError.js';
import ApiError from './Error/ApiError.js';
import logger from '../Logger.js';
import Autotest from './Model/Autotest.js';

const TIMEOUT = 5000;

/**
 * Клиент для работы с API в TestIt.
 */
export default class Client {
  constructor(baseurl, projectId, token) {
    this.baseurl = baseurl;
    this.projectId = projectId;
    this.token = token;
  }

  /**
   * Проверка, доступно ли API.
   *
   * @return {Promise<void>}
   */
  async check() {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => {
        controller.abort();
      }, TIMEOUT);
      await fetch(new URL('/version.json', this.baseurl).toString(), { signal: controller.signal });
      clearTimeout(timeout);
      logger.debug('[Test IT] API is available');
    } catch (e) {
      throw new Error(`Cannot connect to TestIt: ${e.message}`);
    }
  }

  /**
   * Получение автотеста по его внешнему ID.
   *
   * @param {string} externalId
   *
   * @return {Promise<Autotest>}
   */
  async getAutotest(externalId) {
    const url = new URL('/api/v2/autoTests', this.baseurl);
    url.searchParams.set('projectId', this.projectId);
    url.searchParams.set('externalId', externalId);
    url.searchParams.set('includeSteps', 'false');
    url.searchParams.set('includeLabels', 'false');

    const controller = new AbortController();
    const timeout = setTimeout(() => {
      controller.abort();
    }, TIMEOUT);

    logger.debug('[Test IT] Getting autotest with externalId=%d', externalId);

    const response = await fetch(url.toString(), {
      signal: controller.signal,
      headers: {
        Authorization: `PrivateToken ${this.token}`,
      },
    });

    clearTimeout(timeout);

    if (response.status !== 200) {
      throw new ApiError(`[Test IT] There was some error with the API, check the result: ${await response.text()}`);
    }

    const data = await response.json();
    if (data.length < 1) {
      throw new AutotestNotFoundError(externalId);
    }

    return new Autotest(data[0].id, data[0].externalId, data[0].projectId, data[0].title, data[0].namespace, data[0].classname);
  }

  /**
   * Создание нового автотеста.
   *
   * @param {string} externalId
   * @param {string} title
   * @param {string} namespace
   * @param {string} classname
   *
   * @return {Promise<Autotest>}
   */
  async createAutotest(externalId, title, namespace, classname) {
    logger.debug('[Test IT] Creating autotest with externalId=%d', externalId);

    const controller = new AbortController();
    const timeout = setTimeout(() => {
      controller.abort();
    }, TIMEOUT);

    const response = await fetch(new URL('/api/v2/autoTests', this.baseurl).toString(), {
      method: 'post',
      body: JSON.stringify({
        externalId,
        projectId: this.projectId,
        name: title,
        title,
        namespace,
        classname,
        isFlaky: false,
        shouldCreateWorkItem: false,
        labels: [{ name: 'Cypress' }],
      }),
      headers: {
        'Content-Type': 'application/json',
        Authorization: `PrivateToken ${this.token}`,
      },
    });

    clearTimeout(timeout);

    if (response.status !== 201) {
      throw new ApiError(`There was some error with the API, check the result: ${await response.text()}`);
    }

    const data = await response.json();

    return new Autotest(data.id, data.externalId, data.projectId, data.title, data.namespace, data.classname);
  }

  /**
   * Обновление существующего автотеста.
   *
   * @param {string} id
   * @param {string} externalId
   * @param {string} title
   * @param {string} namespace
   * @param {string} classname
   *
   * @return {Promise<void>}
   */
  async updateAutotest(id, externalId, title, namespace, classname) {
    logger.debug('[Test IT] Updating autotest with id=%s externalId=%d', id, externalId);

    const controller = new AbortController();
    const timeout = setTimeout(() => {
      controller.abort();
    }, TIMEOUT);

    const response = await fetch(new URL('/api/v2/autoTests', this.baseurl).toString(), {
      method: 'put',
      body: JSON.stringify({
        id,
        externalId,
        projectId: this.projectId,
        name: title,
        title,
        namespace,
        classname,
        isFlaky: false,
        shouldCreateWorkItem: false,
        labels: [{ name: 'Cypress' }],
      }),
      headers: {
        'Content-Type': 'application/json',
        Authorization: `PrivateToken ${this.token}`,
      },
    });

    clearTimeout(timeout);

    if (response.status !== 204) {
      throw new ApiError(`There was some error with the API, check the result: ${await response.text()}`);
    }
  }

  /**
   * Создания связи между автотестом и тестом (workitem) в самом TestIT.
   *
   * @param {string} autotestId Id автотеста (UUID)
   * @param {string} workitemId Id теста в TestIT (UUID)
   *
   * @return {Promise<void>}
   */
  async linkToWorkItem(autotestId, workitemId) {
    logger.debug('[Test IT] Creating link between autotest=%s and workitem=%s', autotestId, workitemId);

    const controller = new AbortController();
    const timeout = setTimeout(() => {
      controller.abort();
    }, TIMEOUT);

    const response = await fetch(new URL(`/api/v2/autoTests/${autotestId}/workItems`, this.baseurl).toString(), {
      method: 'post',
      body: JSON.stringify({
        id: workitemId,
      }),
      headers: {
        'Content-Type': 'application/json',
        Authorization: `PrivateToken ${this.token}`,
      },
    });

    clearTimeout(timeout);

    if (response.status === 404) {
      throw new WorkitemNotFoundError(workitemId, autotestId);
    }

    if (response.status !== 204) {
      throw new ApiError(`[Test IT] There was some error with the API, check the result: ${await response.text()}`);
    }
  }
}
