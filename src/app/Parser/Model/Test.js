/**
 * Выполненный тест.
 */
export default class Test {
  /**
   * @param {string} title Название теста
   * @param {number} executionTime Время выполнения, в секундах
   * @param {string} filepath Путь до файла с тестом
   * @param {boolean} isFailure Признак неуспешного выполнения
   */
  constructor(title, executionTime, filepath, isFailure) {
    this.title = title;
    this.filepath = filepath;
    this.executionTime = executionTime;
    this.isFailure = isFailure;
  }

  /**
   * Id теста (cyrb53).
   *
   * @see https://gist.github.com/feeedback/e6d137d3f54b1aa0310d690daadfaf28
   *
   * @return {string}
   */
  get id() {
    const uniqueName = this.filepath + this.title;

    const A = 2654435761;
    const B = 1597334677;
    const C = 2246822507;
    const D = 3266489909;
    const E = 4294967296;
    const F = 2097151;
    const seed = 0;

    let h1 = 0xdeadbeef ^ seed;
    let h2 = 0x41c6ce57 ^ seed;

    for (let index = 0, char; index < uniqueName.length; index++) {
      char = uniqueName.charCodeAt(index);

      h1 = Math.imul(h1 ^ char, A);
      h2 = Math.imul(h2 ^ char, B);
    }

    h1 = Math.imul(h1 ^ (h1 >>> 16), C) ^ Math.imul(h2 ^ (h2 >>> 13), D);
    h2 = Math.imul(h2 ^ (h2 >>> 16), C) ^ Math.imul(h1 ^ (h1 >>> 13), D);

    return (E * (F & h2) + (h1 >>> 0)).toString();
  }
}
