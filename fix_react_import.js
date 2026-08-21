const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'components', 'UserReviews.tsx');
let content = fs.readFileSync(filePath, 'utf-8');

content = content.replace(
  "import React from 'react';",
  "import React, { useState, useEffect, useRef } from 'react';"
);

fs.writeFileSync(filePath, content);
console.log('Fixed React import');
