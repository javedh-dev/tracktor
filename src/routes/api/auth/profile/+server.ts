import type { RequestHandler } from './$types';
import { json, error } from '@sveltejs/kit';
import * as authService from '$server/services/authService';
import { AppError } from '$server/exceptions/AppError';

// PUT /api/auth/profile - Update current user's profile (username/password)
export const PUT: RequestHandler = async (event) => {
    try {
        // Get current user from session
        const sessionToken = event.cookies.get('session');
        if (!sessionToken) {
            throw error(401, 'Not authenticated');
        }

        const { user } = await authService.validateSession(sessionToken);
        if (!user) {
            throw error(401, 'Invalid session');
        }

        const body = event.locals.requestBody || (await event.request.json());

        // Validate request body
        if (!body.username && !body.newPassword) {
            throw error(400, 'At least username or new password is required');
        }

        // Basic validation
        if (body.username && body.username.length < 3) {
            throw error(400, 'Username must be at least 3 characters long');
        }

        if (body.newPassword && body.newPassword.length < 6) {
            throw error(400, 'Password must be at least 6 characters long');
        }

        const result = await authService.updateUserProfile(user.id, {
            username: body.username,
            currentPassword: body.currentPassword,
            newPassword: body.newPassword
        });

        return json(result);
    } catch (err) {
        console.error('Profile PUT error:', err);

        if (err instanceof AppError) {
            throw error(err.status, err.message);
        }

        if (err instanceof Error && 'status' in err) {
            throw err;
        }

        throw error(500, 'Internal server error');
    }
};
