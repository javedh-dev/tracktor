import bcrypt from "bcrypt";
import { Auth } from "@models/index.js";
import { AuthError } from "@exceptions/AuthError.js";
import { Status, statusFromError } from "@exceptions/ServiceError.js";

export const setPin = async (pin: string) => {
  const hash = await bcrypt.hash(pin, 10);

  const [auth, created] = await Auth.findOrCreate({
    where: { id: 1 },
    defaults: { hash: hash },
  });

  if (!created) {
    auth.hash = hash;
    await auth.save();
    return { message: "PIN updated successfully." };
  } else {
    return { message: "PIN set successfully." };
  }
};

export const verifyPin = async (pin: string) => {
  const auth = await Auth.findByPk(1);
  if (!auth) {
    throw new AuthError("PIN is not set yet. Please set PIN first.");
  }
  const match = await bcrypt.compare(pin, auth.get("hash"));
  if (match) {
    return { message: "PIN verified successfully." };
  } else {
    throw new AuthError(
      "Incorrect PIN provided. Please try again with correct PIN",
      Status.UNAUTHORIZED,
    );
  }
};

export const getPinStatus = async () => {
  const auth = await Auth.findByPk(1);
  return { exists: !!auth };
};
