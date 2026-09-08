import { writeFirestoreRestDoc } from './src/server/firebase';
async function test() {
  const success = await writeFirestoreRestDoc('test_doc', { test: 'value' }, undefined, true, 'reviews');
  console.log("Success:", success);
}
test();
