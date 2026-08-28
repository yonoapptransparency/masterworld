const fs = require('fs');
let content = fs.readFileSync('src/components/ClearanceButton.tsx', 'utf8');

if (!content.includes('import CryptoJS')) {
  content = content.replace(
    "import { Turnstile } from '@marsidev/react-turnstile';",
    "import { Turnstile } from '@marsidev/react-turnstile';\nimport CryptoJS from 'crypto-js';"
  );
}

const newPow = `
  const computePoW = async (nonce: string, difficulty: string): Promise<string> => {
    let solution = 0;
    while (true) {
      const input = nonce + solution;
      const hashHex = CryptoJS.SHA256(input).toString(CryptoJS.enc.Hex);
      if (hashHex.startsWith(difficulty)) {
        return solution.toString();
      }
      solution++;
      if (solution % 500 === 0) {
        await new Promise(resolve => setTimeout(resolve, 0));
      }
    }
  };
`;

content = content.replace(
  /const computePoW = async[\s\S]*?\}\s*};\s*const handleClick/,
  newPow.trim() + '\n\n  const handleClick'
);

fs.writeFileSync('src/components/ClearanceButton.tsx', content);
