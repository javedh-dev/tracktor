import { env } from '@config/index';
import cors from 'cors';

export default cors({
	origin: env.CORS_ORIGINS,
	credentials: true,
	methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
	allowedHeaders: ['Content-Type', 'Authorization', 'X-User-PIN'],
	optionsSuccessStatus: 200
});
