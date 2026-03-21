-- Space-level roles; drop project-level membership
CREATE TYPE "SpaceRole" AS ENUM ('VIEWER', 'WRITER');

ALTER TABLE "SpaceMember" ADD COLUMN "role" "SpaceRole" NOT NULL DEFAULT 'VIEWER';

UPDATE "SpaceMember" AS sm
SET "role" = 'WRITER'
FROM "Space" AS s
WHERE sm."spaceId" = s."id" AND sm."userId" = s."ownerId";

ALTER TABLE "Notification" ALTER COLUMN "projectId" DROP NOT NULL;
ALTER TABLE "Notification" ALTER COLUMN "environmentId" DROP NOT NULL;
ALTER TABLE "Notification" ALTER COLUMN "secretKey" DROP NOT NULL;

ALTER TABLE "Notification" ADD COLUMN "metadata" JSONB;

ALTER TYPE "NotificationType" ADD VALUE 'SPACE_INVITE';
ALTER TYPE "NotificationType" ADD VALUE 'PROJECT_CREATED';
ALTER TYPE "NotificationType" ADD VALUE 'PROJECT_UPDATED';
ALTER TYPE "NotificationType" ADD VALUE 'PROJECT_DELETED';
ALTER TYPE "NotificationType" ADD VALUE 'ENVIRONMENT_UPDATED';
ALTER TYPE "NotificationType" ADD VALUE 'SECRETS_IMPORTED';

DROP TABLE "ProjectMember";

DROP TYPE "ProjectRole";
