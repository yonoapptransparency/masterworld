import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

fetch('http://localhost:3000/api/v1/admin/community/reviews')
  .then(r => r.json())
  .then(r => console.log(r))
  .catch(console.error);
