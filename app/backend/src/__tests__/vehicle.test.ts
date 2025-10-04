import request from "supertest";
import app from "../app";
import { randomUUID } from "crypto";

describe("Vehicle API", () => {
  let vehicleId: number;

  const validVehicleData = {
    make: "Toyota",
    model: "Camry",
    year: 2020,
    licensePlate: "ABC123",
  };

  describe("POST /api/vehicles", () => {
    test("should create a new vehicle", async () => {
      const res = await request(app)
        .post("/api/vehicles")
        .send(validVehicleData);

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty("success", true);
      expect(res.body).toHaveProperty("data");
      expect(res.body.data).toHaveProperty("id");
      expect(res.body.data.make).toBe(validVehicleData.make);
      expect(res.body.data.model).toBe(validVehicleData.model);
      expect(res.body.data.year).toBe(validVehicleData.year);
      expect(res.body.data.licensePlate).toBe(validVehicleData.licensePlate);

      vehicleId = res.body.data.id;
    });

    test("should validate required fields", async () => {
      const invalidData = {
        make: "Toyota",
        // missing model, year, licensePlate
      };

      const res = await request(app).post("/api/vehicles").send(invalidData);

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty("success", false);
    });

    test("should validate field types", async () => {
      const invalidData = {
        make: "Toyota",
        model: "Camry",
        year: "invalid", // should be number
        licensePlate: "ABC123",
      };

      const res = await request(app).post("/api/vehicles").send(invalidData);

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty("success", false);
    });
  });

  describe("GET /api/vehicles", () => {
    test("should return all vehicles", async () => {
      const res = await request(app).get("/api/vehicles");

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("success", true);
      expect(res.body).toHaveProperty("data");
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe("GET /api/vehicles/:id", () => {
    test("should return specific vehicle by id", async () => {
      const res = await request(app).get(`/api/vehicles/${vehicleId}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("success", true);
      expect(res.body).toHaveProperty("data");
      expect(res.body.data.id).toBe(vehicleId);
    });

    test("should return 404 for non-existent vehicle", async () => {
      const res = await request(app).get(`/api/vehicles/${randomUUID()}`);

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty("success", false);
    });

    test("should validate id parameter", async () => {
      const res = await request(app).get("/api/vehicles/invalid");

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty("success", false);
    });
  });

  describe("PUT /api/vehicles", () => {
    test("should update vehicle", async () => {
      const updateData = {
        id: vehicleId,
        make: "Honda",
        model: "Accord",
        year: 2021,
        licensePlate: "XYZ789",
      };

      const res = await request(app).put("/api/vehicles").send(updateData);

      console.log(res.body);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("success", true);
      expect(res.body.data.make).toBe(updateData.make);
      expect(res.body.data.model).toBe(updateData.model);
    });

    test("should validate all required fields for update", async () => {
      const invalidData = {
        id: vehicleId,
        make: "Honda",
        // missing other required fields
      };

      const res = await request(app).put("/api/vehicles").send(invalidData);

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty("success", false);
    });

    test("should return 404 for non-existent vehicle update", async () => {
      const updateData = {
        id: randomUUID(),
        make: "Honda",
        model: "Accord",
        year: 2021,
        licensePlate: "XYZ789",
      };

      const res = await request(app).put("/api/vehicles").send(updateData);

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty("success", false);
    });
  });

  describe("DELETE /api/vehicles/:id", () => {
    test("should delete vehicle", async () => {
      const res = await request(app).delete(`/api/vehicles/${vehicleId}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("success", true);
    });

    test("should return 404 for non-existent vehicle deletion", async () => {
      const res = await request(app).delete(`/api/vehicles/${randomUUID()}`);

      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty("success", false);
    });

    test("should validate id parameter for deletion", async () => {
      const res = await request(app).delete("/api/vehicles/invalid");

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty("success", false);
    });
  });
});
