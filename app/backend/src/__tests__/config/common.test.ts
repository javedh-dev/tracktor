export const validateError = (body: any) => {
  expect(body).toHaveProperty("success", false);
  expect(body).toHaveProperty("errors");
  expect(body.errors.length).toBeGreaterThanOrEqual(1);
};
