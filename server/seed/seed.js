require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Project = require('../models/Project');
const Task = require('../models/Task');
const TaskRequest = require('../models/TaskRequest');
const Milestone = require('../models/Milestone');
const File = require('../models/File');
const Comment = require('../models/Comment');
const Activity = require('../models/Activity');
const Notification = require('../models/Notification');
const Candidate = require('../models/Candidate');
const LetterTemplate = require('../models/LetterTemplate');
const AppointmentLetter = require('../models/AppointmentLetter');
const HRApproval = require('../models/HRApproval');
const HRAuditLog = require('../models/HRAuditLog');
const HRSettings = require('../models/HRSettings');
const { determineProjectHealth, recalculateProjectProgress } = require('../services/progressService');

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/clientportal';
    console.log(`[Seed] Connecting to MongoDB: ${mongoUri}`);
    await mongoose.connect(mongoUri);

    console.log('[Seed] Clearing existing collections...');
    await Promise.all([
      User.deleteMany({}),
      Project.deleteMany({}),
      Task.deleteMany({}),
      TaskRequest.deleteMany({}),
      Milestone.deleteMany({}),
      File.deleteMany({}),
      Comment.deleteMany({}),
      Activity.deleteMany({}),
      Notification.deleteMany({}),
      Candidate.deleteMany({}),
      LetterTemplate.deleteMany({}),
      AppointmentLetter.deleteMany({}),
      HRApproval.deleteMany({}),
      HRAuditLog.deleteMany({}),
      HRSettings.deleteMany({})
    ]);

    console.log('[Seed] Creating demo users (1 Admin, 1 HR, 3 Workers, 3 Clients)...');

    // 1 Admin
    const admin = await User.create({
      name: 'Alex Rivera',
      email: 'admin@clientportal.com',
      password: 'Admin@123',
      role: 'ADMIN',
      title: 'Managing Director & Lead Architect',
      companyName: 'Apex Digital Systems Ltd',
      phone: '+1 (555) 234-5678',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
    });

    // 1 HR Lead
    const hrLead = await User.create({
      name: 'Meera Nambiar',
      email: 'hr@genfrex.com',
      password: 'Hr@123',
      role: 'HR',
      title: 'Head of Talent & People Operations',
      companyName: 'GENFREX Ecosystem',
      phone: '+91 (987) 654-3210',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
    });

    // 3 Workers
    const workerArun = await User.create({
      name: 'Arun Kumar',
      email: 'arun@clientportal.com',
      password: 'Worker@123',
      role: 'WORKER',
      title: 'Senior Backend & Cloud Engineer',
      companyName: 'Apex Digital Systems Ltd',
      skills: ['Node.js', 'Express', 'MongoDB', 'Docker', 'AWS'],
      phone: '+1 (555) 345-6789',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
    });

    const workerPriya = await User.create({
      name: 'Priya Sharma',
      email: 'priya@clientportal.com',
      password: 'Worker@123',
      role: 'WORKER',
      title: 'Senior Frontend & Mobile Engineer',
      skills: ['React', 'TypeScript', 'Tailwind CSS', 'Next.js'],
      phone: '+1 (555) 456-7890',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80'
    });

    const workerDavid = await User.create({
      name: 'David Chen',
      email: 'david@clientportal.com',
      password: 'Worker@123',
      role: 'WORKER',
      title: 'UI/UX Product Designer & QA',
      skills: ['Figma', 'UI Prototyping', 'Jest', 'Cypress'],
      phone: '+1 (555) 567-8901',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'
    });

    // 3 Clients
    const clientSarah = await User.create({
      name: 'Sarah Jenkins',
      email: 'client@clientportal.com',
      password: 'Client@123',
      role: 'CLIENT',
      title: 'VP of Technology',
      companyName: 'Acme Global Corp',
      phone: '+1 (555) 876-5432',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80'
    });

    const clientMarcus = await User.create({
      name: 'Marcus Vance',
      email: 'marcus@vancetech.io',
      password: 'Client@123',
      role: 'CLIENT',
      title: 'Chief Executive Officer',
      companyName: 'Vance Logistics Solutions',
      phone: '+1 (555) 987-6543',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80'
    });

    const clientElena = await User.create({
      name: 'Elena Rostova',
      email: 'elena@novapharma.com',
      password: 'Client@123',
      role: 'CLIENT',
      title: 'Head of Digital Products',
      companyName: 'Nova Health & BioPharma',
      phone: '+1 (555) 678-1234',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80'
    });

    console.log('[Seed] Creating projects across various stages...');

    // Project 1: Acme Enterprise Portal (DEVELOPMENT stage)
    const project1 = await Project.create({
      name: 'Acme Global Customer Portal',
      description: 'End-to-end multi-tenant customer onboarding, billing, and real-time subscription management portal.',
      client: clientSarah._id,
      createdBy: admin._id,
      assignedWorkers: [workerArun._id, workerPriya._id, workerDavid._id],
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
      status: 'IN_PROGRESS',
      stage: 'DEVELOPMENT',
      health: 'ON_TRACK',
      budget: 28500,
      progress: 60
    });

    // Project 2: Vance Fleet Operations App (CLIENT_REVIEW stage)
    const project2 = await Project.create({
      name: 'Vance Fleet Tracking Engine',
      description: 'IoT telemetry gateway, GPS fleet optimization, route dispatching dashboard and driver mobile companion app.',
      client: clientMarcus._id,
      createdBy: admin._id,
      assignedWorkers: [workerArun._id, workerDavid._id],
      startDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      status: 'IN_PROGRESS',
      stage: 'CLIENT_REVIEW',
      health: 'AT_RISK',
      budget: 34000,
      progress: 85
    });

    // Project 3: Nova Health Patient Intake (DESIGN stage)
    const project3 = await Project.create({
      name: 'Nova Health Telemedicine Suite',
      description: 'HIPAA-compliant video consultation portal, prescription generation, and electronic medical record synchronization.',
      client: clientElena._id,
      createdBy: admin._id,
      assignedWorkers: [workerDavid._id, workerPriya._id],
      startDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
      status: 'IN_PROGRESS',
      stage: 'DESIGN',
      health: 'ON_TRACK',
      budget: 42000,
      progress: 25
    });

    console.log('[Seed] Creating project milestones...');
    const m1_1 = await Milestone.create({
      project: project1._id,
      title: 'Phase 1: Architecture & API Specs',
      description: 'System architecture, DB design schemas, and authentication flow specs.',
      dueDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
      status: 'COMPLETED'
    });

    const m1_2 = await Milestone.create({
      project: project1._id,
      title: 'Phase 2: Core Subscription & Payment Engine',
      description: 'Stripe webhook integration, tier upgrades, and automated invoice PDF generation.',
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      status: 'IN_PROGRESS'
    });

    const m1_3 = await Milestone.create({
      project: project1._id,
      title: 'Phase 3: Security Hardening & UAT Launch',
      description: 'End-to-end penetration testing, multi-factor auth, and client acceptance testing.',
      dueDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
      status: 'PENDING'
    });

    console.log('[Seed] Creating realistic tasks with assigned workers...');

    // Tasks for Project 1
    const task1 = await Task.create({
      project: project1._id,
      milestone: m1_1._id,
      title: 'Design Database Schemas & Data Models',
      description: 'Define relational models for Users, Subscriptions, Invoices, and Audit records.',
      createdBy: admin._id,
      assignedBy: admin._id,
      assignedTo: workerArun._id,
      status: 'COMPLETED',
      priority: 'HIGH',
      progress: 100,
      dueDate: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000),
      startedAt: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000),
      completedAt: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000),
      estimatedHours: 16,
      actualHours: 14,
      clientVisible: true
    });

    const task2 = await Task.create({
      project: project1._id,
      milestone: m1_1._id,
      title: 'Implement JWT Authentication & Session Guards',
      description: 'Secure token exchange, password hashing, and role authorization middleware.',
      createdBy: admin._id,
      assignedBy: admin._id,
      assignedTo: workerArun._id,
      status: 'COMPLETED',
      priority: 'HIGH',
      progress: 100,
      dueDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
      startedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
      completedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
      estimatedHours: 20,
      actualHours: 18,
      clientVisible: true
    });

    const task3 = await Task.create({
      project: project1._id,
      milestone: m1_2._id,
      title: 'Build Billing & Invoice Management UI',
      description: 'React responsive billing view, transaction tables, and card updating modal.',
      createdBy: admin._id,
      assignedBy: admin._id,
      assignedTo: workerPriya._id,
      status: 'IN_PROGRESS',
      priority: 'MEDIUM',
      progress: 65,
      dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
      startedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      estimatedHours: 24,
      actualHours: 16,
      clientVisible: true
    });

    const task4 = await Task.create({
      project: project1._id,
      milestone: m1_2._id,
      title: 'Stripe Webhook & Payment Gateway Integration',
      description: 'Handle charge.succeeded, customer.subscription.updated, and failed payment retries.',
      createdBy: admin._id,
      assignedBy: admin._id,
      assignedTo: workerArun._id,
      status: 'IN_REVIEW',
      priority: 'HIGH',
      progress: 100,
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      startedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      estimatedHours: 18,
      actualHours: 17,
      clientVisible: true
    });

    const task5 = await Task.create({
      project: project1._id,
      milestone: m1_2._id,
      title: 'Third-Party SSO Integration (Google & Azure AD)',
      description: 'Awaiting Azure AD tenant credentials from Acme IT security team.',
      createdBy: admin._id,
      assignedBy: admin._id,
      assignedTo: workerPriya._id,
      status: 'BLOCKED',
      priority: 'URGENT',
      progress: 30,
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      startedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
      estimatedHours: 12,
      actualHours: 6,
      clientVisible: true
    });

    // Task for Project 2
    await Task.create({
      project: project2._id,
      title: 'Real-Time Telemetry Map WebSocket Layer',
      description: 'Stream GPS coordinates into Mapbox cluster markers with low latency.',
      createdBy: admin._id,
      assignedBy: admin._id,
      assignedTo: workerArun._id,
      status: 'COMPLETED',
      priority: 'HIGH',
      progress: 100,
      dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      startedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      completedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      clientVisible: true
    });

    console.log('[Seed] Creating TaskRequests (Client requirement workflow)...');

    // 1 Pending Task Request from Sarah Jenkins
    const req1 = await TaskRequest.create({
      title: 'Add Multi-Currency Checkout (USD, EUR, GBP)',
      description: 'Our European branch requires auto-detecting client location and invoicing in Euros and GBP alongside USD.',
      project: project1._id,
      requestedBy: clientSarah._id,
      priority: 'HIGH',
      requestedDeadline: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000),
      status: 'PENDING_APPROVAL'
    });

    // 1 Already Approved Task Request
    const approvedTask = await Task.create({
      project: project1._id,
      title: 'Export Audit Logs to CSV & Excel',
      description: 'Provide an export action on security audit trail for compliance officers.',
      createdBy: admin._id,
      requestedBy: clientSarah._id,
      assignedBy: admin._id,
      assignedTo: workerArun._id,
      status: 'ASSIGNED',
      priority: 'MEDIUM',
      progress: 0,
      dueDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
      clientVisible: true
    });

    await TaskRequest.create({
      title: 'Export Audit Logs to CSV & Excel',
      description: 'Provide an export action on security audit trail for compliance officers.',
      project: project1._id,
      requestedBy: clientSarah._id,
      priority: 'MEDIUM',
      requestedDeadline: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
      status: 'APPROVED',
      reviewedBy: admin._id,
      reviewedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      adminNotes: 'Approved and assigned to Arun Kumar for sprint 3.',
      createdTask: approvedTask._id
    });

    console.log('[Seed] Creating deliverables & files...');

    const file1 = await File.create({
      project: project1._id,
      task: task4._id,
      uploadedBy: workerArun._id,
      fileName: 'Acme_Subscription_Architecture_v2.pdf',
      fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      fileType: 'application/pdf',
      fileSize: 1048576,
      category: 'DELIVERABLE',
      isDeliverable: true,
      approvalStatus: 'PENDING_REVIEW'
    });

    const file2 = await File.create({
      project: project1._id,
      task: task1._id,
      uploadedBy: admin._id,
      fileName: 'Database_ERD_Specification.png',
      fileUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80',
      fileType: 'image/png',
      fileSize: 524288,
      category: 'DELIVERABLE',
      isDeliverable: true,
      approvalStatus: 'APPROVED',
      reviewedBy: clientSarah._id,
      reviewedAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000)
    });

    const file3 = await File.create({
      project: project1._id,
      task: task3._id,
      uploadedBy: workerPriya._id,
      fileName: 'Billing_Dashboard_UI_Mockups.fig',
      fileUrl: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&auto=format&fit=crop&q=80',
      fileType: 'application/octet-stream',
      fileSize: 2097152,
      category: 'DELIVERABLE',
      isDeliverable: true,
      approvalStatus: 'CHANGES_REQUESTED',
      revisionNotes: 'Please increase font contrast on table headers and add a total annual savings banner on tier upgrades.',
      reviewedBy: clientSarah._id,
      reviewedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
    });

    console.log('[Seed] Creating comments (public client feedback & internal team notes)...');

    // Public client comment
    await Comment.create({
      project: project1._id,
      user: clientSarah._id,
      message: 'The billing UI layout is looking very solid! Just left revision notes on the mockups regarding annual savings badges.',
      isInternal: false
    });

    // Admin reply
    await Comment.create({
      project: project1._id,
      user: admin._id,
      message: 'Thanks Sarah! Priya is already updating the Figma wireframes with higher contrast tokens and annual discount ribbons.',
      isInternal: false
    });

    // Internal Worker-Admin note (NEVER visible to client)
    await Comment.create({
      project: project1._id,
      task: task5._id,
      user: workerPriya._id,
      message: '[INTERNAL NOTE]: Still blocked on the Azure AD tenant ID. Escalated to client IT liaison via direct email.',
      isInternal: true
    });

    console.log('[Seed] Creating activity audit trail...');

    await Activity.create([
      {
        project: project1._id,
        user: admin._id,
        action: 'PROJECT_CREATED',
        description: 'Alex Rivera created project "Acme Global Customer Portal".',
        entityType: 'PROJECT',
        entityId: project1._id,
        clientVisible: true,
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      },
      {
        project: project1._id,
        user: admin._id,
        action: 'TASK_ASSIGNED',
        description: 'Task "Design Database Schemas & Data Models" assigned to Arun Kumar.',
        entityType: 'TASK',
        entityId: task1._id,
        clientVisible: true,
        createdAt: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000)
      },
      {
        project: project1._id,
        user: workerArun._id,
        action: 'TASK_STARTED',
        description: 'Arun Kumar started working on "Design Database Schemas & Data Models".',
        entityType: 'TASK',
        entityId: task1._id,
        clientVisible: true,
        createdAt: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000)
      },
      {
        project: project1._id,
        user: admin._id,
        action: 'TASK_COMPLETED',
        description: 'Alex Rivera marked task "Design Database Schemas & Data Models" as completed.',
        entityType: 'TASK',
        entityId: task1._id,
        clientVisible: true,
        createdAt: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000)
      },
      {
        project: project1._id,
        user: clientSarah._id,
        action: 'DELIVERABLE_APPROVED',
        description: 'Sarah Jenkins approved deliverable "Database_ERD_Specification.png".',
        entityType: 'FILE',
        entityId: file2._id,
        clientVisible: true,
        createdAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000)
      },
      {
        project: project1._id,
        user: clientSarah._id,
        action: 'TASK_REQUEST_CREATED',
        description: 'Sarah Jenkins submitted task request "Add Multi-Currency Checkout (USD, EUR, GBP)".',
        entityType: 'TASK_REQUEST',
        entityId: req1._id,
        clientVisible: true,
        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)
      },
      {
        project: project1._id,
        user: clientSarah._id,
        action: 'CHANGES_REQUESTED',
        description: 'Sarah Jenkins requested changes on "Billing_Dashboard_UI_Mockups.fig": Please increase font contrast on table headers and add a total annual savings banner on tier upgrades.',
        entityType: 'FILE',
        entityId: file3._id,
        clientVisible: true,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
      },
      {
        project: project1._id,
        user: workerPriya._id,
        action: 'TASK_BLOCKED',
        description: 'Priya Sharma reported task "Third-Party SSO Integration (Google & Azure AD)" is BLOCKED.',
        entityType: 'TASK',
        entityId: task5._id,
        clientVisible: false,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      },
      {
        project: project1._id,
        user: workerArun._id,
        action: 'TASK_SUBMITTED_FOR_REVIEW',
        description: 'Arun Kumar submitted task "Stripe Webhook & Payment Gateway Integration" for review.',
        entityType: 'TASK',
        entityId: task4._id,
        clientVisible: false,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      }
    ]);

    console.log('[Seed] Creating role-aware notifications...');

    // Admin notifications
    await Notification.create([
      {
        user: admin._id,
        project: project1._id,
        title: 'New Client Task Request',
        message: 'Sarah Jenkins submitted task request "Add Multi-Currency Checkout (USD, EUR, GBP)".',
        type: 'TASK_REQUEST',
        link: '/admin/task-requests'
      },
      {
        user: admin._id,
        project: project1._id,
        title: 'Task Awaiting Review',
        message: 'Arun Kumar submitted task "Stripe Webhook & Payment Gateway Integration" for review.',
        type: 'TASK',
        link: '/admin/tasks'
      },
      {
        user: admin._id,
        project: project1._id,
        title: 'Deliverable Revision Requested',
        message: 'Sarah Jenkins requested changes for "Billing_Dashboard_UI_Mockups.fig".',
        type: 'FEEDBACK',
        link: `/admin/projects/${project1._id}`
      }
    ]);

    // Worker Arun notifications
    await Notification.create([
      {
        user: workerArun._id,
        project: project1._id,
        title: 'New Task Assigned',
        message: 'You have been assigned to task "Export Audit Logs to CSV & Excel".',
        type: 'TASK',
        link: `/worker/tasks/${approvedTask._id}`
      }
    ]);

    // Client Sarah notifications
    await Notification.create([
      {
        user: clientSarah._id,
        project: project1._id,
        title: 'Deliverable Ready for Review',
        message: 'New deliverable "Acme_Subscription_Architecture_v2.pdf" is ready for review and sign-off.',
        type: 'FILE',
        link: '/client/files'
      }
    ]);

    // Recalculate dynamic health & progress for all projects
    await recalculateProjectProgress(project1._id, admin._id);
    await recalculateProjectProgress(project2._id, admin._id);
    await recalculateProjectProgress(project3._id, admin._id);

    console.log('[Seed] Seeding GENFREX HR & Appointment module...');

    // HR Settings
    await HRSettings.create({
      companyName: 'GENFREX',
      tagline: 'Build. Grow. Connect.',
      officialEmail: 'genfrexofficial@gmail.com',
      companyAddress: 'GENFREX Digital Services HQ, Tech Park, Bengaluru, India',
      referencePrefix: 'GFX/HR',
      referenceYear: 2026,
      currentSequence: 5,
      signatories: [
        { name: 'P.S. Dharshan', designation: 'Founder', title: 'Founder, GENFREX', isDefault: true },
        { name: 'Deepak P', designation: 'Chief Operating Officer', title: 'Chief Operating Officer, GENFREX', isDefault: true }
      ]
    });

    // Master GENFREX Trainee Letter Template
    const template = await LetterTemplate.create({
      name: 'GENFREX Trainee Appointment Letter',
      appointmentType: 'TRAINEE',
      title: 'TRAINEE APPOINTMENT LETTER',
      subtitle: 'DIGITAL SERVICES & TALENT ECOSYSTEM',
      companyName: 'GENFREX',
      tagline: 'Build. Grow. Connect.',
      officialEmail: 'genfrexofficial@gmail.com',
      website: 'www.genfrex.com',
      aboutGenfrex: 'GENFREX is a next-generation digital services and talent ecosystem committed to empowering enterprises and innovators with cutting-edge engineering, scalable digital products, and high-impact talent solutions. We bridge industry demands with world-class technical capabilities to build robust, modern digital solutions.',
      roleAndResponsibilities: [
        'Execute assigned technical tasks, modules, and software features in alignment with GENFREX quality standards.',
        'Collaborate proactively with technical leads, cross-functional engineering teams, and project stakeholders.',
        'Participate in sprint planning, architecture reviews, daily standups, and codebase documentation.',
        'Continuously enhance technical proficiencies and adhere to best development and security practices.'
      ],
      termsAndConditions: [
        'Appointment Status: This appointment is for training and professional development within the GENFREX ecosystem. Successful completion of the trainee period may lead to performance-based full-time consideration.',
        'Working Hours & Mode: The trainee shall adhere to the agreed schedule and mode of engagement (Remote, Hybrid, or On-site) specified in the appointment details.',
        'Compensation: A monthly stipend/compensation shall be disbursed in accordance with GENFREX payroll schedules, subject to statutory deductions where applicable.',
        'Notice Period: Either party may terminate this trainee engagement by providing a written notice of 15 days or compensation in lieu thereof during the trainee period.'
      ],
      confidentialityClause: 'The Trainee acknowledges that during the tenure of this appointment, they may have access to confidential, proprietary, trade secret, client data, and intellectual property belonging to GENFREX or its affiliated clients. The Trainee agrees to hold all such information in strict confidence and shall not disclose, replicate, reverse-engineer, or misuse any proprietary data without prior written authorization from GENFREX. This obligation survives the termination or expiration of this appointment.',
      professionalConductClause: 'The Trainee agrees to maintain the highest standards of professional integrity, diligence, and ethical conduct. Non-compliance with company policies, willful misconduct, breach of client trust, or unauthorized external representation of GENFREX may result in immediate revocation of this appointment.',
      acceptanceTerms: 'Please signify your acceptance of this Trainee Appointment Letter and its incorporated terms by signing and returning the duplicate copy on or before the acceptance deadline mentioned herein.',
      signatories: [
        { name: 'P.S. Dharshan', designation: 'Founder', title: 'Founder, GENFREX' },
        { name: 'Deepak P', designation: 'Chief Operating Officer', title: 'Chief Operating Officer, GENFREX' }
      ],
      version: 1,
      active: true,
      updatedBy: admin._id
    });

    // Candidates
    const candRohan = await Candidate.create({
      name: 'Rohan Sharma',
      email: 'rohan.sharma@example.com',
      phone: '+91 91234 56789',
      address: 'Indiranagar, Bengaluru, Karnataka, India',
      designation: 'Trainee Full-Stack Engineer',
      department: 'Engineering',
      employmentType: 'Trainee',
      candidateStatus: 'ACTIVE',
      joiningDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      workLocation: 'Hybrid - Bengaluru HQ',
      reportingManager: 'Arun Kumar',
      compensation: 25000,
      compensationFrequency: 'STIPEND_MONTHLY',
      probationPeriod: '3 Months',
      notes: 'Strong candidate with React and Node.js foundational skills.',
      createdBy: hrLead._id
    });

    const candAnanya = await Candidate.create({
      name: 'Ananya Rao',
      email: 'ananya.rao@example.com',
      phone: '+91 92345 67890',
      address: 'Koramangala, Bengaluru, Karnataka, India',
      designation: 'Trainee UI/UX Product Designer',
      department: 'Design',
      employmentType: 'Trainee',
      candidateStatus: 'APPOINTED',
      joiningDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      workLocation: 'Remote',
      reportingManager: 'David Chen',
      compensation: 22000,
      compensationFrequency: 'STIPEND_MONTHLY',
      probationPeriod: '3 Months',
      notes: 'Exceptional Figma portfolio and typography eye.',
      createdBy: hrLead._id
    });

    const candVikram = await Candidate.create({
      name: 'Vikram Patel',
      email: 'vikram.patel@example.com',
      phone: '+91 93456 78901',
      address: 'HSR Layout, Bengaluru, Karnataka, India',
      designation: 'Trainee Cloud & DevOps Engineer',
      department: 'DevOps & Infrastructure',
      employmentType: 'Trainee',
      candidateStatus: 'APPOINTED',
      joiningDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
      workLocation: 'On-site - Bengaluru HQ',
      reportingManager: 'Alex Rivera',
      compensation: 28000,
      compensationFrequency: 'STIPEND_MONTHLY',
      probationPeriod: '3 Months',
      notes: 'Docker, Linux, and Kubernetes certifications.',
      createdBy: hrLead._id
    });

    // Appointment Letters in different lifecycle stages
    // 1. PENDING_APPROVAL (Awaiting Admin review)
    const letter1 = await AppointmentLetter.create({
      referenceNumber: 'GFX/HR/2026/0001',
      candidateId: candRohan._id,
      appointmentType: 'TRAINEE',
      title: 'TRAINEE APPOINTMENT LETTER',
      designation: 'Trainee Full-Stack Engineer',
      department: 'Engineering',
      appointmentDate: new Date(),
      joiningDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      workLocation: 'Hybrid - Bengaluru HQ',
      reportingManager: 'Arun Kumar',
      compensation: 25000,
      compensationFrequency: 'STIPEND_MONTHLY',
      responsibilities: template.roleAndResponsibilities,
      terms: template.termsAndConditions,
      confidentialityTerms: template.confidentialityClause,
      professionalConductTerms: template.professionalConductClause,
      acceptanceDeadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      status: 'PENDING_APPROVAL',
      templateId: template._id,
      templateVersion: 1,
      createdBy: hrLead._id,
      submittedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
    });

    await HRApproval.create({
      appointmentLetterId: letter1._id,
      submittedBy: hrLead._id,
      action: 'SUBMIT',
      comments: 'Submitted for Admin Approval. Candidate cleared technical evaluation with distinction.'
    });

    // 2. APPROVED (Approved by Admin, ready for HR final review & send)
    const letter2 = await AppointmentLetter.create({
      referenceNumber: 'GFX/HR/2026/0002',
      candidateId: candAnanya._id,
      appointmentType: 'TRAINEE',
      title: 'TRAINEE APPOINTMENT LETTER',
      designation: 'Trainee UI/UX Product Designer',
      department: 'Design',
      appointmentDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      joiningDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      workLocation: 'Remote',
      reportingManager: 'David Chen',
      compensation: 22000,
      compensationFrequency: 'STIPEND_MONTHLY',
      responsibilities: template.roleAndResponsibilities,
      terms: template.termsAndConditions,
      confidentialityTerms: template.confidentialityClause,
      professionalConductTerms: template.professionalConductClause,
      acceptanceDeadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      status: 'APPROVED',
      templateId: template._id,
      templateVersion: 1,
      createdBy: hrLead._id,
      submittedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      approvedBy: admin._id,
      approvedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      approvalComment: 'Approved. Strong UI portfolio aligned with Q2 client deliverables.'
    });

    await HRApproval.create({
      appointmentLetterId: letter2._id,
      submittedBy: hrLead._id,
      reviewedBy: admin._id,
      action: 'APPROVE',
      comments: 'Approved. Strong UI portfolio aligned with Q2 client deliverables.'
    });

    // 3. SENT (Sent to candidate)
    const letter3 = await AppointmentLetter.create({
      referenceNumber: 'GFX/HR/2026/0003',
      candidateId: candVikram._id,
      appointmentType: 'TRAINEE',
      title: 'TRAINEE APPOINTMENT LETTER',
      designation: 'Trainee Cloud & DevOps Engineer',
      department: 'DevOps & Infrastructure',
      appointmentDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      joiningDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
      workLocation: 'On-site - Bengaluru HQ',
      reportingManager: 'Alex Rivera',
      compensation: 28000,
      compensationFrequency: 'STIPEND_MONTHLY',
      responsibilities: template.roleAndResponsibilities,
      terms: template.termsAndConditions,
      confidentialityTerms: template.confidentialityClause,
      professionalConductTerms: template.professionalConductClause,
      acceptanceDeadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      status: 'SENT',
      templateId: template._id,
      templateVersion: 1,
      createdBy: hrLead._id,
      submittedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      approvedBy: admin._id,
      approvedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      approvalComment: 'Approved for DevOps track.',
      sentAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      sentBy: hrLead._id,
      emailStatus: 'SENT',
      emailHistory: [
        {
          sentAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          sentBy: hrLead._id,
          recipient: candVikram.email,
          subject: 'GENFREX — Appointment Letter — Trainee Cloud & DevOps Engineer',
          status: 'SENT',
          providerMessageId: 'gfx_demo_msg_001'
        }
      ]
    });

    // 4. Draft
    await AppointmentLetter.create({
      referenceNumber: 'GFX/HR/2026/0004',
      candidateId: candRohan._id,
      appointmentType: 'TRAINEE',
      title: 'TRAINEE APPOINTMENT LETTER',
      designation: 'Trainee Backend Engineer',
      department: 'Engineering',
      appointmentDate: new Date(),
      joiningDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      workLocation: 'Remote',
      reportingManager: 'Arun Kumar',
      compensation: 24000,
      compensationFrequency: 'STIPEND_MONTHLY',
      responsibilities: template.roleAndResponsibilities,
      terms: template.termsAndConditions,
      confidentialityTerms: template.confidentialityClause,
      professionalConductTerms: template.professionalConductClause,
      acceptanceDeadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      status: 'DRAFT',
      templateId: template._id,
      templateVersion: 1,
      createdBy: hrLead._id
    });

    // Audit logs for HR events
    await HRAuditLog.create([
      {
        actorId: hrLead._id,
        action: 'APPOINTMENT_SUBMITTED',
        appointmentLetterId: letter1._id,
        candidateId: candRohan._id,
        newStatus: 'PENDING_APPROVAL',
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      },
      {
        actorId: admin._id,
        action: 'APPOINTMENT_APPROVED',
        appointmentLetterId: letter2._id,
        candidateId: candAnanya._id,
        previousStatus: 'PENDING_APPROVAL',
        newStatus: 'APPROVED',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      },
      {
        actorId: hrLead._id,
        action: 'APPOINTMENT_SENT',
        appointmentLetterId: letter3._id,
        candidateId: candVikram._id,
        previousStatus: 'APPROVED',
        newStatus: 'SENT',
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
      }
    ]);

    // Admin HR Notifications
    await Notification.create([
      {
        user: admin._id,
        title: 'New Appointment Approval Request',
        message: 'Meera Nambiar submitted letter GFX/HR/2026/0001 for Rohan Sharma (Trainee Full-Stack Engineer).',
        type: 'HR',
        link: '/admin/hr/pending-approvals'
      }
    ]);

    // HR notifications
    await Notification.create([
      {
        user: hrLead._id,
        title: 'Appointment Letter Approved',
        message: 'Admin approved letter GFX/HR/2026/0002 for Ananya Rao. Ready for PDF generation and dispatch.',
        type: 'HR',
        link: `/hr/appointments/${letter2._id}`
      }
    ]);

    console.log('====================================================');
    console.log('✅ GENFREX ClientFlow + OfferFlow database seeded successfully!');
    console.log('----------------------------------------------------');
    console.log('👑 ADMIN LOGIN:');
    console.log('   Email:    admin@clientportal.com');
    console.log('   Password: Admin@123');
    console.log('');
    console.log('💼 HR LOGIN:');
    console.log('   Email:    hr@genfrex.com');
    console.log('   Password: Hr@123');
    console.log('');
    console.log('👷 WORKER LOGINS:');
    console.log('   1. Arun Kumar:   arun@clientportal.com   / Worker@123');
    console.log('   2. Priya Sharma:  priya@clientportal.com  / Worker@123');
    console.log('   3. David Chen:    david@clientportal.com  / Worker@123');
    console.log('');
    console.log('👤 CLIENT LOGINS:');
    console.log('   1. Sarah Jenkins: client@clientportal.com / Client@123');
    console.log('   2. Marcus Vance:  marcus@vancetech.io     / Client@123');
    console.log('   3. Elena Rostova: elena@novapharma.com    / Client@123');
    console.log('====================================================');

    process.exit(0);
  } catch (error) {
    console.error(`[Seed Error] Database seeding failed: ${error.message}`);
    console.error(error);
    process.exit(1);
  }
};

seedDatabase();
