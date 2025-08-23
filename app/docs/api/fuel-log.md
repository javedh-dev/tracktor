# Fuel Log API

This section documents the API endpoints for managing fuel logs.

## Add Fuel Log

Adds a new fuel log for a vehicle.

*   **Method:** `POST`
*   **Endpoint:** `/api/vehicles/:vehicleId/fuel-logs`
*   **Headers:**
    *   `X-User-PIN`: The user's PIN.
*   **Request Body:**
    ```json
    {
      "date": "2025-07-24",
      "odometer": 12345,
      "fuelAmount": 40,
      "cost": 4000,
      "notes": "Full tank",
      "filled": true,
      "missedLast": false
    }
    ```

## Get All Fuel Logs for Vehicle

Retrieves all fuel logs for a specific vehicle.

*   **Method:** `GET`
*   **Endpoint:** `/api/vehicles/:vehicleId/fuel-logs`
*   **Headers:**
    *   `X-User-PIN`: The user's PIN.

## Get Fuel Log By ID

Retrieves a single fuel log by its ID.

*   **Method:** `GET`
*   **Endpoint:** `/api/vehicles/:vehicleId/fuel-logs/:id`
*   **Headers:**
    *   `X-User-PIN`: The user's PIN.

## Update Fuel Log

Updates a fuel log's information.

*   **Method:** `PUT`
*   **Endpoint:** `/api/vehicles/:vehicleId/fuel-logs/:id`
*   **Headers:**
    *   `X-User-PIN`: The user's PIN.
*   **Request Body:**
    ```json
    {
      "date": "2025-07-25",
      "odometer": 12400,
      "fuelAmount": 35,
      "cost": 3500,
      "notes": "Partial refill",
      "filled": false,
      "missedLast": false
    }
    ```

## Delete Fuel Log

Deletes a fuel log.

*   **Method:** `DELETE`
*   **Endpoint:** `/api/vehicles/:vehicleId/fuel-logs/:id`
*   **Headers:**
    *   `X-User-PIN`: The user's PIN.
