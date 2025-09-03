#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

console.log("Setting up Tracktor development environment...");

// Create scripts directory if it doesn't exist
const scriptsDir = path.dirname(__filename);
if (!fs.existsSync(scriptsDir)) {
  fs.mkdirSync(scriptsDir, { recursive: true });
}

// Check if .env exists in root
const rootEnvPath = path.join(__dirname, "..", ".env");
const exampleEnvPath = path.join(__dirname, "..", ".env.example");

if (!fs.existsSync(rootEnvPath)) {
  if (fs.existsSync(exampleEnvPath)) {
    console.log("📋 Copying .env.example to .env...");
    fs.copyFileSync(exampleEnvPath, rootEnvPath);
    console.log("✅ Created .env file from .env.example");
  } else {
    console.log(
      "❌ No .env.example file found. Please create a .env file manually."
    );
    process.exit(1);
  }
} else {
  console.log("✅ .env file already exists");
}

// Create symbolic link for frontend
const frontendEnvPath = path.join(__dirname, "..", "app", "frontend", ".env");
const relativeRootEnvPath = "../../.env";

try {
  // Remove existing symlink or file if it exists
  if (
    fs.existsSync(frontendEnvPath) ||
    fs.lstatSync(frontendEnvPath).isSymbolicLink()
  ) {
    fs.unlinkSync(frontendEnvPath);
  }
} catch (error) {
  // File doesn't exist, which is fine
}

try {
  console.log(
    "🔗 Creating symbolic link for frontend environment variables..."
  );
  fs.symlinkSync(relativeRootEnvPath, frontendEnvPath);
  console.log("✅ Created symbolic link: app/frontend/.env -> ../../.env");
} catch (error) {
  console.log("⚠️  Could not create symbolic link:", error.message);
  console.log(
    "   You may need to manually ensure environment variables are available to the frontend."
  );
}

console.log("🎉 Environment setup complete!");
console.log("");
console.log("Next steps:");
console.log("  1. Review and update .env file with your configuration");
console.log("  2. Run: npm run dev");
