import request from "supertest";
import app from "../app";
import path from "path";
import fs from "fs";
import { randomUUID } from "crypto";

describe("Upload API", () => {
  const testFilePath = path.join(__dirname, "test-file.txt");
  const testFileContent = "This is a test file for upload testing.";

  beforeAll(() => {
    // Create a test file
    fs.writeFileSync(testFilePath, testFileContent);
  });

  afterAll(() => {
    // Clean up test file
    if (fs.existsSync(testFilePath)) {
      fs.unlinkSync(testFilePath);
    }
  });

  describe("POST /api/files", () => {
    let uploadedFilename: string;

    test("should upload a file successfully", async () => {
      const res = await request(app)
        .post("/api/files")
        .attach("file", testFilePath);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("success", true);
      expect(res.body).toHaveProperty("message", "File uploaded successfully");
      expect(res.body).toHaveProperty("data");
      expect(res.body.data).toHaveProperty("filename");
      expect(res.body.data).toHaveProperty("originalName", "test-file.txt");
      expect(res.body.data).toHaveProperty("size");
      expect(res.body.data).toHaveProperty("mimetype", "text/plain");

      uploadedFilename = res.body.data.filename;
    });

    test("should return error when no file is uploaded", async () => {
      const res = await request(app).post("/api/files");

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty("success", false);
      expect(res.body).toHaveProperty(
        "message",
        "File is missing to be uploaded",
      );
    });

    test("should handle multiple file upload attempts", async () => {
      const res1 = await request(app)
        .post("/api/files")
        .attach("file", testFilePath);

      const res2 = await request(app)
        .post("/api/files")
        .attach("file", testFilePath);

      expect(res1.statusCode).toBe(200);
      expect(res2.statusCode).toBe(200);
      expect(res1.body.data.filename).not.toBe(res2.body.data.filename); // Should have different filenames
    });

    describe("GET /api/files/:filename", () => {
      test("should retrieve uploaded file", async () => {
        const res = await request(app).get(`/api/files/${uploadedFilename}`);

        expect(res.statusCode).toBe(200);
        expect(res.text).toBe(testFileContent);
      });

      test("should return 404 for non-existent file", async () => {
        const res = await request(app).get(`/api/files/${randomUUID()}.txt`);

        expect(res.statusCode).toBe(404);
        expect(res.body).toHaveProperty("success", false);
        expect(res.body).toHaveProperty("message", "File not found");
      });

      test("should handle url injection", async () => {
        const res = await request(app).get("/api/files/../../../etc/passwd");
        expect(res.statusCode).toBe(404);
      });
    });
  });

  describe("File Upload Security", () => {
    test("should handle large file uploads gracefully", async () => {
      // Create a larger test file
      const largeContent = "x".repeat(1024 * 1024); // 1MB
      const largeFilePath = path.join(__dirname, "large-test-file.txt");
      fs.writeFileSync(largeFilePath, largeContent);

      const res = await request(app)
        .post("/api/files")
        .attach("file", largeFilePath);

      // Clean up
      fs.unlinkSync(largeFilePath);

      // Should either succeed or fail gracefully based on file size limits
      expect([200, 413]).toContain(res.statusCode);
    });

    test("should handle empty file upload", async () => {
      const emptyFilePath = path.join(__dirname, "empty-test-file.txt");
      fs.writeFileSync(emptyFilePath, "");

      const res = await request(app)
        .post("/api/files")
        .attach("file", emptyFilePath);

      // Clean up
      fs.unlinkSync(emptyFilePath);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("success", true);
      expect(res.body.data.size).toBe(0);
    });
  });

  describe("File Type Validation", () => {
    test("should handle different file types", async () => {
      // Create a JSON test file
      const jsonFilePath = path.join(__dirname, "test-file.png");
      fs.writeFileSync(jsonFilePath, "");

      const res = await request(app)
        .post("/api/files")
        .attach("file", jsonFilePath);

      // Clean up
      fs.unlinkSync(jsonFilePath);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("success", true);
      expect(res.body.data).toHaveProperty("mimetype", "image/png");
    });
  });
});
