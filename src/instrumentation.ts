export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  // Apply Drizzle migrations before seeding
  const { execSync } = await import("child_process");
  execSync("npx drizzle-kit migrate", { stdio: "inherit" });

  const { bootstrapDb } = await import("./lib/db/bootstrap");
  await bootstrapDb();
}
