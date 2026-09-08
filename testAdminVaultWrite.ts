import { writeFirestoreRestDoc } from './src/server/firebase';
async function test() {
  const success = await writeFirestoreRestDoc('test_vault_write', { test: true }, undefined, true, 'store_data');
  console.log("Success:", success);
}
test();
