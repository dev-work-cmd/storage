// Owns the owner-bootstrap checks used by setup and auth entry points.
// Centralizes the first-owner rule so routes and actions do not duplicate it later.
// Must stay server-only because it reads directly from the database.
import "server-only";

import { cache } from "react";

import { UserRole } from "@prisma/client";

import { prisma } from "@/server/db/prisma";

export type OwnerBootstrapState = {
  hasOwner: boolean;
  allowSetup: boolean;
};

export const getOwnerBootstrapState = cache(
  async (): Promise<OwnerBootstrapState> => {
    const owner = await prisma.user.findFirst({
      where: {
        role: UserRole.OWNER,
      },
      select: {
        id: true,
      },
    });

    return {
      hasOwner: Boolean(owner),
      allowSetup: !owner,
    };
  },
);

export async function hasOwnerUser() {
  const { hasOwner } = await getOwnerBootstrapState();
  return hasOwner;
}

export async function isSetupAllowed() {
  const { allowSetup } = await getOwnerBootstrapState();
  return allowSetup;
}
