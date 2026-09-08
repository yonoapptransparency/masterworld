async function test() {
  const payload = {
    appId: "test_app_123",
    userName: "Public User",
    rating: 5,
    reviewText: "This is submitted through Express route!"
  };
  const res = await fetch('http://localhost:3000/api/v1/public/community/reviews', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  console.log(res.status, await res.text());
}
test();
