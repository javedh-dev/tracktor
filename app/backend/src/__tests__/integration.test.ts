import request from "supertest";
import app from "../app";
import { randomUUID, UUID } from "crypto";

describe("Integration Tests", () => {
  let vehicleId: UUID;

  const vehicleData = {
    make: "Toyota",
    model: "Prius",
    year: 2022,
    licensePlate: "INT123",
  };

  describe("Complete Vehicle Lifecycle", () => {
    test("should create vehicle and add all related records", async () => {
      // 1. Create vehicle
      const vehicleRes = await request(app)
        .post("/api/vehicles")
        .send(vehicleData);

      expect(vehicleRes.statusCode).toBe(201);
      vehicleId = vehicleRes.body.data.id;

      // 2. Add fuel log
      const fuelLogRes = await request(app)
        .post(`/api/vehicles/${vehicleId}/fuel-logs`)
        .send({
          vehicleId,
          date: "2024-01-15",
          odometer: 25000.0,
          fuelAmount: 40.0,
          cost: 60.0,
          filled: true,
          missedLast: false,
        });

      expect(fuelLogRes.statusCode).toBe(201);

      // 3. Add insurance
      const insuranceRes = await request(app)
        .post(`/api/vehicles/${vehicleId}/insurance`)
        .send({
          vehicleId,
          provider: "State Farm",
          policyNumber: "SF123456",
          startDate: "2024-01-01",
          endDate: "2024-12-31",
          cost: 1200.0,
        });

      expect(insuranceRes.statusCode).toBe(201);

      // 4. Add maintenance log
      const maintenanceRes = await request(app)
        .post(`/api/vehicles/${vehicleId}/maintenance-logs`)
        .send({
          vehicleId,
          date: "2024-01-10",
          odometer: 24500.0,
          serviceCenter: "Toyota Service",
          cost: 150.0,
        });

      expect(maintenanceRes.statusCode).toBe(201);

      // 5. Add pollution certificate
      const puccRes = await request(app)
        .post(`/api/vehicles/${vehicleId}/pucc`)
        .send({
          vehicleId,
          certificateNumber: "PUCC123456",
          issueDate: "2024-01-01",
          expiryDate: "2024-12-31",
          testingCenter: "Authorized Center",
        });

      expect(puccRes.statusCode).toBe(201);

      // 6. Verify all records exist
      const vehicleDetailsRes = await request(app).get(
        `/api/vehicles/${vehicleId}`,
      );
      expect(vehicleDetailsRes.statusCode).toBe(200);

      const fuelLogsRes = await request(app).get(
        `/api/vehicles/${vehicleId}/fuel-logs`,
      );
      expect(fuelLogsRes.statusCode).toBe(200);
      expect(fuelLogsRes.body.data.length).toBe(1);

      const insurancesRes = await request(app).get(
        `/api/vehicles/${vehicleId}/insurance`,
      );
      expect(insurancesRes.statusCode).toBe(200);
      expect(insurancesRes.body.data.length).toBe(1);

      const maintenanceLogsRes = await request(app).get(
        `/api/vehicles/${vehicleId}/maintenance-logs`,
      );
      expect(maintenanceLogsRes.statusCode).toBe(200);
      expect(maintenanceLogsRes.body.data.length).toBe(1);

      const puccRes2 = await request(app).get(
        `/api/vehicles/${vehicleId}/pucc`,
      );
      expect(puccRes2.statusCode).toBe(200);
      expect(puccRes2.body.data.length).toBe(1);
    });
  });

  describe("Data Consistency Tests", () => {
    test("should maintain data consistency across operations", async () => {
      // Get initial vehicle count
      const initialVehiclesRes = await request(app).get("/api/vehicles");
      const initialCount = initialVehiclesRes.body.data.length;

      // Create a new vehicle
      const newVehicleRes = await request(app).post("/api/vehicles").send({
        make: "Honda",
        model: "Civic",
        year: 2021,
        licensePlate: "CONSIST123",
      });

      expect(newVehicleRes.statusCode).toBe(201);
      const newVehicleId = newVehicleRes.body.data.id;

      // Verify vehicle count increased
      const afterCreateRes = await request(app).get("/api/vehicles");
      expect(afterCreateRes.body.data.length).toBe(initialCount + 1);

      // Delete the vehicle
      const deleteRes = await request(app).delete(
        `/api/vehicles/${newVehicleId}`,
      );
      expect(deleteRes.statusCode).toBe(200);

      // Verify vehicle count returned to original
      const afterDeleteRes = await request(app).get("/api/vehicles");
      expect(afterDeleteRes.body.data.length).toBe(initialCount);
    });

    test("should handle concurrent requests properly", async () => {
      const promises = [];

      // Create multiple vehicles concurrently
      for (let i = 0; i < 5; i++) {
        promises.push(
          request(app)
            .post("/api/vehicles")
            .send({
              make: "Test",
              model: `Model${i}`,
              year: 2020 + i,
              licensePlate: `CONC${i}`,
            }),
        );
      }

      const results = await Promise.all(promises);

      // All should succeed
      results.forEach((res) => {
        expect(res.statusCode).toBe(201);
        expect(res.body.success).toBe(true);
      });

      // All should have unique IDs
      const ids = results.map((res) => res.body.data.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });
  });

  describe("Error Propagation Tests", () => {
    test("should handle cascading validation errors", async () => {
      // Try to create fuel log for non-existent vehicle
      const fuelLogRes = await request(app)
        .post(`/api/vehicles/${randomUUID()}/fuel-logs`)
        .send({
          vehicleId: randomUUID(),
          date: "2024-01-15",
          odometer: 25000.0,
          fuelAmount: 40.0,
          cost: 60.0,
        });

      expect(fuelLogRes.statusCode).toBe(404);
      expect(fuelLogRes.body.success).toBe(false);
    });

    test("should handle invalid data across multiple endpoints", async () => {
      const invalidRequests = [
        request(app).post("/api/vehicles").send({ make: "" }), // Invalid vehicle
        request(app).put("/api/config").send({}), // Invalid config
        request(app).post("/api/auth/verify").send({}), // Invalid auth
      ];

      const results = await Promise.all(invalidRequests);

      results.forEach((res) => {
        expect(res.statusCode).toBe(400);
        expect(res.body.success).toBe(false);
      });
    });
  });

  describe("Performance Tests", () => {
    test("should handle bulk operations efficiently", async () => {
      const startTime = Date.now();

      // Create multiple fuel logs for the same vehicle
      const promises = [];
      for (let i = 0; i < 10; i++) {
        promises.push(
          request(app)
            .post(`/api/vehicles/${vehicleId}/fuel-logs`)
            .send({
              vehicleId,
              date: `2024-01-${String(i + 1).padStart(2, "0")}`,
              odometer: 25000.0 + i * 100,
              fuelAmount: 40.0 + i,
              cost: 60.0 + i,
              filled: true,
              missedLast: true,
            }),
        );
      }

      const results = await Promise.all(promises);
      const endTime = Date.now();

      // All should succeed
      results.forEach((res) => {
        expect(res.statusCode).toBe(201);
      });

      // Should complete in reasonable time (adjust threshold as needed)
      expect(endTime - startTime).toBeLessThan(5000); // 5 seconds
    });
  });

  describe("API Response Format Consistency", () => {
    test("should have consistent response format across all endpoints", async () => {
      const endpoints = [
        { method: "get" as const, url: "/api/vehicles" },
        { method: "get" as const, url: "/api/config" },
        { method: "get" as const, url: "/api/auth/status" },
        { method: "get" as const, url: `/api/vehicles/${vehicleId}` },
        { method: "get" as const, url: `/api/vehicles/${vehicleId}/fuel-logs` },
      ];

      for (const endpoint of endpoints) {
        let res;

        if (endpoint.method === "get") {
          res = await request(app).get(endpoint.url);
        }

        if (res && res.statusCode === 200) {
          expect(res.body).toHaveProperty("success", true);
          expect(res.body).toHaveProperty("data");
        }
      }
    });

    test("should have consistent error response format", async () => {
      const errorEndpoints = [
        { method: "get" as const, url: "/api/vehicles/99999" },
        { method: "get" as const, url: "/api/config/nonexistent" },
        { method: "post" as const, url: "/api/vehicles", data: {} },
      ];

      for (const endpoint of errorEndpoints) {
        let res;

        if (endpoint.method === "get") {
          res = await request(app).get(endpoint.url);
        } else if (endpoint.method === "post") {
          res = await request(app)
            .post(endpoint.url)
            .send(endpoint.data || {});
        }

        if (res && res.statusCode >= 400) {
          expect(res.body).toHaveProperty("success", false);
          expect(res.body).toHaveProperty("message");
        }
      }
    });
  });
});
