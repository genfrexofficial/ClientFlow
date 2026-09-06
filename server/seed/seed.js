require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Project = require('../models/Project');
const Task = require('../models/Task');
const Milestone = require('../models/Milestone');
const File = require('../models/File');
const Comment = require('../models/Comment');
const Activity = require('../models/Activity');
const Notification = require('../models/Notification');

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
      Milestone.deleteMany({}),
      File.deleteMany({}),
      Comment.deleteMany({}),
      Activity.deleteMany({}),
      Notification.deleteMany({})
    ]);

    console.log('[Seed] Creating demo users...');
    // Create Admin
    const admin = await User.create({
      name: 'Alex Rivera',
      email: 'admin@clientportal.com',
      password: 'Admin@123',
      role: 'ADMIN',
      companyName: 'Apex Digital Agency',
      phone: '+1 (555) 234-5678',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
    });

    // Create Client
    const client = await User.create({
      name: 'Sarah Jenkins',
      email: 'client@clientportal.com',
      password: 'Client@123',
      role: 'CLIENT',
      companyName: 'Acme Global Corp',
      phone: '+1 (555) 876-5432',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80'
    });

    console.log('[Seed] Creating sample project...');
    const project = await Project.create({
      name: 'ABC Company Website',
      description: 'Full-stack corporate website development, brand refresh, interactive client dashboard, and CMS portal integration.',
      client: client._id,
      createdBy: admin._id,
      startDate: new Date('2026-08-15'),
      endDate: new Date('2026-09-30'),
      status: 'IN_PROGRESS',
      progress: 80,
      budget: 18500
    });

    console.log('[Seed] Creating milestones...');
    const milestones = await Milestone.create([
      {
        project: project._id,
        title: 'Discovery & System Architecture',
        description: 'Requirements gathering, stakeholder interviews, technical specs.',
        dueDate: new Date('2026-08-20'),
        status: 'COMPLETED'
      },
      {
        project: project._id,
        title: 'Wireframes & UI/UX Design System',
        description: 'Interactive Figma wireframes, color tokens, responsive components.',
        dueDate: new Date('2026-08-28'),
        status: 'COMPLETED'
      },
      {
        project: project._id,
        title: 'Frontend Component Development',
        description: 'React components, Tailwind layout, animations, and state flow.',
        dueDate: new Date('2026-09-08'),
        status: 'COMPLETED'
      },
      {
        project: project._id,
        title: 'CMS & Backend Integration',
        description: 'Express APIs, database models, file upload services, and role security.',
        dueDate: new Date('2026-09-18'),
        status: 'IN_PROGRESS'
      },
      {
        project: project._id,
        title: 'QA Testing & Production Launch',
        description: 'Cross-browser testing, accessibility audit, DNS configuration, and live rollout.',
        dueDate: new Date('2026-09-28'),
        status: 'PENDING'
      }
    ]);

    console.log('[Seed] Creating tasks (8 completed, 2 pending -> 80% progress)...');
    await Task.create([
      {
        project: project._id,
        title: 'Stakeholder discovery and scope finalization',
        description: 'Consolidate client goals, branding requirements, and deliverable timeline.',
        assignedTo: admin._id,
        status: 'COMPLETED',
        priority: 'HIGH',
        dueDate: new Date('2026-08-18')
      },
      {
        project: project._id,
        title: 'Information architecture and navigation wireframes',
        description: 'Define visual hierarchy, header navigation, and client portal layout.',
        assignedTo: admin._id,
        status: 'COMPLETED',
        priority: 'MEDIUM',
        dueDate: new Date('2026-08-22')
      },
      {
        project: project._id,
        title: 'Design system tokens and responsive components',
        description: 'Setup primary indigo palette, dark/light contrast, and typography.',
        assignedTo: admin._id,
        status: 'COMPLETED',
        priority: 'HIGH',
        dueDate: new Date('2026-08-26')
      },
      {
        project: project._id,
        title: 'Homepage design mockups & prototype',
        description: 'Create hero section, feature highlights, and interactive call to actions.',
        assignedTo: admin._id,
        status: 'COMPLETED',
        priority: 'HIGH',
        dueDate: new Date('2026-08-30')
      },
      {
        project: project._id,
        title: 'Responsive mobile drawer navigation',
        description: 'Ensure smooth gestures and clean hamburger layout on mobile displays.',
        assignedTo: admin._id,
        status: 'COMPLETED',
        priority: 'MEDIUM',
        dueDate: new Date('2026-09-02')
      },
      {
        project: project._id,
        title: 'Client dashboard and status metrics',
        description: 'Implement real-time charts, progress ring, and milestone indicators.',
        assignedTo: admin._id,
        status: 'COMPLETED',
        priority: 'HIGH',
        dueDate: new Date('2026-09-04')
      },
      {
        project: project._id,
        title: 'Authentication & JWT role security',
        description: 'Set up bcrypt hashing, access tokens, and protected dashboard routing.',
        assignedTo: admin._id,
        status: 'COMPLETED',
        priority: 'HIGH',
        dueDate: new Date('2026-09-05')
      },
      {
        project: project._id,
        title: 'Cloudinary storage & deliverable review engine',
        description: 'Enable dual storage engine with file approvals and change requests.',
        assignedTo: admin._id,
        status: 'COMPLETED',
        priority: 'MEDIUM',
        dueDate: new Date('2026-09-06')
      },
      {
        project: project._id,
        title: 'Cross-browser responsive stress testing',
        description: 'Validate layout on Safari, Chrome, Firefox, iPad, and Android mobile.',
        assignedTo: admin._id,
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        dueDate: new Date('2026-09-12')
      },
      {
        project: project._id,
        title: 'Production SSL, domain DNS, and CDN deployment',
        description: 'Deploy backend to Render and frontend to Vercel with HTTPS.',
        assignedTo: admin._id,
        status: 'TODO',
        priority: 'MEDIUM',
        dueDate: new Date('2026-09-25')
      }
    ]);

    console.log('[Seed] Creating deliverables & project files...');
    const deliverable1 = await File.create({
      project: project._id,
      uploadedBy: admin._id,
      fileName: 'ABC-Brand-Identity-v2.pdf',
      fileUrl: 'https://images.unsplash.com/photo-1542744094-3a31f272c490?w=800&auto=format&fit=crop&q=80',
      publicId: 'seed_file_1',
      fileType: 'application/pdf',
      fileSize: 2450000,
      category: 'DOCUMENT',
      approvalStatus: 'APPROVED'
    });

    const deliverable2 = await File.create({
      project: project._id,
      uploadedBy: admin._id,
      fileName: 'Homepage-Design-Mockup-Final.png',
      fileUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80',
      publicId: 'seed_file_2',
      fileType: 'image/png',
      fileSize: 4200000,
      category: 'DESIGN',
      approvalStatus: 'APPROVED'
    });

    const deliverable3 = await File.create({
      project: project._id,
      uploadedBy: admin._id,
      fileName: 'Website-Staging-Build-v1.zip',
      fileUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80',
      publicId: 'seed_file_3',
      fileType: 'application/zip',
      fileSize: 18400000,
      category: 'DELIVERABLE',
      approvalStatus: 'PENDING_REVIEW'
    });

    console.log('[Seed] Creating comments & feedback...');
    await Comment.create([
      {
        project: project._id,
        file: deliverable2._id,
        user: client._id,
        message: 'The new indigo primary branding and hero section look clean and professional!'
      },
      {
        project: project._id,
        file: deliverable2._id,
        user: admin._id,
        message: 'Thank you Sarah! We will now proceed with connecting the staging build.'
      },
      {
        project: project._id,
        file: deliverable3._id,
        user: client._id,
        message: 'Reviewing the staging preview now. Will test on mobile devices.'
      }
    ]);

    console.log('[Seed] Creating activity timeline...');
    await Activity.create([
      {
        project: project._id,
        user: admin._id,
        action: 'PROJECT_CREATED',
        description: 'Alex Rivera created project "ABC Company Website".',
        createdAt: new Date('2026-08-15T09:00:00Z')
      },
      {
        project: project._id,
        user: admin._id,
        action: 'TASK_COMPLETED',
        description: 'Alex Rivera completed task "Stakeholder discovery and scope finalization".',
        createdAt: new Date('2026-08-18T14:30:00Z')
      },
      {
        project: project._id,
        user: admin._id,
        action: 'MILESTONE_COMPLETED',
        description: 'Milestone "Discovery & System Architecture" was completed.',
        createdAt: new Date('2026-08-20T17:00:00Z')
      },
      {
        project: project._id,
        user: admin._id,
        action: 'FILE_UPLOADED',
        description: 'Alex Rivera uploaded design "Homepage-Design-Mockup-Final.png".',
        createdAt: new Date('2026-08-30T11:15:00Z')
      },
      {
        project: project._id,
        user: client._id,
        action: 'DELIVERABLE_APPROVED',
        description: 'Sarah Jenkins approved deliverable "Homepage-Design-Mockup-Final.png".',
        createdAt: new Date('2026-09-01T16:45:00Z')
      },
      {
        project: project._id,
        user: admin._id,
        action: 'FILE_UPLOADED',
        description: 'Alex Rivera uploaded deliverable "Website-Staging-Build-v1.zip".',
        createdAt: new Date('2026-09-04T10:20:00Z')
      },
      {
        project: project._id,
        user: client._id,
        action: 'FEEDBACK_RECEIVED',
        description: 'Sarah Jenkins added feedback on "Website-Staging-Build-v1.zip".',
        createdAt: new Date('2026-09-05T08:15:00Z')
      }
    ]);

    console.log('[Seed] Creating in-app notifications...');
    await Notification.create([
      {
        user: client._id,
        project: project._id,
        type: 'FILE',
        message: 'New deliverable "Website-Staging-Build-v1.zip" is ready for your review.',
        isRead: false
      },
      {
        user: client._id,
        project: project._id,
        type: 'TASK',
        message: 'Task "Client dashboard and status metrics" has been completed.',
        isRead: true
      },
      {
        user: admin._id,
        project: project._id,
        type: 'APPROVAL',
        message: 'Deliverable "Homepage-Design-Mockup-Final.png" was approved by Sarah Jenkins.',
        isRead: false
      },
      {
        user: admin._id,
        project: project._id,
        type: 'FEEDBACK',
        message: 'Sarah Jenkins posted feedback on "Website-Staging-Build-v1.zip".',
        isRead: false
      }
    ]);

    console.log('==============================================');
    console.log('🎉 Database successfully seeded with demo data!');
    console.log('----------------------------------------------');
    console.log('Demo Admin Account:');
    console.log('Email:    admin@clientportal.com');
    console.log('Password: Admin@123');
    console.log('----------------------------------------------');
    console.log('Demo Client Account:');
    console.log('Email:    client@clientportal.com');
    console.log('Password: Client@123');
    console.log('----------------------------------------------');
    console.log(`Sample Project: "${project.name}" (80% complete, 10 tasks, 5 milestones)`);
    console.log('==============================================');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error(`[Seed Error] Failed to seed database: ${error.message}`);
    process.exit(1);
  }
};

seedDatabase();
