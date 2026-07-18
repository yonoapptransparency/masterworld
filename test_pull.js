const fs = require('fs');
fetch('http://localhost:3000/api/v1/admin/config-status', { headers: { 'Authorization': 'Bearer test' } })
  .then(res => res.text())
  .then(console.log);
