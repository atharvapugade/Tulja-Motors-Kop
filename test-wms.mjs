import { db } from './lib/db/store';
import { comparePassword, signAuthToken, verifyAuthToken } from './lib/auth/jwt';
import { canAccessPanel, getRoleConfigBySlug, ROLE_CONFIGS } from './lib/auth/rbac';

async function runTests() {
  console.log('========================================================');
  console.log('TULJA MOTORS WMS - COMPREHENSIVE AUTOMATED TEST SUITE');
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

  try {
    // 1. Database Initialization & Seed Verification
    console.log('--- 1. Testing Database Store & Seed Data ---');
    const users = await db.getUsers();
    assert(users.length >= 10, `All ${users.length} organizational users loaded.`);

    const employees = await db.getEmployees();
    assert(employees.length >= 10, `All ${employees.length} employees registered.`);

    const customers = await db.getCustomers();
    assert(customers.length >= 3, `Sample customers found: ${customers.length}`);

    const vehicles = await db.getVehicles();
    assert(vehicles.length >= 3, `Sample vehicles registered: ${vehicles.length}`);

    const jobCards = await db.getJobCards();
    assert(jobCards.length >= 3, `Job cards in active pipeline: ${jobCards.length}`);

    // 2. Authentication & Password Hashing Verification
    console.log('\n--- 2. Testing Credentials & Bcrypt Hashing ---');
    const adminUser = await db.getUserByEmail('admin@tuljamotors.com');
    assert(adminUser !== undefined, 'Admin user account exists (admin@tuljamotors.com)');
    assert(adminUser.role === 'super_admin', 'Admin role is super_admin');

    const isMatch = await comparePassword('Password@123', adminUser.passwordHash);
    assert(isMatch === true, 'Valid password verification with bcrypt succeeds');

    const isBadMatch = await comparePassword('WrongPassword', adminUser.passwordHash);
    assert(isBadMatch === false, 'Invalid password rejection succeeds');

    // 3. JWT Signing & Verification
    console.log('\n--- 3. Testing JWT Token Engine ---');
    const token = signAuthToken({
      userId: adminUser.id,
      email: adminUser.email,
      name: adminUser.name,
      role: adminUser.role,
      department: adminUser.department,
    });
    assert(typeof token === 'string' && token.length > 20, 'JWT token signed successfully');

    const decoded = verifyAuthToken(token);
    assert(decoded !== null, 'JWT token verified successfully');
    assert(decoded?.email === 'admin@tuljamotors.com', 'Decoded JWT payload matches user');

    // 4. Role-Based Access Control (RBAC) Matrix
    console.log('\n--- 4. Testing Role-Based Access Control (RBAC) ---');
    // Admin can access admin panel
    assert(canAccessPanel('super_admin', 'admin') === true, 'Super Admin can access /panels/admin');
    // Director can access director panel
    assert(canAccessPanel('director', 'director') === true, 'Director can access /panels/director');
    // Technician CANNOT access admin panel
    assert(canAccessPanel('technician', 'admin') === false, 'Technician CANNOT access /panels/admin (Blocked)');
    // Advisor CANNOT access accounts panel
    assert(canAccessPanel('advisor', 'accounts') === false, 'Advisor CANNOT access /panels/accounts (Blocked)');
    // Body shop manager can access supervisor & advisor panels
    assert(canAccessPanel('body_shop_manager', 'supervisor') === true, 'Body Shop Manager can access supervisor panel');

    // Verify all 9 roles exist in config
    const expectedRoles = ['admin', 'director', 'body-shop-manager', 'hr', 'advisor', 'supervisor', 'accounts', 'digital-marketing', 'technician'];
    for (const slug of expectedRoles) {
      const cfg = getRoleConfigBySlug(slug);
      assert(cfg !== undefined, `Role configuration defined for /panels/${slug}`);
    }

    // 5. Job Card 13-Stage Workflow Progression
    console.log('\n--- 5. Testing 13-Stage Job Card Workflow ---');
    const firstJob = jobCards[0];
    const initialStage = firstJob.currentStage;
    const updated = await db.updateJobCard(firstJob.id, {
      currentStage: 'Mechanical Work',
      jobStatus: 'Active',
    });
    assert(updated?.currentStage === 'Mechanical Work', `Job card ${firstJob.jobCardNumber} stage updated to Mechanical Work`);

    // Restore original stage
    await db.updateJobCard(firstJob.id, { currentStage: initialStage });

    // 6. Activity Logging & Audit Trail
    console.log('\n--- 6. Testing Audit Log Engine ---');
    const newLog = await db.logActivity({
      action: 'SYSTEM_TEST_RUN',
      entityType: 'User',
      entityId: adminUser.id,
      performedBy: 'Test Runner',
      userRole: 'super_admin',
      details: 'Automated test suite verification execution.',
    });
    assert(newLog.id.startsWith('log_'), 'Activity log recorded with unique ID');

    const logs = await db.getActivityLogs();
    assert(logs.some((l) => l.action === 'SYSTEM_TEST_RUN'), 'Recorded activity log verified in store');

    console.log('\n========================================================');
    console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log('========================================================\n');

    if (failed > 0) process.exit(1);
  } catch (err) {
    console.error('Test execution error:', err);
    process.exit(1);
  }
}

runTests();
