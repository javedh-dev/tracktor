import request from "supertest";
import app from "../app";

describe("GET /api/auth/status", () => {
  test("return current status of the auth pin", async () => {
    const res = await request(app).get("/api/auth/status");
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("exists");
    expect(typeof res.body.exists).toBe("boolean");
  });
});
