import express from 'express';
import supertest from 'supertest';
import { adminVaultRouter } from './src/server/routes/adminVaultRoutes';

const app = express();
app.use(express.json());
// Mock verifyAdminToken middleware since we just want to test performance of the route handler
app.use((req, res, next) => {
  (req as any).adminUser = { email: 'admin@admin.com' };
  next();
});
app.use(adminVaultRouter);

async function run() {
  const payload = {
    items: [
      { id: "1", url: "http://example.com/1", more_information_url: "http://example.com/info1", slug: "slug-1" },
      { id: "2", url: "http://example.com/2", more_information_url: "http://example.com/info2", slug: "slug-2" },
      { id: "3", url: "http://example.com/3", more_information_url: "http://example.com/info3", slug: "slug-3" }
    ]
  };

  const start = performance.now();
  for(let i=0; i<100; i++) {
    await supertest(app)
      .post('/api/v1/admin/save-links-direct')
      .set('Authorization', 'Bearer MOCK_TOKEN')
      .send(payload);
  }
  const end = performance.now();
  console.log(`Route took: ${end - start} ms`);
}
run();
