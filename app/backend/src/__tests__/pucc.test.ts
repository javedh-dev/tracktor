import request from "supertest";
import app from "../app";

describe("Pollution Certificate (PUCC) API", () => {
  let vehicleId: number;
  let puccId: number;

  const validVehicleData = {
    make: "Toyota",
    model: "Camry",
    year: 2020,
    licensePlate: "PUCC123"
  };

  const validPuccData = {
    certificateNumber: "PUCC123456789",
    issueDate: "2024-01-01",
    expiryDate: "2024-12-31",
    testingCenter: "Authorized Testing Center"
  };

  beforeAll(async () => {
    // Create a vehicle for PUCC tests
    const vehicleRes = await request(app)
      .post("/api/vehicles")
      .send(validVehicleData);
    vehicleId = vehicleRes.body.data.id;
  });

  describe("POST /api/vehicles/:vehicleId/pucc", () => {
    test("should create a new pollution certificate", async () => {
      const res = await request(app)
        .post(`/api/vehicles/${vehicleId}/pucc`)
        .send({ ...validPuccData, vehicleId });
      
      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty("success", true);
      expect(res.body).toHaveProperty("data");
      expect(res.body.data).toHaveProperty("id");
      expect(res.body.data.vehicleId).toBe(vehicleId);
      expect(res.body.data.certificateNumber).toBe(validPuccData.certificateNumber);
      expect(res.body.data.issueDate).toBe(validPuccData.issueDate);
      expect(res.body.data.expiryDate).toBe(validPuccData.expiryDate);
      expect(res.body.data.testingCenter).toBe(validPuccData.testingCenter);
      
      puccId = res.body.data.id;
    });

    test("should validate required fields", async () => {
      const invalidData = {
        vehicleId,
        certificateNumber: "PUCC123456789",
        // missing issueDate, expiryDate, testingCenter
      };

      const res = await request(app)
        .post(`/api/vehicles/${vehicleId}/pucc`)
        .send(invalidData);
      
      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty("success", false);
    });

    test("should validate date formats", async () => {
      const invalidData = {
        ...validPuccData,
        vehicleId,
        issueDate: "invalid-date",
        expiryDate: "invalid-date"
      };

      const res = await request(app)
        .post(`/api/vehicles/${vehicleId}/pucc`)
        .send(invalidData);
      
      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty("success", false);
    });

    test("should validate vehicle exists", async () => {
      const res = await request(app)
        .post("/api/vehicles/99999/pucc")
        .send({ ...validPuccData, vehicleId: 99999 });
      
      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty("success", false);
    });
  });

  describe("GET /api/vehicles/:vehicleId/pucc", () => {
    test("should return all pollution certificates for vehicle", async () => {
      const res = await request(app).get(`/api/vehicles/${vehicleId}/pucc`);
      
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("success", true);
      expect(res.body).toHaveProperty("data");
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    test("should validate vehicle id parameter", async () => {
      const res = await request(app).get("/api/vehicles/invalid/pucc");
      
      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty("success", false);
    });

    test("should return empty array for vehicle with no pollution certificates", async () => {
      // Create another vehicle
      const vehicleRes = await request(app)
        .post("/api/vehicles")
        .send({
          make: "Honda",
          model: "Civic",
          year: 2019,
          licensePlate: "NOPUCC123"
        });
      
      const res = await request(app).get(`/api/vehicles/${vehicleRes.body.data.id}/pucc`);
      
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("success", true);
      expect(res.body.data).toEqual([]);
    });
  });

  describe("PUT /api/vehicles/:vehicleId/pucc/:id", () => {
    test("should update pollution certificate", async () => {
      const updateData = {
        vehicleId,
        id: puccId,
        certificateNumber: "PUCC987654321",
        issueDate: "2024-02-01",
        expiryDate: "2025-01-31",
        testingCenter: "New Testing Center"
      };

      const res = await request(app)
        .put(`/api/vehicles/${vehicleId}/pucc/${puccId}`)
        .send(updateData);
      
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("success", true);
      expect(res.body.data.certificateNumber).toBe(updateData.certificateNumber);
      expect(res.body.data.issueDate).toBe(updateData.issueDate);
      expect(res.body.data.expiryDate).toBe(updateData.expiryDate);
      expect(res.body.data.testingCenter).toBe(updateData.testingCenter);
    });

    test("should validate all required fields for update", async () => {
      const invalidData = {
        vehicleId,
        id: puccId,
        certificateNumber: "PUCC987654321",
        // missing other required fields
      };

      const res = await request(app)
        .put(`/api/vehicles/${vehicleId}/pucc/${puccId}`)
        .send(invalidData);
      
      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty("success", false);
    });

    test("should return 404 for non-existent pollution certificate update", async () => {
      const updateData = {
        vehicleId,
        id: 99999,
        certificateNumber: "PUCC987654321",
        issueDate: "2024-02-01",
        expiryDate: "2025-01-31",
        testingCenter: "New Testing Center"
      };

      const res = await request(app)
        .put(`/api/vehicles/${vehicleId}/pucc/99999`)
        .send(updateData);
      
      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty("success", false);
    });
  });

  describe("DELETE /api/vehicles/:vehicleId/pucc/:id", () => {
    test("should delete pollution certificate", async () => {
      const res = await request(app).delete(`/api/vehicles/${vehicleId}/pucc/${puccId}`);
      
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("success", true);
    });

    test("should return 404 for non-existent pollution certificate deletion", async () => {
      const res = await request(app).delete(`/api/vehicles/${vehicleId}/pucc/99999`);
      
      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty("success", false);
    });

    test("should validate parameters for deletion", async () => {
      const res = await request(app).delete(`/api/vehicles/invalid/pucc/invalid`);
      
      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty("success", false);
    });
  });
});