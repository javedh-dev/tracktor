#!/usr/bin/env tsx

import { db } from '../src/server/db/index';
import { usersTable } from '../src/server/db/schema/index';
import bcrypt from 'bcrypt';
import { encodeBase32LowerCaseNoPadding } from '@oslojs/encoding';

// Generate a unique user ID
function generateUserId(): string {
    const bytes = new Uint8Array(15);
    crypto.getRandomValues(bytes);
    return encodeBase32LowerCaseNoPadding(bytes);
}

async function createUser() {
    const username = process.argv[2];
    const password = process.argv[3];

    if (!username || !password) {
        console.error('Usage: tsx scripts/create-user.ts <username> <password>');
        process.exit(1);
    }

    try {
        // Check if user already exists
        const existingUser = await db.query.usersTable.findFirst({
            where: (users, { eq }) => eq(users.username, username)
        });

        if (existingUser) {
            console.error(`User '${username}' already exists`);
            process.exit(1);
        }

        const passwordHash = await bcrypt.hash(password, 10);
        const userId = generateUserId();

        await db.insert(usersTable).values({
            id: userId,
            username,
            passwordHash
        });

        console.log(`User '${username}' created successfully with ID: ${userId}`);
    } catch (error) {
        console.error('Error creating user:', error);
        process.exit(1);
    }
}

createUser();