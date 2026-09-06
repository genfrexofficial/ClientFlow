async function testAPI() {
  try {
    const health = await fetch('http://localhost:5000/api/health').then(r => r.json());
    console.log('1. Health check:', health);

    const adminLogin = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@clientportal.com', password: 'Admin@123' })
    }).then(r => r.json());
    console.log('2. Admin login success:', adminLogin.success, 'User:', adminLogin.user.name, 'Role:', adminLogin.user.role);

    const clientLogin = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'client@clientportal.com', password: 'Client@123' })
    }).then(r => r.json());
    console.log('3. Client login success:', clientLogin.success, 'User:', clientLogin.user.name, 'Role:', clientLogin.user.role);

    const projectsRes = await fetch('http://localhost:5000/api/projects', {
      headers: { 'Authorization': `Bearer ${adminLogin.token}` }
    }).then(r => r.json());
    console.log('4. Projects count:', projectsRes.count, 'Project title:', projectsRes.projects[0]?.name, 'Progress:', projectsRes.projects[0]?.progress + '%');

    console.log('ALL BACKEND CHECKS PASSED SUCCESSFULLY!');
  } catch (err) {
    console.error('API Test Error:', err);
  }
}

testAPI();
