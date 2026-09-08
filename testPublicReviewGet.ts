async function test() {
  const res = await fetch('http://localhost:3000/api/v1/public/community/reviews/l7e8oyo9m');
  const text = await res.text();
  console.log(res.status, text.substring(0, 500));
}
test();
