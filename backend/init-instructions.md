Prompt 1 — Project skeleton + Docker + Prisma setupYou are setting up a NestJS backend project from scratch for a product called EnvSpace.

## Task
Bootstrap the full project skeleton with Docker, Prisma, and all required packages.

## Steps

### 1. Create the NestJS project
Run: `nest new api --package-manager npm --skip-git`
Work inside the `api/` folder for everything below.

### 2. Install all packages
Run:npm install 
@nestjs/config 
@nestjs/jwt 
@nestjs/passport 
@nestjs/throttler 
@prisma/client 
prisma 
passport 
passport-jwt 
svix 
@clerk/backend 
libsodium-wrappers 
resend 
class-validator 
class-transformer 
helmet 
compression 
bcryptjsnpm install --save-dev 
@types/passport-jwt 
@types/libsodium-wrappers 
@types/bcryptjs 
@types/compression 
prisma

### 3. Create docker-compose.yml in the root api/ folder
```yamlversion: '3.8'
services:
postgres:
image: postgres:16-alpine
container_name: envspace_db
restart: unless-stopped
environment:
POSTGRES_USER: envspace
POSTGRES_PASSWORD: envspace_secret
POSTGRES_DB: envspace
ports:
- '5432:5432'
volumes:
- pgdata:/var/lib/postgresql/datavolumes:
pgdata:

### 4. Create .env in api/DATABASE_URL="postgresql://envspace:envspace_secret@localhost:5432/envspace"
CLERK_SECRET_KEY=your_clerk_secret_key
CLERK_WEBHOOK_SECRET=your_clerk_webhook_secret
MASTER_ENCRYPTION_KEY=generate_a_32byte_hex_string_here
RESEND_API_KEY=your_resend_api_key
JWT_SECRET=your_jwt_secret
PORT=4000

Create .env.example with the same keys but empty values.

### 5. Initialize Prisma
Run: `npx prisma init`
Set the DATABASE_URL in prisma/schema.prisma to use the env var.

### 6. Write the full Prisma schema at prisma/schema.prisma
```prismagenerator client {
provider = "prisma-client-js"
}datasource db {
provider = "postgresql"
url      = env("DATABASE_URL")
}model User {
id        String   @id @default(cuid())
clerkId   String   @unique
email     String   @unique
name      String?
avatarUrl String?
createdAt DateTime @default(now())
updatedAt DateTime @updatedAtownedSpaces    Space[]        @relation("SpaceOwner")
spaceMemberships SpaceMember[]
projectMemberships ProjectMember[]
invitesSent    SpaceMember[]  @relation("InvitedBy")
notifications  Notification[]
createdProjects Project[]
}model Space {
id          String   @id @default(cuid())
name        String
description String?
encDek      String
ownerId     String
createdAt   DateTime @default(now())
updatedAt   DateTime @updatedAtowner      User          @relation("SpaceOwner", fields: [ownerId], references: [id])
members    SpaceMember[]
projects   Project[]
visibilityRules SpaceVisibilityRule[]
}model SpaceMember {
id        String   @id @default(cuid())
spaceId   String
userId    String
invitedById String?
createdAt DateTime @default(now())space     Space  @relation(fields: [spaceId], references: [id], onDelete: Cascade)
user      User   @relation(fields: [userId], references: [id], onDelete: Cascade)
invitedBy User?  @relation("InvitedBy", fields: [invitedById], references: [id])@@unique([spaceId, userId])
}model SpaceVisibilityRule {
id      String          @id @default(cuid())
spaceId String
envType EnvironmentType
access  AccessLevel     @default(ALL)space Space @relation(fields: [spaceId], references: [id], onDelete: Cascade)@@unique([spaceId, envType])
}model Project {
id          String   @id @default(cuid())
spaceId     String
name        String
description String?
createdById String
createdAt   DateTime @default(now())
updatedAt   DateTime @updatedAtspace        Space           @relation(fields: [spaceId], references: [id], onDelete: Cascade)
createdBy    User            @relation(fields: [createdById], references: [id])
members      ProjectMember[]
environments Environment[]
}model ProjectMember {
id        String      @id @default(cuid())
projectId String
userId    String
role      ProjectRole @default(VIEWER)
createdAt DateTime    @default(now())project Project @relation(fields: [projectId], references: [id], onDelete: Cascade)
user    User    @relation(fields: [userId], references: [id], onDelete: Cascade)@@unique([projectId, userId])
}model Environment {
id          String          @id @default(cuid())
projectId   String
name        String
type        EnvironmentType
description String?
githubRepo  String?
createdAt   DateTime        @default(now())
updatedAt   DateTime        @updatedAtproject Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
secrets Secret[]@@unique([projectId, name])
}model Secret {
id            String   @id @default(cuid())
environmentId String
key           String
encryptedValue String
iv            String
createdAt     DateTime @default(now())
updatedAt     DateTime @updatedAtenvironment Environment @relation(fields: [environmentId], references: [id], onDelete: Cascade)@@unique([environmentId, key])
}model Notification {
id            String           @id @default(cuid())
userId        String
spaceId       String
projectId     String
environmentId String
secretKey     String
type          NotificationType
actorName     String
read          Boolean          @default(false)
createdAt     DateTime         @default(now())user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}enum EnvironmentType {
PRODUCTION
STAGING
DEVELOPMENT
QC
OTHER
}enum ProjectRole {
WRITER
VIEWER
}enum AccessLevel {
OWNER_ONLY
WRITERS
ALL
}enum NotificationType {
SECRET_ADDED
SECRET_UPDATED
SECRET_DELETED
ENVIRONMENT_CREATED
ENVIRONMENT_DELETED
}

### 7. Set up the folder structure inside api/src/
Create these empty folders (just add a .gitkeep in each):src/
auth/
spaces/
projects/
environments/
secrets/
members/
notifications/
crypto/
prisma/
common/
decorators/
guards/
filters/
interceptors/
pipes/

### 8. Update tsconfig.json in api/
Make sure it has:
```json{
"compilerOptions": {
"strictNullChecks": true,
"noImplicitAny": true,
"emitDecoratorMetadata": true,
"experimentalDecorators": true,
"strict": false
}
}

### 9. Start Docker and run the first migration
Run:docker-compose up -d
npx prisma migrate dev --name init
npx prisma generate

## Report
When done, reply with this exact format:

**Prompt 1 Report**
- [ ] NestJS project created
- [ ] All packages installed (list any that failed)
- [ ] docker-compose.yml created
- [ ] .env and .env.example created
- [ ] Prisma schema written with all models
- [ ] Folder structure created
- [ ] Docker container running (confirm with `docker ps`)
- [ ] Migration ran successfully
- [ ] Prisma client generated
- **Blockers:** (list anything that failed or needs attention)
- **Current state:** (one line describing what exists now)