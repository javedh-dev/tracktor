import type { RequestHandler } from './$types';
import { json, error } from '@sveltejs/kit';
import * as authService from '$server/services/authService';
import { AppError } from '$server/exceptions/AppError';

// POST /api/auth/register - Register a new user
export const POST: RequestHandler = async (event) => {
    try {
        const body = event.locals.requestBody || await event.request.json();

        // Validate request body
        if (!body.username || !body.password) {
            throw error(400, 'Username and password are required');
        }

        // Basic validation
        if (body.username.length < 3) {
            throw error(400, 'Username must be at least 3 characters long');
        }

        if (body.password.length < 6) {
            throw error(400, 'Password must be at least 6 characters long');
        }

        const result = await authService.createUser(body.username, body.password);
        return json(result);
    } catch (err) {
        console.error('Register POST error:', err);

        if (err instanceof AppError) {
            throw error(err.status, err.message);
        }

        if (err instanceof Error && 'status' in err) {
            throw err;
        }

        throw error(500, 'Internal server error');
    }
};