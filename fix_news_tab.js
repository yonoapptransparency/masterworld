const fs = require('fs');

let code = fs.readFileSync('src/components/NewsTab.tsx', 'utf8');

const imports = `import React, { useState } from 'react';
import { Plus, Trash2, LayoutDashboard, Newspaper, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

`;

code = imports + code + '\n\nexport default NewsTab;';

fs.writeFileSync('src/components/NewsTab.tsx', code);
