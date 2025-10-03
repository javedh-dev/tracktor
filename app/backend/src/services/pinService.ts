import bcrypt from "bcrypt";
import { AuthError } from "@exceptions/AuthError";
import { Status } from "@exceptions/ServiceError";
import * as schema from "@db/schema/index";
import { db } from "@db/index";
import { eq } from "drizzle-orm";

export const setPin = async (pin: string) => {
  const hash = await bcrypt.hash(pin, 10);

  const existingAuth = await db.query.authTable.findFirst({
    where: (auth, { eq }) => eq(auth.id, 1),
  });

  if (existingAuth) {
    await db
      .update(schema.authTable)
      .set({ hash: hash })
      .where(eq(schema.authTable.id, 1));
    return { message: "PIN updated successfully." };
  } else {
    await db.insert(schema.authTable).values({ id: 1, hash: hash });
    return { message: "PIN set successfully." };
  }
};

export const verifyPin = async (pin: string) => {
  const auth = await db.query.authTable.findFirst({
    where: (auth, { eq }) => eq(auth.id, 1),
  });
  if (!auth) {
    throw new AuthError("PIN is not set yet. Please set PIN first.");
  }
  const match = await bcrypt.compare(pin, auth.hash);
  if (match) {
    return { message: "PIN verified successfully." };
  } else {
    throw new AuthError(
      "Incorrect PIN provided. Please try again with correct PIN",
      Status.UNAUTHORIZED
    );
  }
};

export const getPinStatus = async () => {
  const auth = await db.query.authTable.findFirst({
    where: (auth, { eq }) => eq(auth.id, 1),
  });
  return { exists: !!auth };
};
