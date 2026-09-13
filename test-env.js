console.log(process.env.FIREBASE_SERVICE_ACCOUNT ? "exists" : "missing");
if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  const sa = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  console.log("Project ID from SA:", sa.project_id);
}
