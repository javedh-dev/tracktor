import request from "supertest";
import app from "../app";
import { validateError } from "./config/common.test";
import logger from "@config/logger";

describe("Auth API", () => {
  describe("GET /api/auth/status", () => {
    test("should return current status of the auth pin", async () => {
      const res = await request(app).get("/api/auth/status");

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("data");
      expect(res.body.data).toHaveProperty("exists");
      expect(typeof res.body.data.exists).toBe("boolean");
    });
  });

  describe("POST /api/auth/verify", () => {
    test("should validate pin parameter is required", async () => {
      const res = await request(app).post("/api/auth/verify").send({});
      expect(res.statusCode).toBe(400);
      validateError(res.body);
    });

    test("should validate pin parameter is string", async () => {
      const res = await request(app)
        .post("/api/auth/verify")
        .send({ pin: 123456 });
      expect(res.statusCode).toBe(400);
      validateError(res.body);
    });

    test("should verify correct pin", async () => {
      const res = await request(app)
        .post("/api/auth/verify")
        .send({ pin: "123456" });

      console.info(res.body);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("success", true);
    });

    test("should handle empty pin string", async () => {
      const res = await request(app).post("/api/auth/verify").send({ pin: "" });
      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty("success", false);
    });

    test("should handle very long pin string", async () => {
      const longPin = "1".repeat(1000);
      const res = await request(app)
        .post("/api/auth/verify")
        .send({ pin: longPin });

      // Should handle gracefully, either validation error or verification attempt
      expect([400, 401, 404]).toContain(res.statusCode);
      expect(res.body).toHaveProperty("success", false);
    });

    test("should handle special characters in pin", async () => {
      const res = await request(app)
        .post("/api/auth/verify")
        .send({ pin: "!@#$%^&*()" });

      // Should handle gracefully
      expect([400, 401, 404]).toContain(res.statusCode);
      expect(res.body).toHaveProperty("success");
    });
  });

  describe("Auth API Error Handling", () => {
    test("should handle malformed JSON", async () => {
      const res = await request(app)
        .post("/api/auth/verify")
        .set("Content-Type", "application/json")
        .send("invalid json");

      console.error(res);

      expect(res.statusCode).toBe(400);
    });

    test("should handle missing Content-Type", async () => {
      const res = await request(app)
        .post("/api/auth/verify")
        .send("pin=123456");

      expect(res.statusCode).toBe(400);
    });
  });
});
