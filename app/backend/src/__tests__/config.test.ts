import request from "supertest";
import app from "../app";

describe("Config API", () => {
  describe("GET /api/config", () => {
    test("should return all configuration settings", async () => {
      const res = await request(app).get("/api/config");
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("success", true);
      expect(res.body).toHaveProperty("data");
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe("GET /api/config/:key", () => {
    test("should return specific configuration by key", async () => {
      const res = await request(app).get("/api/config/currency");
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("success", true);
      expect(res.body).toHaveProperty("data");
      expect(res.body.data).toHaveProperty("key", "currency");
    });

    test("should return 404 for non-existent config key", async () => {
      const res = await request(app).get("/api/config/nonexistent");
      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty("success", false);
    });
  });

  describe("PUT /api/config", () => {
    test("should update configuration settings", async () => {
      const updateData = [
        { key: "currency", value: "INR" },
        { key: "unitOfVolume", value: "gallon" },
      ];
      const res = await request(app).put("/api/config").send(updateData);
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("success", true);
      expect(res.body).toHaveProperty("data");
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    test("should return not found for invalid key", async () => {
      const updateData = [
        { key: "currency", value: "INR" },
        { key: "invalidKey", value: "test" },
      ];
      const res = await request(app).put("/api/config").send(updateData);
      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty("success", false);
    });

    test("should validate request body is array", async () => {
      const res = await request(app)
        .put("/api/config")
        .send({ key: "currency", value: "USD" });
      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty("success", false);
    });

    test("should validate array is not empty", async () => {
      const res = await request(app).put("/api/config").send([]);
      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty("success", false);
    });

    test("should validate required fields in array items", async () => {
      const invalidData = [
        { key: "currency" }, // missing value
        { value: "USD" }, // missing key
      ];
      const res = await request(app).put("/api/config").send(invalidData);

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty("success", false);
    });
  });
});
