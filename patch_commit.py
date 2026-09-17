import sys

with open("src/hooks/useGitHubSync.ts", "r") as f:
    content = f.read()

start_marker = "      // Execute sequential commits to prevent GitHub branch HEAD ref race-condition conflicts"
end_marker = "            } else {\n              log(`GitHub Sync Error: Failed to build API bundle (${apiRes.status})`);\n            }\n         }\n      }\n    } catch(err: any) {\n        log(`GitHub Sync Error (Vault): ${err.message}`);\n    }"

start_idx = content.find(start_marker)
end_idx = content.find(end_marker)

if start_idx == -1 or end_idx == -1:
    print("Markers not found!")
    if start_idx == -1:
        print("start missing")
    if end_idx == -1:
        print("end missing")
    sys.exit(1)

new_block = """      // Vault Link Sealing
      log(`GitHub Sync: Building AES Encrypted Vault for ${targetRepo}...`);
      const vaultRes = await adminFetch('/api/v1/admin/seal-vault', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json', ...(idToken ? { 'Authorization': `Bearer ${idToken}` } : {}) },
         body: JSON.stringify({ items: publicApps }) // BUGFIX: only publicApps!
      });

      if (vaultRes.ok) {
         const vaultData = await vaultRes.json();
         if (vaultData.ciphertext) {
            primaryFiles.push({
              path: 'src/lib/secureVault.ts',
              content: `export const ENCRYPTED_LINKS = "${vaultData.ciphertext}";\\n`,
              message: `Admin Release: Secure vault synchronization for ${targetRepo}`,
              name: 'secureVault.ts'
            });
         }
      } else {
         log(`GitHub Sync Warning: Failed to seal vault. Secure links may not be updated.`);
      }

      // Perform single ATOMIC commit
      log(`GitHub Sync: Executing ATOMIC commit to ${targetRepo}...`);
      const atomicRes = await adminFetch('/api/github-sync/commit-atomic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(idToken ? { 'Authorization': `Bearer ${idToken}` } : {}) },
        body: JSON.stringify({
          owner: configToUse.owner,
          repo: targetRepo,
          branch: configToUse.branch || 'main',
          token: configToUse.token,
          files: primaryFiles,
          message: `Admin Release: Atomic static update for ${targetRepo}`
        })
      });
      
      if (!atomicRes.ok) {
         const errText = await atomicRes.text();
         throw new Error(`Atomic commit failed: ${errText}`);
      }
      
      const atomicData = await atomicRes.json();
      if (!atomicData.success) {
         throw new Error(atomicData.message || 'Unknown atomic commit error');
      }

      log(`GitHub Sync: ✅ Atomic commit successful! SHA: ${atomicData.commitSha}`);

    } catch (err: any) {
      throw new Error(`Failed to sync static data to primary target (${targetRepo}): ${err.message}`);
    }"""

new_content = content[:start_idx] + new_block + content[end_idx + len(end_marker):]

with open("src/hooks/useGitHubSync.ts", "w") as f:
    f.write(new_content)
print("Patch applied successfully!")
