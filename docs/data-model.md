# Data Model

The persistence layer is MongoDB, modelled with Mongoose. All definitions live in one file — **`server/src/infrastructure/db/mongoose/schemas.ts`** — and every model uses `{ timestamps: true }` (`createdAt` / `updatedAt`).

MongoDB has **no enforced foreign keys**: the links below are `ObjectId` references (`ref`) except where marked *embedded* (a sub-document stored inside its parent).

## ER diagram

```mermaid
erDiagram
    USER ||--o{ WORKSPACE : "owns (ownerId)"
    USER }o--o{ WORKSPACE : "is a member (members[])"
    USER ||--o{ SESSION : "authenticates"
    USER ||--|| NOTIFICATION_PREFERENCE : "has"
    USER ||--o{ NOTIFICATION : "receives"
    USER ||--o{ NOTIFICATION : "acts as (actorId)"
    USER ||--o{ NOTE : "authors"
    USER ||--o{ COMMENT : "writes"
    USER ||--o{ ACTIVITY_LOG : "performs"
    USER }o--o{ CARD : "assigned to (members[])"

    USER ||--o{ AUTH_PROVIDER_LINK : "embedded"

    WORKSPACE ||--o{ WORKSPACE_MEMBER : "embedded"
    WORKSPACE ||--o{ BOARD : "contains"
    WORKSPACE ||--o{ NOTE : "contains"
    WORKSPACE ||--o{ CARD : "denormalized workspaceId"

    BOARD ||--o{ COLUMN : "contains"
    BOARD ||--o{ CARD : "denormalized boardId"
    BOARD ||--o{ ACTIVITY_LOG : "logged on"
    BOARD ||--o| YJS_UPDATE : "snapshot (docName = boardId)"
    BOARD ||--o{ NOTE : "optionally attached"

    COLUMN ||--o{ CARD : "contains"

    CARD ||--o{ COMMENT : "has"
    CARD ||--o{ CHECKLIST_ITEM : "embedded"
    CARD ||--o{ CUSTOM_FIELD_VALUE : "embedded"
    CARD ||--o{ CARD_ATTACHMENT : "embedded"

    NOTIFICATION }o--o| BOARD : "optional"
    NOTIFICATION }o--o| CARD : "optional"
    NOTIFICATION }o--o| COMMENT : "optional"
    NOTIFICATION ||--|| NOTIFICATION_CHANNELS : "embedded"

    NOTIFICATION_PREFERENCE ||--|| QUIET_HOURS : "embedded"

    USER {
        ObjectId _id PK
        string email UK "unique, lowercase"
        boolean emailVerified
        string passwordHash "select:false"
        string fullName
        string avatarUrl
        Date createdAt
        Date updatedAt
    }
    AUTH_PROVIDER_LINK {
        string provider "password | google | github"
        string providerId
        string email
        Date linkedAt
    }
    WORKSPACE {
        ObjectId _id PK
        string name
        string slug UK "unique, lowercase"
        string description
        ObjectId ownerId FK
        string status "active | deletion_pending"
        Date deletionRequestedAt
        Date deletionScheduledFor
        Date createdAt
        Date updatedAt
    }
    WORKSPACE_MEMBER {
        ObjectId userId FK
        string role "owner | admin | member | guest"
    }
    BOARD {
        ObjectId _id PK
        ObjectId workspaceId FK
        string name
        string description
        string backgroundColor
        string coverImageUrl
        string visibility "private | public | workspace"
        Date createdAt
        Date updatedAt
    }
    COLUMN {
        ObjectId _id PK
        ObjectId workspaceId FK
        ObjectId boardId FK
        string name
        number orderIndex
        Date createdAt
        Date updatedAt
    }
    CARD {
        ObjectId _id PK
        ObjectId workspaceId FK
        ObjectId columnId FK
        ObjectId boardId FK
        string title
        string description
        number orderIndex
        Date dueDate
        ObjectId[] members FK "array of User"
        string[] labels
        boolean isArchived
        Date createdAt
        Date updatedAt
    }
    CHECKLIST_ITEM {
        string title
        boolean isCompleted
    }
    CUSTOM_FIELD_VALUE {
        string fieldId
        Mixed value
    }
    CARD_ATTACHMENT {
        ObjectId _id PK
        string url
        string name
        string fileType
        number size
        ObjectId uploadedBy FK
        Date createdAt
    }
    COMMENT {
        ObjectId _id PK
        ObjectId workspaceId FK
        ObjectId cardId FK
        ObjectId userId FK
        string text
        Date createdAt
        Date updatedAt
    }
    ACTIVITY_LOG {
        ObjectId _id PK
        ObjectId workspaceId FK
        ObjectId boardId FK
        ObjectId userId FK
        string actionType "CARD_* | COMMENT_* | COLUMN_* | BOARD_* | MEMBER_*"
        Mixed details
        Date createdAt
        Date updatedAt
    }
    SESSION {
        ObjectId _id PK
        ObjectId userId FK
        string userEmail
        string userFullName
        string jti UK "unique"
        string previousJti
        Date previousJtiExpiresAt
        boolean rememberMe
        string userAgent
        string ipAddress
        string deviceId
        string platform "web | ios | android | desktop"
        Date revokedAt
        Date expiresAt "TTL index"
        Date lastUsedAt
        Date createdAt
        Date updatedAt
    }
    YJS_UPDATE {
        ObjectId _id PK
        ObjectId workspaceId FK "optional"
        ObjectId boardId FK "optional"
        string docName UK "unique (= boardId)"
        Buffer update
        Date createdAt
        Date updatedAt
    }
    NOTIFICATION {
        ObjectId _id PK
        ObjectId userId FK
        ObjectId actorId FK
        ObjectId workspaceId FK
        ObjectId boardId FK "optional"
        ObjectId cardId FK "optional"
        ObjectId commentId FK "optional"
        string type "NOTIFICATION_TYPES"
        string title
        string message
        Mixed metadata
        boolean isRead
        Date readAt "TTL 90d when read"
        string dedupeKey
        Date createdAt
        Date updatedAt
    }
    NOTIFICATION_CHANNELS {
        boolean inApp
        boolean email
        boolean push
        boolean sms
    }
    NOTIFICATION_PREFERENCE {
        ObjectId _id PK
        ObjectId userId FK "unique"
        Mixed preferences "Record<type, channels>"
        string digestFrequency "off | daily | weekly"
        Date createdAt
        Date updatedAt
    }
    QUIET_HOURS {
        string start
        string end
        string timezone
        boolean enabled
    }
    NOTE {
        ObjectId _id PK
        ObjectId workspaceId FK
        ObjectId boardId FK "nullable"
        ObjectId userId FK
        string title
        string body
        boolean isPinned
        Date createdAt
        Date updatedAt
    }
```

## Collections

| # | Collection | Purpose | Key references |
|---|---|---|---|
| 1 | `users` | Accounts + linked OAuth providers | — |
| 2 | `workspaces` | Top-level container; embeds `members[]` | `ownerId` → User, `members[].userId` → User |
| 3 | `boards` | Kanban boards inside a workspace | `workspaceId` → Workspace |
| 4 | `columns` | Ordered lists inside a board | `workspaceId`, `boardId` |
| 5 | `cards` | Work items; embeds checklists, custom fields, attachments | `workspaceId`, `columnId`, `boardId`, `members[]` → User |
| 6 | `comments` | Card comments | `workspaceId`, `cardId`, `userId` |
| 7 | `activitylogs` | Audit trail per board | `workspaceId`, `boardId`, `userId` |
| 8 | `sessions` | Refresh-token sessions (rotation + reuse detection) | `userId` → User |
| 9 | `yjsupdates` | Persisted Yjs CRDT snapshot per board | `docName` (= boardId), optional `boardId`/`workspaceId` |
| 10 | `notifications` | In-app/email/push/sms notifications | `userId`, `actorId`, optional `workspaceId`/`boardId`/`cardId`/`commentId` |
| 11 | `notificationpreferences` | Per-user channel + digest settings | `userId` (unique) |
| 12 | `notes` | Free-form notes (workspace- or board-scoped) | `workspaceId`, optional `boardId`, `userId` |

## Relationship notes

- **Ownership vs membership.** `Workspace.ownerId` is a single owner; `Workspace.members[]` is an embedded array of `{ userId, role }` — the many-to-many between User and Workspace. Roles: `owner | admin | member | guest`.
- **Hierarchy.** Workspace → Board → Column → Card. `Card` carries **denormalized** `workspaceId` and `boardId` (in addition to `columnId`) so board/workspace queries don't need to walk the tree.
- **Card members** is a many-to-many (`Card.members[]` → User) for assignment.
- **Embedded vs referenced.** Embedded sub-documents (no separate collection, `_id: false` unless noted): `User.authProviders[]`, `Workspace.members[]`, `Card.checklists[]`, `Card.customFieldValues[]`, `Card.attachments[]`, `Notification.channels`, `NotificationPreference.quietHours`, `NotificationPreference.preferences`. Everything else is referenced by `ObjectId`.
- **`YjsUpdate`** is keyed by `docName` (the board id) and holds the binary CRDT snapshot — the persistence target for the real-time collaboration layer (see [Real-time Collaboration](realtime-collaboration.md)).
- **`Session`** models refresh-token rotation: `jti` (current), `previousJti` + `previousJtiExpiresAt` (grace window), `revokedAt`, and a TTL on `expiresAt`.

## Indexes

- **TTL:** `Session.expiresAt` (expire at 0s) and `Notification.readAt` (delete 90 days after read, only when `isRead: true`).
- **Unique:** `User.email`, `Workspace.slug`, `Session.jti`, `YjsUpdate.docName`, `NotificationPreference.userId`, and `Notification { userId, dedupeKey }` (sparse).
- **Compound:** `Card { boardId, isArchived, orderIndex }`, `Card { columnId, orderIndex }`, `Column { boardId, orderIndex }`, `Comment { cardId, createdAt }`, `ActivityLog { boardId, createdAt }`, `Notification { userId, isRead, createdAt }`, `Workspace { status, deletionScheduledFor }`.
- **Text:** `Card` has a full-text index on `{ title, description }` (backs `GET /cards/search`).
- **Sparse/partial:** `User { authProviders.provider, authProviders.providerId }` (partial on string provider ids), `Session { previousJti, previousJtiExpiresAt }` (sparse).
