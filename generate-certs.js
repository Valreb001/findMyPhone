import fs from 'fs';
import path from 'path';
import selfsigned from 'selfsigned';

async function generateCerts() {
  const certsDir = path.join(process.cwd(), 'certs');

  // Create certs directory if it doesn't exist
  if (!fs.existsSync(certsDir)) {
    fs.mkdirSync(certsDir, { recursive: true });
  }

  const attrs = [{ name: 'commonName', value: 'localhost' }];
  const pems = await selfsigned.generate(attrs, {
    days: 365,
    keySize: 2048,
    algorithm: 'sha256',
  });

  console.log('Generated pems keys:', Object.keys(pems));

  // Write certificate files
  const certData = typeof pems.cert === 'string' ? pems.cert : pems.cert.toString();
  const keyData = typeof pems.private === 'string' ? pems.private : pems.private.toString();

  fs.writeFileSync(path.join(certsDir, 'cert.pem'), certData);
  fs.writeFileSync(path.join(certsDir, 'key.pem'), keyData);

  console.log('✅ SSL certificates generated in certs/ directory');
  console.log('   - certs/cert.pem');
  console.log('   - certs/key.pem');
}

generateCerts().catch(err => {
  console.error('Error generating certificates:', err);
  process.exit(1);
});
