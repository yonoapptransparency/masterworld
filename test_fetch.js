const promise1 = new Promise((resolve) => setTimeout(resolve, 5000, 'timeout'));
console.log('starting');
Promise.race([promise1]).then(console.log);
