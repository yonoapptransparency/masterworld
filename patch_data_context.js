const fs = require('fs');
let code = fs.readFileSync('src/contexts/DataContextPublic.tsx', 'utf8');

const additionalFields = `  blogsSyncedWithServer?: boolean;
  videosSyncedWithServer?: boolean;
  serverAppsFetched?: boolean;
  serverNewsFetched?: boolean;
  serverBlogsFetched?: boolean;
  serverVideosFetched?: boolean;
  isConnected?: boolean;
  isLive?: boolean;
  quotaExceeded?: boolean;
  lastSyncTime?: string;
  refreshAll?: (silent?: boolean) => Promise<void>;
  testCloudConnection?: () => Promise<boolean>;
`;

if (!code.includes('blogsSyncedWithServer?')) {
  code = code.replace(
    /  newsSyncedWithServer: boolean;\n/,
    `  newsSyncedWithServer: boolean;\n${additionalFields}`
  );
}

const dummyValues = `    blogsSyncedWithServer: true,
    videosSyncedWithServer: true,
    serverAppsFetched: true,
    serverNewsFetched: true,
    serverBlogsFetched: true,
    serverVideosFetched: true,
    isConnected: true,
    isLive: true,
    quotaExceeded: false,
    lastSyncTime: '',
    refreshAll: async () => {},
    testCloudConnection: async () => true,
`;

if (!code.includes('blogsSyncedWithServer: true')) {
  code = code.replace(
    /    fetchVideos: \(\) => \{\}\n  \}\}>/,
    `    fetchVideos: () => {},\n${dummyValues}  }}>`
  );
}

fs.writeFileSync('src/contexts/DataContextPublic.tsx', code);
console.log("Patched DataContextPublic.tsx");
