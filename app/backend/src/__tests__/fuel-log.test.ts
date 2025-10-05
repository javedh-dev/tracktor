import request from "supertest";
import app from "../app";
import { UUID } from "crypto";

describe("Fuel Log API", () => {
  let vehicleId: UUID;
  let fuelLogId: UUID;

  const validVehicleData = {
    make: "Toyota",
    model: "Camry",
    year: 2020,
    licensePlate: "FUEL123",
  };

  const validFuelLogData = {
    date: "2024-01-15",
    odometer: 50000.5,
    fuelAmount: 45.2,
    cost: 67.8,
  };

  beforeAll(async () => {
    // Create a vehicle for fuel log tests
    const vehicleRes = await request(app)
      .post("/api/vehicles")
      .send(validVehicleData);
    console.log(vehicleRes.body, vehicleRes.status);
    vehicleId = vehicleRes.body.data.id;
  });

  describe("POST /api/vehicles/:vehicleId/fuel-logs", () => {
    test("should create a new fuel log", async () => {
      const res = await request(app)
        .post(`/api/vehicles/${vehicleId}/fuel-logs`)
        .send({ ...validFuelLogData, vehicleId });

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty("success", true);
      expect(res.body).toHaveProperty("data");
      expect(res.body.data).toHaveProperty("id");
      expect(res.body.data.vehicleId).toBe(vehicleId);
      expect(res.body.data.date).toBe(validFuelLogData.date);
      expect(res.body.data.odometer).toBe(validFuelLogData.odometer);
      expect(res.body.data.fuelAmount).toBe(validFuelLogData.fuelAmount);
      expect(res.body.data.cost).toBe(validFuelLogData.cost);

      fuelLogId = res.body.data.id;
    });

    test("should validate required fields", async () => {
      const invalidData = {
        vehicleId,
        date: "2024-01-15",
        // missing odometer, fuelAmount, cost
      };

      const res = await request(app)
        .post(`/api/vehicles/${vehicleId}/fuel-logs`)
        .send(invalidData);

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty("success", false);
    });

    test("should validate date format", async () => {
      const invalidData = {
        ...validFuelLogData,
        vehicleId,
        date: "invalid-date",
      };

      const res = await request(app)
        .post(`/api/vehicles/${vehicleId}/fuel-logs`)
        .send(invalidData);

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty("success", false);
    });

    test("should validate numeric fields", async () => {
      const invalidData = {
        ...validFuelLogData,
        vehicleId,
        odometer: "invalid", // should be number
        fuelAmount: "invalid", // should be number
        cost: "invalid", // should be number
      };

      const res = await request(app)
        .post(`/api/vehicles/${vehicleId}/fuel-logs`)
        .send(invalidData);

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty("success", false);
    });

    test("should validate vehicle exists", async () => {
      const res = await request(app)
        .post("/api/vehicles/99999/fuel-logs")
        .send({ ...validFuelLogData, vehicleId: 99999 });

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty("success", false);
    });
  });

  describe("GET /api/vehicles/:vehicleId/fuel-logs", () => {
    test("should return all fuel logs for vehicle", async () => {
      const res = await request(app).get(
        `/api/vehicles/${vehicleId}/fuel-logs`,
      );

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("success", true);
      expect(res.body).toHaveProperty("data");
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    test("should validate vehicle id parameter", async () => {
      const res = await request(app).get("/api/vehicles/invalid/fuel-logs");

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty("success", false);
    });

    test("should return empty array for vehicle with no fuel logs", async () => {
      // Create another vehicle
      const vehicleRes = await request(app).post("/api/vehicles").send({
        make: "Honda",
        model: "Civic",
        year: 2019,
        licensePlate: "EMPTY123",
      });

      const res = await request(app).get(
        `/api/vehicles/${vehicleRes.body.data.id}/fuel-logs`,
      );

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("success", true);
      expect(res.body.data).toEqual([]);
    });
  });

  describe("GET /api/vehicles/:vehicleId/fuel-logs/:id", () => {
    test("should return specific fuel log", async () => {
      const res = await request(app).get(
        `/api/vehicles/${vehicleId}/fuel-logs/${fuelLogId}`,
      );

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("success", true);
      expect(res.body).toHaveProperty("data");
      expect(res.body.data.id).toBe(fuelLogId);
      expect(res.body.data.vehicleId).toBe(vehicleId);
    });

    test("should return 404 for non-existent fuel log", async () => {
      const res = await request(app).get(
        `/api/vehicles/${vehicleId}/fuel-logs/99999`,
      );

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty("success", false);
    });

    test("should validate parameters", async () => {
      const res = await request(app).get(
        `/api/vehicles/invalid/fuel-logs/invalid`,
      );

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty("success", false);
    });
  });

  describe("PUT /api/vehicles/:vehicleId/fuel-logs/:id", () => {
    test("should update fuel log", async () => {
      const updateData = {
        vehicleId,
        id: fuelLogId,
        date: "2024-01-16",
        odometer: 50100.0,
        fuelAmount: 50.0,
        cost: 75.0,
      };

      const res = await request(app)
        .put(`/api/vehicles/${vehicleId}/fuel-logs/${fuelLogId}`)
        .send(updateData);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("success", true);
      expect(res.body.data.date).toBe(updateData.date);
      expect(res.body.data.odometer).toBe(updateData.odometer);
      expect(res.body.data.fuelAmount).toBe(updateData.fuelAmount);
      expect(res.body.data.cost).toBe(updateData.cost);
    });

    test("should validate all required fields for update", async () => {
      const invalidData = {
        vehicleId,
        id: fuelLogId,
        date: "2024-01-16",
        // missing other required fields
      };

      const res = await request(app)
        .put(`/api/vehicles/${vehicleId}/fuel-logs/${fuelLogId}`)
        .send(invalidData);

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty("success", false);
    });

    test("should return 404 for non-existent fuel log update", async () => {
      const updateData = {
        vehicleId,
        id: 99999,
        date: "2024-01-16",
        odometer: 50100.0,
        fuelAmount: 50.0,
        cost: 75.0,
      };

      const res = await request(app)
        .put(`/api/vehicles/${vehicleId}/fuel-logs/99999`)
        .send(updateData);

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty("success", false);
    });
  });

  describe("DELETE /api/vehicles/:vehicleId/fuel-logs/:id", () => {
    test("should delete fuel log", async () => {
      const res = await request(app).delete(
        `/api/vehicles/${vehicleId}/fuel-logs/${fuelLogId}`,
      );

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("success", true);
    });

    test("should return 404 for non-existent fuel log deletion", async () => {
      const res = await request(app).delete(
        `/api/vehicles/${vehicleId}/fuel-logs/99999`,
      );

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty("success", false);
    });

    test("should validate id parameter for deletion", async () => {
      const res = await request(app).delete(
        `/api/vehicles/${vehicleId}/fuel-logs/invalid`,
      );

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty("success", false);
    });
  });
});
