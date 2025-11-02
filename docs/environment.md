Tracktor app uses environment variables to configure its settings. Here are some common environment variables used in Tracktor:

1. **NODE_ENV** - Specifies the environment in which the application is running.
    - Possible values are `dev`, `production`, and `test`.
    - Default : `development`.

2. **SERVER_HOST** - Defines the hostname or IP address where the server will listen for incoming requests. If You want the server to be accessible from all network interfaces, you can set this to `0.0.0.0`
    - Possible values are any valid hostname or IP address.
    - Default : `localhost`.

3. **SERVER_PORT** - Sets the port number on which the server will listen for incoming requests.
    - Possible values are any valid port number (e.g., `3000`, `8080`). That port must be free.
    - Default : `3000`.

4. **DB_PATH** - Specifies the file path to the database used by Tracktor. This is typically a SQLite database file.
    - Possible values are any valid file path (e.g., `/path/to/tracktor.db`).
    - Default : `./tracktor.db`.
    - For docker setup this environment variable is set to `/data/tracktor.db`.

5. **UPLOADS_DIR** - Defines the directory path where uploaded files will be stored.
    - Possible values are any valid directory path (e.g., `/path/to/uploads`).
    - Default : `./uploads`.
    - For docker setup this environment variable is set to `/data/uploads`.

6. **AUTH_PIN** - Sets a PIN code for authentication purposes. This is used to log in to the Tracktor application.
    - Possible values are any 6 digit string representing the PIN code (e.g., `000000`).
    - Default : `123456`.
    **NOTE:** To change the pin update this environment variable before starting the application.

7. **CORS_ORIGINS** - Specifies the allowed origins for Cross-Origin Resource Sharing (CORS). This is useful for controlling which domains can access the Tracktor API.
    - Possible values are a comma-separated list of allowed origins (e.g., `http://example.com,https://anotherdomain.com,http:<ip_address>:3000`).
    - Default : `*` (allows all origins).
    **NOTE:** When using Tracktor with a frontend application hosted on a different domain or port or behind reverse proxy, it's recommended to set this variable to the specific origin of the frontend application for security reasons.

8. **TRACKTOR_DEMO_MODE** - A boolean flag that, when set to `true`, enables demo mode features in the application by seeding some demo data to try out application features.
    - Possible values are `true` or `false`.
    - Default : `false`.

9. **FORCE_DATA_SEED** - A boolean flag that, when set to `true`, forces the application to seed the database with demo data on startup if `TRACKTOR_DEMO_MODE` is set to true.
    - Possible values are `true` or `false`.
    - Default : `false`.

10. **LOG_REQUESTS** - A boolean flag that, when set to `true`, enables logging of incoming HTTP requests in backend API.
    - Possible values are `true` or `false`.
    - Default : `true`.

11. **LOG_LEVEL** - Sets the logging level for the application. The logging level determines the severity of messages that will be logged.
    - Possible values are `error`, `warn`, `info`, `http`, `verbose`, `debug`, and `silly`.
    - Default : `info`.

12. **LOG_DIR** - Specifies the directory path where log files will be stored.
    - Possible values are any valid directory path (e.g., `/path/to/logs`).
    - Default : `./logs`.

13. **TRACKTOR_API_BASE_URL** - Defines the base URL for the public API endpoints. This is useful when the application is behind a reverse proxy or load balancer.
    - Possible values are any valid URL (e.g., `http://example.com`).
    - Default : `http://localhost:3000`.

14. **TRACKTOR_DISABLE_AUTH** - A boolean flag that, when set to `true`, disables authentication for the public API endpoints.
    - Possible values are `true` or `false`.
    - Default : `false`.


**NOTE:** These environment variables can be set in your system or in a `.env` file in the root directory of the Tracktor application. Make sure to restart the application after changing any environment variables for the changes to take effect.
