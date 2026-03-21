export class SecretUpdatedEvent {
  constructor(
    public readonly spaceId: string,
    public readonly projectId: string,
    public readonly projectName: string,
    public readonly environmentId: string,
    public readonly environmentName: string,
    public readonly environmentType: string,
    public readonly secretKey: string,
    public readonly actorId: string,
    public readonly actorName: string,
  ) {}
}
