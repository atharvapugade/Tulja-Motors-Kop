const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

console.log('========================================================');
console.log('TULJA MOTORS WMS - VERIFICATION CHECK');
console.log('========================================================\n');

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`[PASS] ${message}`);
    passed++;
  } else {
    console.error(`[FAIL] ${message}`);
    failed++;
  }
}

// 1. Verify bcrypt password hashing
const password = 'Password@123';
const hash = bcrypt.hashSync(password, 10);
assert(bcrypt.compareSync(password, hash), 'Bcrypt password hashing and validation works');
assert(!bcrypt.compareSync('WrongPass', hash), 'Bcrypt rejects incorrect passwords');

// 2. Verify JWT signing & verification
const secret = 'tulja-motors-wms-secure-jwt-secret-key-2026';
const token = jwt.sign(
  { userId: 'usr_md_01', email: 'admin@tuljamotors.com', role: 'super_admin', department: 'Top Management' },
  secret,
  { expiresIn: '7d' }
);
assert(typeof token === 'string' && token.length > 20, 'JWT signing works');
const decoded = jwt.verify(token, secret);
assert(decoded.email === 'admin@tuljamotors.com' && decoded.role === 'super_admin', 'JWT verification extracts payload correctly');

// 3. Verify Database Store & Seed Data
const dataPath = path.join(__dirname, 'data', 'tulja_motors_db.json');
let dbData = null;
if (fs.existsSync(dataPath)) {
  dbData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
} else {
  // If not yet written to disk, check seed file
  const seedFile = fs.readFileSync(path.join(__dirname, 'lib', 'db', 'seed-data.ts'), 'utf8');
  assert(seedFile.includes('Ranjeet B. Patil'), 'Seed data contains Managing Director Ranjeet B. Patil');
  assert(seedFile.includes('Pratiksha Ranjeet Patil'), 'Seed data contains Director Pratiksha Ranjeet Patil');
  assert(seedFile.includes('Sardar Namdev Patil'), 'Seed data contains Director Sardar Namdev Patil');
  assert(seedFile.includes('Vikram Deshmukh'), 'Seed data contains Body Shop Manager Vikram Deshmukh');
}

if (dbData) {
  assert(dbData.users && dbData.users.length >= 10, `Database file has ${dbData.users.length} registered users`);
  assert(dbData.employees && dbData.employees.length >= 10, `Database file has ${dbData.employees.length} employees`);
  assert(dbData.jobCards && dbData.jobCards.length >= 3, `Database file has ${dbData.jobCards.length} job cards`);
  assert(dbData.customers && dbData.customers.length >= 3, `Database file has ${dbData.customers.length} customers`);
  assert(dbData.vehicles && dbData.vehicles.length >= 3, `Database file has ${dbData.vehicles.length} vehicles`);
}

// 4. Verify RBAC configuration
const rbacFile = fs.readFileSync(path.join(__dirname, 'lib', 'auth', 'rbac.ts'), 'utf8');
const expectedRoles = [
  'admin',
  'director',
  'body-shop-manager',
  'hr',
  'advisor',
  'supervisor',
  'accounts',
  'digital-marketing',
  'technician',
  'spare-parts-manager'
];

expectedRoles.forEach(role => {
  assert(rbacFile.includes(`slug: '${role}'`), `RBAC config has role definition for /panels/${role}`);
});

// 5. Verify App Routes Exist
const panelsPage = path.join(__dirname, 'app', 'panels', 'page.tsx');
const roleLoginPage = path.join(__dirname, 'app', 'panels', '[role]', 'page.tsx');
const dashboardPage = path.join(__dirname, 'app', 'panels', '[role]', 'dashboard', 'page.tsx');
const loginApi = path.join(__dirname, 'app', 'api', 'auth', 'login', 'route.ts');
const meApi = path.join(__dirname, 'app', 'api', 'auth', 'me', 'route.ts');
const statsApi = path.join(__dirname, 'app', 'api', 'stats', 'route.ts');
const jobCardsApi = path.join(__dirname, 'app', 'api', 'job-cards', 'route.ts');

assert(fs.existsSync(panelsPage), '/panels landing page exists (app/panels/page.tsx)');
assert(fs.existsSync(roleLoginPage), 'Role login route exists (app/panels/[role]/page.tsx)');
assert(fs.existsSync(dashboardPage), 'Role dashboard route exists (app/panels/[role]/dashboard/page.tsx)');
assert(fs.existsSync(loginApi), 'Login API route exists (app/api/auth/login/route.ts)');
assert(fs.existsSync(meApi), 'Session verification API exists (app/api/auth/me/route.ts)');
assert(fs.existsSync(statsApi), 'Dashboard stats API exists (app/api/stats/route.ts)');
assert(fs.existsSync(jobCardsApi), 'Job cards API exists (app/api/job-cards/route.ts)');

// 6. Verify MongoDB Integration and Environment File
const envPath = path.join(__dirname, '.env');
assert(fs.existsSync(envPath), '.env file exists (tulja-motors/.env)');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  assert(envContent.includes('MONGODB_URI='), '.env defines MONGODB_URI');
  assert(envContent.includes('cluster0.lpvfxkm.mongodb.net'), '.env contains MongoDB Atlas cluster URI');
}
const modelsFile = path.join(__dirname, 'lib', 'db', 'models.ts');
assert(fs.existsSync(modelsFile), 'Mongoose models file exists (lib/db/models.ts)');
const dbStatusApi = path.join(__dirname, 'app', 'api', 'db-status', 'route.ts');
assert(fs.existsSync(dbStatusApi), 'Database status API exists (app/api/db-status/route.ts)');

console.log('\n========================================================');
console.log(`VERIFICATION RESULT: ${passed} PASSED, ${failed} FAILED`);
console.log('========================================================\n');

if (failed > 0) process.exit(1);

