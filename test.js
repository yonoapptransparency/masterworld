try {
  console.log(new URL("localhost:3000").host);
} catch(e) {
  console.log("Error:", e.message);
}
