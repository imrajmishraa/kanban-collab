/**
 * One-off backfill for comments created before threading and votes existed.
 *
 * Those documents have no `parentId`, `likeCount` or `dislikeCount`. Reads
 * already default them (`?? 0`), so this is not required for correctness, but
 * it keeps the documents uniform and lets the index on
 * `(cardId, parentId, createdAt)` cover every row.
 *
 * Run once: `npx tsx server/scripts/backfill-comments.ts`
 */
import connectDB from "../src/infrastructure/db/mongoose/dbConnect";
import { CommentModel } from "../src/infrastructure/db/mongoose/schemas";

async function main() {
  await connectDB();

  const missingParent = await CommentModel.updateMany(
    { parentId: { $exists: false } },
    { $set: { parentId: null } },
  );

  const missingLikes = await CommentModel.updateMany(
    { likeCount: { $exists: false } },
    { $set: { likeCount: 0 } },
  );

  const missingDislikes = await CommentModel.updateMany(
    { dislikeCount: { $exists: false } },
    { $set: { dislikeCount: 0 } },
  );

  console.log("parentId:", missingParent.modifiedCount);
  console.log("likeCount:", missingLikes.modifiedCount);
  console.log("dislikeCount:", missingDislikes.modifiedCount);

  await CommentModel.syncIndexes();

  process.exit(0);
}

void main().catch((error) => {
  console.error(error);
  process.exit(1);
});
