for i in 1 2 3 4 5; do
  curl -s -X POST http://localhost:3000/api/v1/admin/verify-session -H "Content-Type: application/json" -H "Origin: https://ais-dev-74ohzjoolrfooeegfjfr7f-232960592301.asia-southeast1.run.app" -H "Authorization: Bearer MOCK_ADMIN_TOKEN" -d '{"email":"defentechscholar@gmail.com"}'
  echo ""
done
