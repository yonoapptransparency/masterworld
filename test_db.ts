import { writeFirestoreRestDoc, readFirestoreRestDoc, readFirestoreRestCollection, deleteFirestoreRestDoc } from './src/server/firebase';

async function run() {
  console.log("--- Testing Main DB (store_data) ---");
  const mainWrite = await writeFirestoreRestDoc('test_main_doc', { hello: 'world', timestamp: Date.now() }, undefined, true, 'store_data');
  console.log("Main Write:", mainWrite);
  
  const mainRead = await readFirestoreRestDoc('test_main_doc', undefined, 'store_data');
  console.log("Main Read:", mainRead);
  
  const mainDelete = await deleteFirestoreRestDoc('test_main_doc', undefined, 'store_data');
  console.log("Main Delete:", mainDelete);

  console.log("\n--- Testing Community DB (reviews) ---");
  const commWrite = await writeFirestoreRestDoc('test_comm_doc', { hello: 'community', timestamp: Date.now() }, undefined, true, 'reviews');
  console.log("Community Write:", commWrite);
  
  const commRead = await readFirestoreRestDoc('test_comm_doc', undefined, 'reviews');
  console.log("Community Read:", commRead);
  
  const commDelete = await deleteFirestoreRestDoc('test_comm_doc', undefined, 'reviews');
  console.log("Community Delete:", commDelete);
}

run().catch(console.error);
