const p1 = Promise.reject(new Error("Missing permissions"));
const p2 = new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 1000));
Promise.race([p1, p2]).catch(console.error);
