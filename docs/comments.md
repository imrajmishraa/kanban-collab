# Comments

Threaded comments with likes and dislikes, for cards.

The brief described a YouTube-style system on MySQL. This app runs on MongoDB,
so the two tables became two collections with the same semantics rather than
adding a second database to a running service. The MySQL equivalent is at the
bottom if you ever move.

## Collections

`comments`

| field | type | notes |
| --- | --- | --- |
| `_id` | ObjectId | doubles as the pagination cursor, since ObjectIds sort by creation time |
| `workspaceId` | ObjectId | copied from the card, so membership checks need no board round-trip |
| `cardId` | ObjectId | the card this thread belongs to (the brief's `video_id`) |
| `userId` | ObjectId | author |
| `text` | string | 1 to 5000 characters, trimmed |
| `parentId` | ObjectId \| null | null for a top-level comment; any comment id for a reply, so depth is unlimited |
| `likeCount` | number | denormalised, never counted at read time |
| `dislikeCount` | number | denormalised |
| `createdAt` / `updatedAt` | Date | Mongoose timestamps |

`commentlikes`

| field | type | notes |
| --- | --- | --- |
| `_id` | ObjectId | |
| `commentId` | ObjectId | |
| `userId` | ObjectId | |
| `action` | 1 \| -1 | 1 like, -1 dislike |
| `createdAt` / `updatedAt` | Date | |

Unique index on `(commentId, userId)`. One row per user per comment is what
makes the vote a toggle rather than a counter.

## Indexes

Created by Mongoose at boot from the schema, or run once by hand:

```js
db.comments.createIndex({ cardId: 1, parentId: 1, createdAt: -1 });
db.comments.createIndex({ parentId: 1, createdAt: -1 });
db.comments.createIndex({ userId: 1, createdAt: -1 });
db.commentlikes.createIndex({ commentId: 1, userId: 1 }, { unique: true });
db.commentlikes.createIndex({ userId: 1 });
```

The first index serves both listings: match `(cardId, parentId)`, then walk
`createdAt`. Without it, a card with many comments scans the collection.

## Endpoints

All require a JWT. All check workspace membership through the card.

| method | path | body / query | returns |
| --- | --- | --- | --- |
| `GET` | `/api/v1/cards/:cardId/comments` | `cursor`, `limit` (default 10, max 50) | `{ comments, nextCursor }`, top-level only, newest first, each with `repliesCount` and the caller's `userAction` |
| `POST` | `/api/v1/cards/:cardId/comments` | `{ text, parentId? }` | `{ comment }`, 201 |
| `GET` | `/api/v1/comments/:commentId/replies` | `cursor`, `limit` | `{ replies, nextCursor }`, direct replies only |
| `GET` | `/api/v1/comments/:commentId` | | `{ comment, replies }`, first page of replies |
| `POST` | `/api/v1/comments/:commentId/like` | `{ action: 1 \| -1 }` | `{ likeCount, dislikeCount, userAction }` |
| `DELETE` | `/api/v1/comments/:commentId/like` | | `{ likeCount, dislikeCount, userAction: 0 }` |
| `DELETE` | `/api/v1/comments/:commentId` | | `{ id }`, also removes replies and their votes |

`userAction` is `1`, `-1` or `0`, so the client can highlight the caller's own
vote without a second request.

### Vote semantics

- no existing row, action `a`: insert, `+1` on `a`'s counter.
- existing row with the same action: delete the row, `-1`. Pressing like twice
  removes the like.
- existing row with the other action: update the row, `-1` on the old counter
  and `+1` on the new one.
- counters are floored at zero on read, so a race can never show `-1`.

The unique index makes a double-tap safe: the second insert fails with
`E11000`, which is caught and treated as already voted.

## Caching

Top-level page one is cached in Redis for 30 seconds:

```
comments:card:{cardId}:v{version}:{limit}
```

`version` lives at `comments:ver:{cardId}` and is incremented on every write
(new comment, new reply, vote, delete). Bumping a counter is cheaper than
tracking which page keys exist, and a stale page can never outlive its version.

Only comment data is cached, never `userAction`, because that is per-user. The
caller's votes are merged in on every request from one indexed query.

## Frontend

`CardComments` renders top-level comments flat. Replies are collapsed behind a
"`N` replies" button that mounts `CommentReplies`, which is the only thing that
fetches them, so a thread nobody opens costs nothing. Voting is one request per
press and the server owns the toggle.

## Scaling notes

- Counts are denormalised on `comments`, so no listing runs `COUNT(*)`.
- `repliesCount` is one aggregate over the page's ids, not per row.
- Authors, votes and reply counts are three batched queries per page,
  independent of page size.
- If likes outgrow a single write path, the next step is to accept the
  `commentlikes` write and apply the counter increment through a queue, which
  this design already allows: the counter is a plain `$inc` on one document.
- Sharding would be on `cardId`, since every query is scoped by card.

## MySQL equivalent

If the service moves to MySQL, the schema maps directly:

```sql
CREATE TABLE comments (
  id            BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  video_id      BIGINT UNSIGNED NOT NULL,
  user_id       BIGINT UNSIGNED NOT NULL,
  parent_id     BIGINT UNSIGNED NULL,
  content       TEXT NOT NULL,
  like_count    INT UNSIGNED NOT NULL DEFAULT 0,
  dislike_count INT UNSIGNED NOT NULL DEFAULT 0,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_comments_parent FOREIGN KEY (parent_id) REFERENCES comments(id) ON DELETE CASCADE,
  INDEX idx_thread (video_id, parent_id, created_at),
  INDEX idx_user (user_id, created_at)
) ENGINE=InnoDB;

CREATE TABLE comment_likes (
  id         BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  comment_id BIGINT UNSIGNED NOT NULL,
  user_id    BIGINT UNSIGNED NOT NULL,
  action     TINYINT NOT NULL CHECK (action IN (1, -1)),
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_vote (comment_id, user_id),
  CONSTRAINT fk_likes_comment FOREIGN KEY (comment_id) REFERENCES comments(id) ON DELETE CASCADE
) ENGINE=InnoDB;
```
