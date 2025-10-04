# API Test Suite

This directory contains comprehensive tests for the Tracktor backend API.

## Test Structure

### Unit Tests
- `auth.test.ts` - Authentication and PIN verification endpoints
- `config.test.ts` - Configuration management endpoints
- `vehicle.test.ts` - Vehicle CRUD operations
- `fuel-log.test.ts` - Fuel log management for vehicles
- `insurance.test.ts` - Insurance record management
- `maintenance-log.test.ts` - Maintenance log tracking
- `pucc.test.ts` - Pollution certificate management
- `upload.test.ts` - File upload and retrieval

### Integration Tests
- `integration.test.ts` - End-to-end workflows and data consistency tests

### Test Utilities
- `setup.ts` - Test environment setup and database initialization
- `test-runner.ts` - Test execution configuration

## Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test -- auth.test.ts

# Run tests in watch mode (for development)
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

## Test Coverage

The test suite covers:

### API Endpoints
- ✅ GET /api/auth/status
- ✅ POST /api/auth/verify
- ✅ GET /api/config
- ✅ GET /api/config/:key
- ✅ PUT /api/config
- ✅ POST /api/vehicles
- ✅ GET /api/vehicles
- ✅ GET /api/vehicles/:id
- ✅ PUT /api/vehicles
- ✅ DELETE /api/vehicles/:id
- ✅ POST /api/vehicles/:vehicleId/fuel-logs
- ✅ GET /api/vehicles/:vehicleId/fuel-logs
- ✅ GET /api/vehicles/:vehicleId/fuel-logs/:id
- ✅ PUT /api/vehicles/:vehicleId/fuel-logs/:id
- ✅ DELETE /api/vehicles/:vehicleId/fuel-logs/:id
- ✅ POST /api/vehicles/:vehicleId/insurance
- ✅ GET /api/vehicles/:vehicleId/insurance
- ✅ PUT /api/vehicles/:vehicleId/insurance/:id
- ✅ DELETE /api/vehicles/:vehicleId/insurance/:id
- ✅ POST /api/vehicles/:vehicleId/maintenance-logs
- ✅ GET /api/vehicles/:vehicleId/maintenance-logs
- ✅ GET /api/vehicles/:vehicleId/maintenance-logs/:id
- ✅ PUT /api/vehicles/:vehicleId/maintenance-logs/:id
- ✅ DELETE /api/vehicles/:vehicleId/maintenance-logs/:id
- ✅ POST /api/vehicles/:vehicleId/pucc
- ✅ GET /api/vehicles/:vehicleId/pucc
- ✅ PUT /api/vehicles/:vehicleId/pucc/:id
- ✅ DELETE /api/vehicles/:vehicleId/pucc/:id
- ✅ POST /api/upload
- ✅ GET /api/upload/:filename

### Validation Testing
- ✅ Required field validation
- ✅ Data type validation
- ✅ Format validation (dates, numbers)
- ✅ Parameter validation
- ✅ Request body validation

### Error Handling
- ✅ 400 Bad Request scenarios
- ✅ 404 Not Found scenarios
- ✅ Malformed JSON handling
- ✅ Missing parameters
- ✅ Invalid data types

### Security Testing
- ✅ File upload security
- ✅ Path traversal prevention
- ✅ Input sanitization
- ✅ Large file handling

### Performance Testing
- ✅ Concurrent request handling
- ✅ Bulk operation performance
- ✅ Response time validation

### Integration Testing
- ✅ Complete vehicle lifecycle
- ✅ Data consistency across operations
- ✅ Cascading operations
- ✅ Error propagation
- ✅ Response format consistency

## Test Data

Tests use isolated test data and don't interfere with each other. Each test file:
- Creates its own test vehicles and records
- Cleans up after itself where necessary
- Uses unique identifiers to avoid conflicts

## Database Setup

The test suite automatically:
- Initializes the database with patches
- Seeds required configuration data
- Runs in a test environment separate from development/production

## Adding New Tests

When adding new API endpoints or features:

1. Create a new test file following the naming convention: `feature.test.ts`
2. Import the setup file: `import "./setup";`
3. Follow the existing test structure and patterns
4. Include tests for:
   - Happy path scenarios
   - Validation errors
   - Edge cases
   - Error handling
5. Update this README with new coverage information

## Test Patterns

### Standard Test Structure
```typescript
describe("Feature API", () => {
  describe("POST /api/feature", () => {
    test("should create feature successfully", async () => {
      const res = await request(app)
        .post("/api/feature")
        .send(validData);
      
      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty("success", true);
      expect(res.body).toHaveProperty("data");
    });

    test("should validate required fields", async () => {
      const res = await request(app)
        .post("/api/feature")
        .send(invalidData);
      
      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty("success", false);
    });
  });
});
```

### Validation Testing Pattern
```typescript
test("should validate field types", async () => {
  const invalidData = {
    stringField: 123, // should be string
    numberField: "invalid", // should be number
    dateField: "invalid-date" // should be valid date
  };

  const res = await request(app)
    .post("/api/endpoint")
    .send(invalidData);
  
  expect(res.statusCode).toBe(400);
  expect(res.body).toHaveProperty("success", false);
});
```

## Troubleshooting

### Common Issues

1. **Database Connection Errors**: Ensure the test database is properly initialized
2. **Port Conflicts**: Make sure no other instances are running on the same port
3. **File Upload Tests**: Verify the uploads directory exists and has proper permissions
4. **Async Test Issues**: Always use `async/await` for database operations

### Debug Mode

To run tests with debug output:
```bash
DEBUG=* npm test
```

### Test Isolation

If tests are interfering with each other:
- Check that test data uses unique identifiers
- Verify cleanup operations are working
- Consider using `beforeEach`/`afterEach` hooks for isolation