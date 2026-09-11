import { readFirestoreRestCollection } from './src/server/firebase';
import dotenv from 'dotenv';
dotenv.config();

async function run() {
  const reviews = await readFirestoreRestCollection('reviews');
  console.log('REST reviews:', reviews.length);
}
run().catch(console.error);
