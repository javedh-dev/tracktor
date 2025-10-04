import bcrypt from "bcrypt";
import { AppError } from "@exceptions/AppError";
import { Status } from "@exceptions/AppError";
import * as schema from "@db/schema/index";
import { db } from "@db/index";
import { eq } from "drizzle-orm";
import { type ApiResponse } from "@tracktor/common";

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

export const verifyPin = async (pin: string): Promise<ApiResponse> => {
  const auth = await db.query.authTable.findFirst({
    where: (auth, { eq }) => eq(auth.id, 1),
  });
  if (!auth) {
    throw new AppError(
      "PIN is not set yet. Please set PIN first.",
      Status.BAD_REQUEST,
    );
  }
  const match = await bcrypt.compare(pin, auth.hash);
  if (match) {
    return {
      data: { message: "PIN verified successfully." },
      success: true,
    };
  } else {
    throw new AppError(
      "Incorrect PIN provided. Please try again with correct PIN",
      Status.UNAUTHORIZED,
    );
  }
};

export const getPinStatus = async (): Promise<ApiResponse> => {
  const auth = await db.query.authTable.findFirst({
    where: (auth, { eq }) => eq(auth.id, 1),
  });
  return {
    data: {
      exists: !!auth,
    },
    success: true,
  };
};
