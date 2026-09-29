const User = require('../models/User');
const Project = require('../models/Project');
const Task = require('../models/Task');

// @desc    Get all clients
// @route   GET /api/users/clients
// @access  Private (Admin only)
const getClients = async (req, res, next) => {
  try {
    const clients = await User.find({ role: 'CLIENT' })
      .select('-password')
      .sort({ createdAt: -1 });

    const clientIds = clients.map((c) => c._id);
    const projects = await Project.find({ client: { $in: clientIds } }).select('client name status stage progress health');

    const clientsWithProjects = clients.map((client) => {
      const clientObj = client.toObject();
      clientObj.projects = projects.filter((p) => p.client.toString() === client._id.toString());
      clientObj.projectCount = clientObj.projects.length;
      return clientObj;
    });

    res.status(200).json({
      success: true,
      count: clientsWithProjects.length,
      clients: clientsWithProjects
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single client by ID with assigned projects
// @route   GET /api/users/clients/:id
// @access  Private (Admin only)
const getClientById = async (req, res, next) => {
  try {
    const client = await User.findOne({ _id: req.params.id, role: 'CLIENT' }).select('-password');
    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found.'
      });
    }

    const projects = await Project.find({ client: client._id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      client,
      projects
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new client account
// @route   POST /api/users/clients
// @access  Private (Admin only)
const createClient = async (req, res, next) => {
  try {
    const { name, email, companyName, phone, password } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide client name and email.'
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email address already exists.'
      });
    }

    const tempPassword = password || `Client@${Math.floor(100 + Math.random() * 900)}`;

    const newClient = await User.create({
      name,
      email: email.toLowerCase(),
      password: tempPassword,
      companyName: companyName || '',
      phone: phone || '',
      role: 'CLIENT'
    });

    res.status(201).json({
      success: true,
      message: 'Client account created successfully.',
      temporaryPassword: tempPassword,
      client: {
        id: newClient._id,
        name: newClient.name,
        email: newClient.email,
        companyName: newClient.companyName,
        phone: newClient.phone,
        role: newClient.role,
        createdAt: newClient.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all workers with real live workload metrics
// @route   GET /api/users/workers
// @access  Private (Admin only)
const getWorkers = async (req, res, next) => {
  try {
    const workers = await User.find({ role: 'WORKER' })
      .select('-password')
      .sort({ createdAt: -1 });

    const now = new Date();

    // Compute live workload for each worker from Task collection
    const workersWithWorkload = await Promise.all(
      workers.map(async (worker) => {
        const workerObj = worker.toObject();

        const [assigned, inProgress, awaitingReview, completed, blocked, overdue] = await Promise.all([
          Task.countDocuments({ assignedTo: worker._id, status: { $in: ['ASSIGNED', 'TODO'] } }),
          Task.countDocuments({ assignedTo: worker._id, status: 'IN_PROGRESS' }),
          Task.countDocuments({ assignedTo: worker._id, status: 'IN_REVIEW' }),
          Task.countDocuments({ assignedTo: worker._id, status: 'COMPLETED' }),
          Task.countDocuments({ assignedTo: worker._id, status: 'BLOCKED' }),
          Task.countDocuments({
            assignedTo: worker._id,
            status: { $ne: 'COMPLETED' },
            dueDate: { $lt: now, $ne: null }
          })
        ]);

        const totalActive = assigned + inProgress + awaitingReview + blocked;

        workerObj.workload = {
          assigned,
          inProgress,
          awaitingReview,
          completed,
          blocked,
          overdue,
          totalActive
        };

        return workerObj;
      })
    );

    res.status(200).json({
      success: true,
      count: workersWithWorkload.length,
      workers: workersWithWorkload
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single worker by ID with tasks
// @route   GET /api/users/workers/:id
// @access  Private (Admin only)
const getWorkerById = async (req, res, next) => {
  try {
    const worker = await User.findOne({ _id: req.params.id, role: 'WORKER' }).select('-password');
    if (!worker) {
      return res.status(404).json({
        success: false,
        message: 'Worker not found.'
      });
    }

    const tasks = await Task.find({ assignedTo: worker._id })
      .populate('project', 'name status stage client')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      worker,
      tasks
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new worker account
// @route   POST /api/users/workers
// @access  Private (Admin only)
const createWorker = async (req, res, next) => {
  try {
    const { name, email, password, title, skills, phone } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide worker name and email.'
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email address already exists.'
      });
    }

    const tempPassword = password || `Worker@${Math.floor(100 + Math.random() * 900)}`;

    const newWorker = await User.create({
      name,
      email: email.toLowerCase(),
      password: tempPassword,
      role: 'WORKER',
      title: title || 'Engineer',
      skills: Array.isArray(skills) ? skills : (skills ? skills.split(',').map((s) => s.trim()) : []),
      phone: phone || ''
    });

    res.status(201).json({
      success: true,
      message: 'Worker account created successfully.',
      temporaryPassword: tempPassword,
      worker: {
        id: newWorker._id,
        name: newWorker.name,
        email: newWorker.email,
        title: newWorker.title,
        skills: newWorker.skills,
        phone: newWorker.phone,
        role: newWorker.role,
        createdAt: newWorker.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getClients,
  getClientById,
  createClient,
  getWorkers,
  getWorkerById,
  createWorker
};
