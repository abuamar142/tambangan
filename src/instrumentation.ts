export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  const { bootstrapDb } = await import("./lib/db/bootstrap");
  await bootstrapDb();
}
