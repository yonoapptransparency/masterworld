async function run() {
  const res = await fetch('http://localhost:3000/api/v1/admin/verify-session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer MOCK_ADMIN_TOKEN' },
    body: JSON.stringify({ email: 'defentechscholar@gmail.com' })
  });
  console.log("Status:", res.status);
  const text = await res.text();
  console.log("Body:", text);
}
run();
