import request from "supertest";
import app from "../app";
import { randomUUID } from "crypto";

describe("Insurance API", () => {
  let vehicleId: number;
  let insuranceId: number;

  const validVehicleData = {
    make: "Toyota",
    model: "Camry",
    year: 2020,
    fuelType: "petrol",
    licensePlate: "INS123",
  };

  const validInsuranceData = {
    provider: "State Farm",
    policyNumber: "SF123456789",
    startDate: "2024-01-01",
    endDate: "2024-12-31",
    cost: 1200.0,
  };

  beforeAll(async () => {
    // Create a vehicle for insurance tests
    const vehicleRes = await request(app)
      .post("/api/vehicles")
      .send(validVehicleData);
    vehicleId = vehicleRes.body.data.id;
  });

  describe("POST /api/vehicles/:vehicleId/insurance", () => {
    test("should create a new insurance record", async () => {
      const res = await request(app)
        .post(`/api/vehicles/${vehicleId}/insurance`)
        .send({ ...validInsuranceData, vehicleId });

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty("success", true);
      expect(res.body).toHaveProperty("data");
      expect(res.body.data).toHaveProperty("id");
      expect(res.body.data.vehicleId).toBe(vehicleId);
      expect(res.body.data.provider).toBe(validInsuranceData.provider);
      expect(res.body.data.policyNumber).toBe(validInsuranceData.policyNumber);
      expect(res.body.data.startDate).toBe(validInsuranceData.startDate);
      expect(res.body.data.endDate).toBe(validInsuranceData.endDate);
      expect(res.body.data.cost).toBe(validInsuranceData.cost);

      insuranceId = res.body.data.id;
    });

    test("should validate required fields", async () => {
      const invalidData = {
        vehicleId,
        provider: "State Farm",
        // missing policyNumber, startDate, endDate, cost
      };

      const res = await request(app)
        .post(`/api/vehicles/${vehicleId}/insurance`)
        .send(invalidData);

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty("success", false);
    });

    test("should validate date formats", async () => {
      const invalidData = {
        ...validInsuranceData,
        vehicleId,
        startDate: "invalid-date",
        endDate: "invalid-date",
      };

      const res = await request(app)
        .post(`/api/vehicles/${vehicleId}/insurance`)
        .send(invalidData);

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty("success", false);
    });

    test("should validate cost is numeric", async () => {
      const invalidData = {
        ...validInsuranceData,
        vehicleId,
        cost: "invalid",
      };

      const res = await request(app)
        .post(`/api/vehicles/${vehicleId}/insurance`)
        .send(invalidData);

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty("success", false);
    });

    test("should validate vehicle exists", async () => {
      const res = await request(app)
        .post(`/api/vehicles/${randomUUID()}/insurance`)
        .send({ ...validInsuranceData, vehicleId: randomUUID() });

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty("success", false);
    });
  });

  describe("GET /api/vehicles/:vehicleId/insurance", () => {
    test("should return all insurance records for vehicle", async () => {
      const res = await request(app).get(
        `/api/vehicles/${vehicleId}/insurance`,
      );

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("success", true);
      expect(res.body).toHaveProperty("data");
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    test("should validate vehicle id parameter", async () => {
      const res = await request(app).get("/api/vehicles/invalid/insurance");

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty("success", false);
    });

    test("should return empty array for vehicle with no insurance records", async () => {
      // Create another vehicle
      const vehicleRes = await request(app).post("/api/vehicles").send({
        make: "Honda",
        model: "Civic",
        year: 2019,
        fuelType: "petrol",
        licensePlate: "NOINS123",
      });

      const res = await request(app).get(
        `/api/vehicles/${vehicleRes.body.data.id}/insurance`,
      );

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("success", true);
      expect(res.body.data).toEqual([]);
    });
  });

  describe("PUT /api/vehicles/:vehicleId/insurance/:id", () => {
    test("should update insurance record", async () => {
      const updateData = {
        vehicleId,
        id: insuranceId,
        provider: "Geico",
        policyNumber: "GC987654321",
        startDate: "2024-02-01",
        endDate: "2025-01-31",
        cost: 1100.0,
      };

      const res = await request(app)
        .put(`/api/vehicles/${vehicleId}/insurance/${insuranceId}`)
        .send(updateData);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("success", true);
      expect(res.body.data.provider).toBe(updateData.provider);
      expect(res.body.data.policyNumber).toBe(updateData.policyNumber);
      expect(res.body.data.startDate).toBe(updateData.startDate);
      expect(res.body.data.endDate).toBe(updateData.endDate);
      expect(res.body.data.cost).toBe(updateData.cost);
    });

    test("should validate all required fields for update", async () => {
      const invalidData = {
        vehicleId,
        id: insuranceId,
        provider: "Geico",
        // missing other required fields
      };

      const res = await request(app)
        .put(`/api/vehicles/${vehicleId}/insurance/${insuranceId}`)
        .send(invalidData);

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty("success", false);
    });

    test("should return 404 for non-existent insurance record update", async () => {
      const updateData = {
        vehicleId,
        id: randomUUID(),
        provider: "Geico",
        policyNumber: "GC987654321",
        startDate: "2024-02-01",
        endDate: "2025-01-31",
        cost: 1100.0,
      };

      const res = await request(app)
        .put(`/api/vehicles/${vehicleId}/insurance/${randomUUID()}`)
        .send(updateData);

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty("success", false);
    });
  });

  describe("DELETE /api/vehicles/:vehicleId/insurance/:id", () => {
    test("should delete insurance record", async () => {
      const res = await request(app).delete(
        `/api/vehicles/${vehicleId}/insurance/${insuranceId}`,
      );

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("success", true);
    });

    test("should return 404 for non-existent insurance record deletion", async () => {
      const res = await request(app).delete(
        `/api/vehicles/${vehicleId}/insurance/${randomUUID()}`,
      );

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty("success", false);
    });

    test("should validate parameters for deletion", async () => {
      const res = await request(app).delete(
        `/api/vehicles/invalid/insurance/invalid`,
      );

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty("success", false);
    });
  });
});
