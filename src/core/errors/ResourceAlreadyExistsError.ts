export class ResourceAlreadyExistsError extends Error {
  constructor(message: string) {
    super(message);
  }
}
