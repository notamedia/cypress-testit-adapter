export default class AutotestNotFoundError extends Error {
  constructor(externalId) {
    super(`Test with externalId=${externalId} not found`);
  }
}
