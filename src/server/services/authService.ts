import bcrypt from 'bcrypt';
import { AppError } from '../exceptions/AppError';
import { Status } from '../exceptions/AppError';
import * as schema from '../db/schema/index';
import { db } from '../db/index';
import { eq } from 'drizzle-orm';
import {
  generateSessionToken,
  createSession,
  validateSessionToken,
  invalidateSession,
  type User
} from '../utils/session';
import { requireRecord } from './service-response.helper';

const BCRYPT_SALT_ROUNDS = 10;

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
}

// Tracktor is single-owner: `/register` (UI and API) is the one-time first-run setup step,
// never a general "create another account" endpoint — there is no role model, and
// `updateUserProfile` is the only supported way to change the existing user afterwards.
// The page-load redirects in `(auth)/register/+page.server.ts` and the check in
// `middlewares/auth.ts` only gate the UI/unauthenticated-request path; `/api/auth/register`
// itself previously had no such check, so it stayed reachable to create additional accounts
// after setup was complete. Enforcing "at most one user" here, inside the same transaction as
// the insert, keeps that invariant regardless of caller and closes the plain read-then-write
// race a separate pre-check would leave open between two concurrent first-run requests.
//
// Residual caveat: this relies on the libsql/SQLite driver serializing concurrent writers
// within a transaction; it hasn't been load-tested against a real two-request race, so treat
// it as closing the practical "register after setup" gap rather than a proven-atomic guarantee.
export const createUser = async (username: string, password: string) => {
  const passwordHash = await hashPassword(password);
  const userId = crypto.randomUUID();

  return db.transaction(async (tx) => {
    const [anyUser] = await tx
      .select({ id: schema.usersTable.id })
      .from(schema.usersTable)
      .limit(1);

    if (anyUser) {
      throw new AppError('Registration is closed. An account already exists.', Status.CONFLICT);
    }

    await tx.insert(schema.usersTable).values({
      id: userId,
      username,
      passwordHash
    });

    return { userId, username };
  });
};

export const createOrUpdateUser = async (username: string, password: string): Promise<void> => {
  const existingUser = await db.query.usersTable.findFirst({
    where: (users, { eq }) => eq(users.username, username)
  });

  const passwordHash = await hashPassword(password);

  if (!existingUser) {
    const userId = crypto.randomUUID();

    await db.insert(schema.usersTable).values({
      id: userId,
      username: username,
      passwordHash
    });
  } else {
    await db
      .update(schema.usersTable)
      .set({ passwordHash })
      .where(eq(schema.usersTable.username, username));
  }
};

export const loginUser = async (username: string, password: string) => {
  const user = requireRecord(
    await db.query.usersTable.findFirst({
      where: (users, { eq }) => eq(users.username, username)
    }),
    'Invalid username or password',
    Status.UNAUTHORIZED
  );

  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) {
    throw new AppError('Invalid username or password', Status.UNAUTHORIZED);
  }

  const sessionToken = generateSessionToken();
  const session = await createSession(sessionToken, user.id);

  return {
    sessionToken,
    user: {
      id: user.id,
      username: user.username
    }
  };
};

export const logoutUser = async (sessionId: string) => {
  await invalidateSession(sessionId);
  return undefined;
};

export const validateSession = async (sessionToken: string): Promise<{ user: User | null }> => {
  const result = await validateSessionToken(sessionToken);
  return { user: result.user };
};

export const getUsersCount = async () => {
  const [user] = await db.select({ id: schema.usersTable.id }).from(schema.usersTable).limit(1);
  return {
    count: user ? 1 : 0,
    hasUsers: !!user
  };
};

export const updateUserProfile = async (
  userId: string,
  data: { username?: string; currentPassword?: string; newPassword?: string }
) => {
  const user = requireRecord(
    await db.query.usersTable.findFirst({
      where: (users, { eq }) => eq(users.id, userId)
    }),
    'User not found'
  );

  const updates: { username?: string; passwordHash?: string } = {};

  // Handle username update
  if (data.username && data.username !== user.username) {
    const existingUser = await db.query.usersTable.findFirst({
      where: (users, { eq }) => eq(users.username, data.username!)
    });

    if (existingUser) {
      throw new AppError('Username already exists', Status.BAD_REQUEST);
    }

    updates.username = data.username;
  }

  // Handle password update
  if (data.newPassword) {
    if (!data.currentPassword) {
      throw new AppError('Current password is required to change password', Status.BAD_REQUEST);
    }

    const match = await bcrypt.compare(data.currentPassword, user.passwordHash);
    if (!match) {
      throw new AppError('Current password is incorrect', Status.UNAUTHORIZED);
    }

    updates.passwordHash = await hashPassword(data.newPassword);
  }

  if (Object.keys(updates).length === 0) {
    return { id: user.id, username: user.username };
  }

  await db.update(schema.usersTable).set(updates).where(eq(schema.usersTable.id, userId));

  return { id: user.id, username: updates.username || user.username };
};
