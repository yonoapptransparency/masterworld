const env = typeof process !== "undefined" ? process.env : {} as Record<string, string>;
console.log(env);
