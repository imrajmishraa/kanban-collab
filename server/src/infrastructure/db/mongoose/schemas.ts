import { Schema, model, Document, Types } from 'mongoose';

// ==========================================
// 1. USER
// ==========================================
export interface IUser extends Document {
  email: string;
  passwordHash: string;
  fullName: string;
  avatarUrl?: string;
  isEmailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  fullName: { type: String, required: true, trim: true },
  avatarUrl: { type: String },
  isEmailVerified: { type: Boolean, default: false }
}, { timestamps: true });

export const UserModel = model<IUser>('User', UserSchema);

// ==========================================
// 2. WORKSPACE
// ==========================================
export interface IWorkspace extends Document {
  name: string;
  slug: string;
  description?: string;
  ownerId: Types.ObjectId;
  members: { userId: Types.ObjectId; role: 'admin' | 'member' | 'guest' }[];
  createdAt: Date;
  updatedAt: Date;
}

const WorkspaceSchema = new Schema<IWorkspace>({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
  description: { type: String },
  ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  members: [{
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    role: { type: String, enum: ['admin', 'member', 'guest'], default: 'member' }
  }]
}, { timestamps: true });

WorkspaceSchema.index({ 'members.userId': 1 });
export const WorkspaceModel = model<IWorkspace>('Workspace', WorkspaceSchema);

// ==========================================
// 3. BOARD
// ==========================================
export interface IBoard extends Document {
  workspaceId: Types.ObjectId;
  name: string;
  description?: string;
  backgroundColor: string;
  coverImageUrl?: string;
  visibility: 'private' | 'public' | 'workspace';
  createdAt: Date;
  updatedAt: Date;
}

const BoardSchema = new Schema<IBoard>({
  workspaceId: { type: Schema.Types.ObjectId, ref: 'Workspace', required: true },
  name: { type: String, required: true, trim: true },
  description: { type: String },
  backgroundColor: { type: String, default: '#2b6cb0' },
  coverImageUrl: { type: String },
  visibility: { type: String, enum: ['private', 'public', 'workspace'], default: 'workspace' }
}, { timestamps: true });

BoardSchema.index({ workspaceId: 1 });
export const BoardModel = model<IBoard>('Board', BoardSchema);

// ==========================================
// 4. COLUMN
// ==========================================
export interface IColumn extends Document {
  boardId: Types.ObjectId;
  name: string;
  orderIndex: number;
  createdAt: Date;
  updatedAt: Date;
}

const ColumnSchema = new Schema<IColumn>({
  boardId: { type: Schema.Types.ObjectId, ref: 'Board', required: true },
  name: { type: String, required: true, trim: true },
  orderIndex: { type: Number, required: true }
}, { timestamps: true });

ColumnSchema.index({ boardId: 1, orderIndex: 1 });
export const ColumnModel = model<IColumn>('Column', ColumnSchema);

// ==========================================
// 5. CARD
// ==========================================
export interface ICard extends Document {
  columnId: Types.ObjectId;
  boardId: Types.ObjectId;
  title: string;
  description: string;
  orderIndex: number;
  dueDate?: Date;
  members: Types.ObjectId[];
  labels: string[];
  checklists: { title: string; isCompleted: boolean }[];
  customFieldValues: { fieldId: string; value: any }[];
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CardSchema = new Schema<ICard>({
  columnId: { type: Schema.Types.ObjectId, ref: 'Column', required: true },
  boardId: { type: Schema.Types.ObjectId, ref: 'Board', required: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  orderIndex: { type: Number, required: true },
  dueDate: { type: Date },
  members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  labels: [{ type: String }],
  checklists: [{
    title: { type: String, required: true },
    isCompleted: { type: Boolean, default: false }
  }],
  customFieldValues: [{
    fieldId: { type: String, required: true },
    value: { type: Schema.Types.Mixed }
  }],
  isArchived: { type: Boolean, default: false }
}, { timestamps: true });

CardSchema.index({ columnId: 1, orderIndex: 1 });
CardSchema.index({ boardId: 1 });
CardSchema.index({ title: 'text', description: 'text' });
export const CardModel = model<ICard>('Card', CardSchema);

// ==========================================
// 6. COMMENT
// ==========================================
export interface IComment extends Document {
  cardId: Types.ObjectId;
  userId: Types.ObjectId;
  text: string;
  createdAt: Date;
  updatedAt: Date;
}

const CommentSchema = new Schema<IComment>({
  cardId: { type: Schema.Types.ObjectId, ref: 'Card', required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true }
}, { timestamps: true });

CommentSchema.index({ cardId: 1, createdAt: -1 });
export const CommentModel = model<IComment>('Comment', CommentSchema);

// ==========================================
// 7. ACTIVITY LOG
// ==========================================
export interface IActivityLog extends Document {
  boardId: Types.ObjectId;
  userId: Types.ObjectId;
  actionType: string;
  details: any;
  createdAt: Date;
  updatedAt: Date;
}

const ActivityLogSchema = new Schema<IActivityLog>({
  boardId: { type: Schema.Types.ObjectId, ref: 'Board', required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  actionType: { type: String, required: true }, // e.g. CARD_MOVE, CARD_CREATE, etc.
  details: { type: Schema.Types.Mixed, required: true }
}, { timestamps: true });

ActivityLogSchema.index({ boardId: 1, createdAt: -1 });
export const ActivityLogModel = model<IActivityLog>('ActivityLog', ActivityLogSchema);

// ==========================================
// 8. SESSION
// ==========================================
export interface ISession extends Document {
  userId: Types.ObjectId;
  refreshTokenHash: string;
  userAgent?: string;
  ipAddress?: string;
  expiresAt: Date;
  lastUsedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const SessionSchema = new Schema<ISession>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  refreshTokenHash: { type: String, required: true, unique: true },
  userAgent: { type: String },
  ipAddress: { type: String },
  expiresAt: { type: Date, required: true },
  lastUsedAt: { type: Date, required: true }
}, { timestamps: true });

// Auto-delete document when expired using MongoDB TTL Index
SessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
SessionSchema.index({ userId: 1 });
export const SessionModel = model<ISession>('Session', SessionSchema);

// ==========================================
// 9. YJS DOCUMENT UPDATES (For Binary CRDT persistence)
// ==========================================
export interface IYjsUpdate extends Document {
  docName: string; // matches room ID/board ID
  update: Buffer;  // raw Uint8Array binary data
  createdAt: Date;
  updatedAt: Date;
}

const YjsUpdateSchema = new Schema<IYjsUpdate>({
  docName: { type: String, required: true, unique: true },
  update: { type: Buffer, required: true }
}, { timestamps: true });

export const YjsUpdateModel = model<IYjsUpdate>('YjsUpdate', YjsUpdateSchema);
