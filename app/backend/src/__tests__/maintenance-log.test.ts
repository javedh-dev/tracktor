import request from "supertest";
import app from "../app";
import { randomUUID } from "crypto";

describe("Maintenance Log API", () => {
  let vehicleId: number;
  let maintenanceLogId: number;

  const validVehicleData = {
    make: "Toyota",
    model: "Camry",
    year: 2020,
    licensePlate: "MAINT123",
  };

  const validMaintenanceLogData = {
    date: "2024-01-15",
    odometer: 50000.0,
    serviceCenter: "Toyota Service Center",
    cost: 250.0,
  };

  beforeAll(async () => {
    // Create a vehicle for maintenance log tests
    const vehicleRes = await request(app)
      .post("/api/vehicles")
      .send(validVehicleData);
    vehicleId = vehicleRes.body.data.id;
  });

  describe("POST /api/vehicles/:vehicleId/maintenance-logs", () => {
    test("should create a new maintenance log", async () => {
      const res = await request(app)
        .post(`/api/vehicles/${vehicleId}/maintenance-logs`)
        .send({ ...validMaintenanceLogData, vehicleId });

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty("success", true);
      expect(res.body).toHaveProperty("data");
      expect(res.body.data).toHaveProperty("id");
      expect(res.body.data.vehicleId).toBe(vehicleId);
      expect(res.body.data.date).toBe(validMaintenanceLogData.date);
      expect(res.body.data.odometer).toBe(validMaintenanceLogData.odometer);
      expect(res.body.data.serviceCenter).toBe(
        validMaintenanceLogData.serviceCenter,
      );
      expect(res.body.data.cost).toBe(validMaintenanceLogData.cost);

      maintenanceLogId = res.body.data.id;
    });

    test("should validate required fields", async () => {
      const invalidData = {
        vehicleId,
        date: "2024-01-15",
        // missing odometer, serviceCenter, cost
      };

      const res = await request(app)
        .post(`/api/vehicles/${vehicleId}/maintenance-logs`)
        .send(invalidData);

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty("success", false);
    });

    test("should validate date format", async () => {
      const invalidData = {
        ...validMaintenanceLogData,
        vehicleId,
        date: "invalid-date",
      };

      const res = await request(app)
        .post(`/api/vehicles/${vehicleId}/maintenance-logs`)
        .send(invalidData);

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty("success", false);
    });

    test("should validate numeric fields", async () => {
      const invalidData = {
        ...validMaintenanceLogData,
        vehicleId,
        odometer: "invalid",
        cost: "invalid",
      };

      const res = await request(app)
        .post(`/api/vehicles/${vehicleId}/maintenance-logs`)
        .send(invalidData);

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty("success", false);
    });

    test("should validate vehicle exists", async () => {
      const res = await request(app)
        .post(`/api/vehicles/${randomUUID()}/maintenance-logs`)
        .send({ ...validMaintenanceLogData, vehicleId: randomUUID() });

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty("success", false);
    });
  });

  describe("GET /api/vehicles/:vehicleId/maintenance-logs", () => {
    test("should return all maintenance logs for vehicle", async () => {
      const res = await request(app).get(
        `/api/vehicles/${vehicleId}/maintenance-logs`,
      );

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("success", true);
      expect(res.body).toHaveProperty("data");
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    test("should validate vehicle id parameter", async () => {
      const res = await request(app).get(
        "/api/vehicles/invalid/maintenance-logs",
      );

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty("success", false);
    });

    test("should return empty array for vehicle with no maintenance logs", async () => {
      // Create another vehicle
      const vehicleRes = await request(app).post("/api/vehicles").send({
        make: "Honda",
        model: "Civic",
        year: 2019,
        licensePlate: "NOMAINT123",
      });

      const res = await request(app).get(
        `/api/vehicles/${vehicleRes.body.data.id}/maintenance-logs`,
      );

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("success", true);
      expect(res.body.data).toEqual([]);
    });
  });

  describe("GET /api/vehicles/:vehicleId/maintenance-logs/:id", () => {
    test("should return specific maintenance log", async () => {
      const res = await request(app).get(
        `/api/vehicles/${vehicleId}/maintenance-logs/${maintenanceLogId}`,
      );

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("success", true);
      expect(res.body).toHaveProperty("data");
      expect(res.body.data.id).toBe(maintenanceLogId);
      expect(res.body.data.vehicleId).toBe(vehicleId);
    });

    test("should return 404 for non-existent maintenance log", async () => {
      const res = await request(app).get(
        `/api/vehicles/${vehicleId}/maintenance-logs/${randomUUID()}`,
      );

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty("success", false);
    });

    test("should validate parameters", async () => {
      const res = await request(app).get(
        `/api/vehicles/invalid/maintenance-logs/invalid`,
      );

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty("success", false);
    });
  });

  describe("PUT /api/vehicles/:vehicleId/maintenance-logs/:id", () => {
    test("should update maintenance log", async () => {
      const updateData = {
        vehicleId,
        id: maintenanceLogId,
        date: "2024-01-16",
        odometer: 50100.0,
        serviceCenter: "Honda Service Center",
        cost: 300.0,
      };

      const res = await request(app)
        .put(`/api/vehicles/${vehicleId}/maintenance-logs/${maintenanceLogId}`)
        .send(updateData);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("success", true);
      expect(res.body.data.date).toBe(updateData.date);
      expect(res.body.data.odometer).toBe(updateData.odometer);
      expect(res.body.data.serviceCenter).toBe(updateData.serviceCenter);
      expect(res.body.data.cost).toBe(updateData.cost);
    });

    test("should validate all required fields for update", async () => {
      const invalidData = {
        vehicleId,
        id: maintenanceLogId,
        date: "2024-01-16",
        // missing other required fields
      };

      const res = await request(app)
        .put(`/api/vehicles/${vehicleId}/maintenance-logs/${maintenanceLogId}`)
        .send(invalidData);

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty("success", false);
    });

    test("should return 404 for non-existent maintenance log update", async () => {
      const updateData = {
        vehicleId,
        id: randomUUID(),
        date: "2024-01-16",
        odometer: 50100.0,
        serviceCenter: "Honda Service Center",
        cost: 300.0,
      };

      const res = await request(app)
        .put(`/api/vehicles/${vehicleId}/maintenance-logs/${randomUUID()}`)
        .send(updateData);

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty("success", false);
    });
  });

  describe("DELETE /api/vehicles/:vehicleId/maintenance-logs/:id", () => {
    test("should delete maintenance log", async () => {
      const res = await request(app).delete(
        `/api/vehicles/${vehicleId}/maintenance-logs/${maintenanceLogId}`,
      );

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("success", true);
    });

    test("should return 404 for non-existent maintenance log deletion", async () => {
      const res = await request(app).delete(
        `/api/vehicles/${vehicleId}/maintenance-logs/${randomUUID()}`,
      );

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty("success", false);
    });

    test("should validate parameters for deletion", async () => {
      const res = await request(app).delete(
        `/api/vehicles/invalid/maintenance-logs/invalid`,
      );

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty("success", false);
    });
  });
});
