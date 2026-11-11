import openApiSpec from "../src/openapi.js";

const requiredRoutes = {
  "/books": ["get", "post"],
  "/books/{id}": ["get", "put", "delete"],
  "/authors": ["get", "post"],
  "/authors/{id}": ["get", "put", "delete"]
};

for (const [path, methods] of Object.entries(requiredRoutes)) {
  for (const method of methods) {
    if (!openApiSpec.paths[path]?.[method]) {
      throw new Error(`Swagger documentation is missing ${method.toUpperCase()} ${path}`);
    }
  }
}

console.log("Swagger documents every book and author route.");
