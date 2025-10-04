import request from "supertest";
import app from "../app";
import path from "path";
import fs from "fs";

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

  describe("POST /api/upload", () => {
    let uploadedFilename: string;

    test("should upload a file successfully", async () => {
      const res = await request(app)
        .post("/api/upload")
        .attach("file", testFilePath);
      
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("success", true);
      expect(res.body).toHaveProperty("message", "File uploaded successfully");
      expect(res.body).toHaveProperty("filename");
      expect(res.body).toHaveProperty("originalName", "test-file.txt");
      expect(res.body).toHaveProperty("size");
      expect(res.body).toHaveProperty("mimetype", "text/plain");
      
      uploadedFilename = res.body.filename;
    });

    test("should return error when no file is uploaded", async () => {
      const res = await request(app)
        .post("/api/upload");
      
      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty("success", false);
      expect(res.body).toHaveProperty("message", "No file uploaded");
    });

    test("should handle multiple file upload attempts", async () => {
      const res1 = await request(app)
        .post("/api/upload")
        .attach("file", testFilePath);
      
      const res2 = await request(app)
        .post("/api/upload")
        .attach("file", testFilePath);
      
      expect(res1.statusCode).toBe(200);
      expect(res2.statusCode).toBe(200);
      expect(res1.body.filename).not.toBe(res2.body.filename); // Should have different filenames
    });

    describe("GET /api/upload/:filename", () => {
      test("should retrieve uploaded file", async () => {
        const res = await request(app).get(`/api/upload/${uploadedFilename}`);
        
        expect(res.statusCode).toBe(200);
        expect(res.text).toBe(testFileContent);
      });

      test("should return 404 for non-existent file", async () => {
        const res = await request(app).get("/api/upload/nonexistent-file.txt");
        
        expect(res.statusCode).toBe(404);
        expect(res.body).toHaveProperty("success", false);
        expect(res.body).toHaveProperty("message", "File not found");
      });

      test("should handle invalid filename characters", async () => {
        const res = await request(app).get("/api/upload/../../../etc/passwd");
        
        expect(res.statusCode).toBe(404);
        expect(res.body).toHaveProperty("success", false);
        expect(res.body).toHaveProperty("message", "File not found");
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
        .post("/api/upload")
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
        .post("/api/upload")
        .attach("file", emptyFilePath);
      
      // Clean up
      fs.unlinkSync(emptyFilePath);
      
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("success", true);
      expect(res.body.size).toBe(0);
    });
  });

  describe("File Type Validation", () => {
    test("should handle different file types", async () => {
      // Create a JSON test file
      const jsonContent = JSON.stringify({ test: "data" });
      const jsonFilePath = path.join(__dirname, "test-file.json");
      fs.writeFileSync(jsonFilePath, jsonContent);

      const res = await request(app)
        .post("/api/upload")
        .attach("file", jsonFilePath);
      
      // Clean up
      fs.unlinkSync(jsonFilePath);
      
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("success", true);
      expect(res.body).toHaveProperty("mimetype", "application/json");
    });
  });
});