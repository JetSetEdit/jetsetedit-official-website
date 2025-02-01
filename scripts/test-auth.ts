import { config } from "dotenv";
import { resolve } from "path";
import { auth } from "@/lib/auth";

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), ".env.local") });

async function testAuth() {
  try {
    console.log("Testing auth configuration...");
    console.log("\nEnvironment variables:");
    console.log("GITHUB_CLIENT_ID:", process.env.GITHUB_CLIENT_ID ? "✓ Present" : "✗ Missing");
    console.log("GITHUB_CLIENT_SECRET:", process.env.GITHUB_CLIENT_SECRET ? "✓ Present" : "✗ Missing");
    console.log("AUTH_SECRET:", process.env.AUTH_SECRET ? "✓ Present" : "✗ Missing");
    console.log("NEXTAUTH_URL:", process.env.NEXTAUTH_URL ? "✓ Present" : "✗ Missing");

    console.log("\nGitHub credentials details:");
    console.log("GITHUB_CLIENT_ID length:", process.env.GITHUB_CLIENT_ID?.length || 0);
    console.log("GITHUB_CLIENT_SECRET length:", process.env.GITHUB_CLIENT_SECRET?.length || 0);

    try {
      console.log("\nTesting auth session...");
      const session = await auth();
      console.log("Session result:", session ? "Session object received" : "No session");
    } catch (authError: any) {
      console.error("\nAuth session error:");
      console.error("Name:", authError.name);
      console.error("Message:", authError.message);
      console.error("Stack:", authError.stack);
    }

    console.log("\nAuth configuration test complete.");
  } catch (error: any) {
    console.error("\nError testing auth configuration:");
    console.error("Name:", error.name);
    console.error("Message:", error.message);
    console.error("Stack:", error.stack);
  }
}

testAuth(); 