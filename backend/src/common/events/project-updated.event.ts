export class ProjectUpdatedEvent {
  constructor(
    public readonly spaceId: string,
    public readonly projectId: string,
    public readonly projectName: string,
    public readonly actorId: string,
    public readonly actorName: string,
  ) {}
}
