const User = require('../models/User');
const Project = require('../models/Project');

// @desc    Get all clients
// @route   GET /api/users/clients
// @access  Private (Admin only)
const getClients = async (req, res, next) => {
  try {
    const clients = await User.find({ role: 'CLIENT' })
      .select('-password')
      .sort({ createdAt: -1 });

    // Also get project count for each client
    const clientIds = clients.map((c) => c._id);
    const projects = await Project.find({ client: { $in: clientIds } }).select('client name status progress');

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

    // Default temporary password if not provided
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

module.exports = {
  getClients,
  getClientById,
  createClient
};
