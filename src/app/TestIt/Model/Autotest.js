/**
 * Один автотест из Test IT.
 */
export default class Autotest {
  /**
   * @param {string} id UUID идентификатор теста в TestIT
   * @param {string} externalId Внешний Id теста (то что мы сами генерируем
   * @param {string} projectId UUID проекта, в котором находится этот автотест
   * @param {string} title Название теста (полное)
   * @param {string} namespace
   * @param {string} classname
   */
  constructor(id, externalId, projectId, title, namespace, classname) {
    this.id = id;
    this.externalId = externalId;
    this.projectId = projectId;
    this.title = title;
    this.namespace = namespace;
    this.classname = classname;
  }
}
