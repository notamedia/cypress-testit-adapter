export default class WorkitemNotFoundError extends Error {
  constructor(workitemId, autotestId) {
    super(`Workitem with id=${workitemId} or autotest with id=${autotestId} not found`);

    this.workitemId = workitemId;
    this.autotestId = autotestId;
  }
}
