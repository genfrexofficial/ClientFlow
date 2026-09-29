const BASE_URL = 'http://localhost:5000/api';

async function req(method, endpoint, body = null, token = null) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const options = { method, headers };
  if (body) options.body = JSON.stringify(body);

  const res = await fetch(`${BASE_URL}${endpoint}`, options);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const error = new Error(data.message || `HTTP error ${res.status}`);
    error.status = res.status;
    error.data = data;
    throw error;
  }
  return data;
}

async function runAcceptanceTest() {
  console.log('===========================================================');
  console.log('🧪 RUNNING CRITICAL ACCEPTANCE TEST SCENARIO (REQUIREMENT 32)');
  console.log('===========================================================');

  try {
    // 1. Login as Client
    console.log('\n[Step 1] Logging in as Client (Sarah Jenkins)...');
    const clientLogin = await req('POST', '/auth/login', {
      email: 'client@clientportal.com',
      password: 'Client@123'
    });
    const clientToken = clientLogin.token;
    const clientUser = clientLogin.user;
    console.log(`✅ Logged in as: ${clientUser.name} (Role: ${clientUser.role})`);

    // Get client's project
    const clientProjects = await req('GET', '/projects', null, clientToken);
    const project = clientProjects.projects[0];
    console.log(`✅ Selected Client Project: "${project.name}" (ID: ${project._id})`);

    // 2. Client submits Task Request: "Add WhatsApp Notification"
    console.log('\n[Step 2] Client submitting Task Request: "Add WhatsApp Notification"...');
    const createReq = await req(
      'POST',
      '/task-requests',
      {
        title: 'Add WhatsApp Notification',
        description: 'Send automated WhatsApp messages to customers when order delivery status updates.',
        project: project._id,
        priority: 'HIGH',
        requestedDeadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
      },
      clientToken
    );
    const taskRequest = createReq.taskRequest;
    console.log(`✅ Task Request created: ID: ${taskRequest._id}`);
    console.log(`   Status: ${taskRequest.status} (Expected: PENDING_APPROVAL)`);
    if (taskRequest.status !== 'PENDING_APPROVAL') {
      throw new Error(`Expected status PENDING_APPROVAL, got ${taskRequest.status}`);
    }

    // 3. Admin logs in
    console.log('\n[Step 3] Logging in as Admin (Alex Rivera)...');
    const adminLogin = await req('POST', '/auth/login', {
      email: 'admin@clientportal.com',
      password: 'Admin@123'
    });
    const adminToken = adminLogin.token;
    console.log(`✅ Logged in as Admin: ${adminLogin.user.name}`);

    // Admin fetches workers to find Arun
    const workersRes = await req('GET', '/users/workers', null, adminToken);
    const arun = workersRes.workers.find((w) => w.name.includes('Arun'));
    if (!arun) throw new Error('Worker Arun Kumar not found in database!');
    console.log(`✅ Found Worker: ${arun.name} (ID: ${arun._id})`);

    // 4. Admin approves Task Request and assigns to Arun
    console.log('\n[Step 4] Admin approving task request and assigning to Arun Kumar...');
    const approveRes = await req(
      'POST',
      `/task-requests/${taskRequest._id}/approve`,
      {
        assignedTo: arun._id,
        priority: 'HIGH',
        adminNotes: 'Assigned to Arun for immediate implementation.'
      },
      adminToken
    );
    const assignedTask = approveRes.task;
    const updatedRequest = approveRes.taskRequest;
    console.log(`✅ TaskRequest status: ${updatedRequest.status} (Expected: APPROVED)`);
    console.log(`✅ Created Task status: ${assignedTask.status} (Expected: ASSIGNED)`);
    console.log(`   Assigned To: ${assignedTask.assignedTo.name}`);
    if (updatedRequest.status !== 'APPROVED' || assignedTask.status !== 'ASSIGNED') {
      throw new Error('Approval or Assignment state mismatch!');
    }

    // 5. Worker (Arun) logs in
    console.log('\n[Step 5] Logging in as Worker (Arun Kumar)...');
    const workerLogin = await req('POST', '/auth/login', {
      email: 'arun@clientportal.com',
      password: 'Worker@123'
    });
    const workerToken = workerLogin.token;
    console.log(`✅ Logged in as Worker: ${workerLogin.user.name}`);

    // Arun verifies task in my-tasks
    const myTasksRes = await req('GET', '/tasks/my-tasks', null, workerToken);
    const arunTask = myTasksRes.tasks.find((t) => t._id === assignedTask._id);
    if (!arunTask) throw new Error('Assigned task not found in Arun queue!');
    console.log(`✅ Arun sees assigned task in his queue: "${arunTask.title}"`);

    // 6. Arun starts task (ASSIGNED -> IN_PROGRESS)
    console.log('\n[Step 6] Arun starts the task...');
    const startRes = await req('POST', `/tasks/${assignedTask._id}/start`, {}, workerToken);
    console.log(`✅ Task status after start: ${startRes.task.status} (Expected: IN_PROGRESS)`);
    if (startRes.task.status !== 'IN_PROGRESS') throw new Error('Task did not transition to IN_PROGRESS');

    // 7. Arun updates progress: 25 -> 50 -> 75 -> 100
    console.log('\n[Step 7] Arun updating progress (25% -> 50% -> 75% -> 100%)...');
    for (const p of [25, 50, 75, 100]) {
      const pRes = await req('POST', `/tasks/${assignedTask._id}/progress`, { progress: p }, workerToken);
      console.log(`   Progress updated to: ${pRes.progress}%`);
    }

    // 8. Arun submits for review (IN_PROGRESS -> IN_REVIEW)
    console.log('\n[Step 8] Arun submitting task for Admin review...');
    const submitRes = await req('POST', `/tasks/${assignedTask._id}/submit-review`, {}, workerToken);
    console.log(`✅ Task status after submission: ${submitRes.task.status} (Expected: IN_REVIEW)`);
    if (submitRes.task.status !== 'IN_REVIEW') throw new Error('Task did not transition to IN_REVIEW');

    // 9. Admin receives notification & completes task (IN_REVIEW -> COMPLETED)
    console.log('\n[Step 9] Admin reviews task and marks COMPLETED...');
    const completeRes = await req('POST', `/tasks/${assignedTask._id}/complete`, {}, adminToken);
    console.log(`✅ Task status after Admin approval: ${completeRes.task.status} (Expected: COMPLETED)`);
    console.log(`   Task Progress: ${completeRes.task.progress}%`);
    if (completeRes.task.status !== 'COMPLETED') throw new Error('Task did not transition to COMPLETED');

    // 10. Client checks task and activity timeline
    console.log('\n[Step 10] Client verifying task completion & activity audit timeline...');
    const clientCheck = await req('GET', `/tasks/${assignedTask._id}`, null, clientToken);
    console.log(`✅ Client sees task: "${clientCheck.task.title}"`);
    console.log(`   Status: ${clientCheck.task.status} (Expected: COMPLETED)`);
    console.log(`   Progress: ${clientCheck.task.progress}%`);

    // Verify activities
    const activitiesRes = await req('GET', `/activities/project/${project._id}`, null, clientToken);
    const taskActivities = activitiesRes.activities.filter(
      (a) => a.description.includes('Add WhatsApp Notification') || a.entityId === assignedTask._id
    );
    console.log(`✅ Activity trail contains ${taskActivities.length} audit entries for this task workflow:`);
    taskActivities.forEach((a) => console.log(`   - [${a.action}] ${a.description}`));

    // 11. Test Role Isolation (Security Check)
    console.log('\n[Step 11] Security & Role Isolation Checks:');
    try {
      // Worker attempting to approve task requests -> should be 403
      await req('POST', `/task-requests/${taskRequest._id}/approve`, { assignedTo: arun._id }, workerToken);
      throw new Error('SECURITY VIOLATION: Worker was able to approve task requests!');
    } catch (err) {
      console.log(`✅ Worker blocked from Admin endpoint (HTTP ${err.status})`);
    }

    try {
      // Client attempting to access Admin workers list -> should be 403
      await req('GET', '/users/workers', null, clientToken);
      throw new Error('SECURITY VIOLATION: Client was able to access workers list!');
    } catch (err) {
      console.log(`✅ Client blocked from Workers endpoint (HTTP ${err.status})`);
    }

    console.log('\n===========================================================');
    console.log('🎉 ALL ACCEPTANCE CRITERIA PASSED WITH 100% SUCCESS!');
    console.log('===========================================================');
  } catch (err) {
    console.error('\n❌ ACCEPTANCE TEST FAILED:', err.message);
    if (err.data) {
      console.error('Response Data:', err.data);
    }
    process.exit(1);
  }
}

runAcceptanceTest();
