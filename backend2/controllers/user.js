const bcrypt = require('bcryptjs');
const prisma = require('../prisma/client');

// Get all users with filtering + pagination
const getAllUsers = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      role, 
      status, 
      name, 
      email, 
      contact_no, 
      department,
      created_from,
      created_to,
      updated_from,
      updated_to,
      sort_by = 'createdAt',
      sort_order = 'desc',
      search
    } = req.query;

    const take = parseInt(limit);
    const skip = (parseInt(page) - 1) * take;

    // Build where clause
    const where = {};

    if (role) {
      where.role = Array.isArray(role) ? { in: role } : role;
    }
    if (status !== undefined) {
      where.status = status === 'true';
    }
    if (name) {
      where.name = { contains: name };
    }
    if (email) {
      where.email = { contains: email };
    }
    if (contact_no) {
      where.contactNo = { contains: contact_no };
    }
    if (department) {
      where.department = { contains: department };
    }

    if (created_from || created_to) {
      where.createdAt = {};
      if (created_from) where.createdAt.gte = new Date(created_from);
      if (created_to) where.createdAt.lte = new Date(created_to);
    }
    if (updated_from || updated_to) {
      where.updatedAt = {};
      if (updated_from) where.updatedAt.gte = new Date(updated_from);
      if (updated_to) where.updatedAt.lte = new Date(updated_to);
    }

    // Global search across multiple fields
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { contactNo: { contains: search } },
        { department: { contains: search } }
      ];
    }

    const allowedSortFields = [
      'id', 'name', 'email', 'role', 'department', 'status', 'createdAt', 'updatedAt'
    ];
    const sortField = allowedSortFields.includes(sort_by) ? sort_by : 'createdAt';
    const sortDirection = sort_order.toLowerCase() === 'asc' ? 'asc' : 'desc';

    const [count, users] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        skip,
        take,
        orderBy: { [sortField]: sortDirection },
        select: {
          id: true,
          name: true,
          email: true,
          contactNo: true,
          role: true,
          department: true,
          status: true,
          createdAt: true,
          updatedAt: true
        }
      })
    ]);

    const totalPages = Math.ceil(count / take);
    const currentPage = parseInt(page);

    res.status(200).json({
      success: true,
      data: {
        users,
        pagination: {
          total: count,
          page: currentPage,
          limit: take,
          totalPages,
          hasNextPage: currentPage < totalPages,
          hasPrevPage: currentPage > 1,
          nextPage: currentPage < totalPages ? currentPage + 1 : null,
          prevPage: currentPage > 1 ? currentPage - 1 : null
        },
        filters: {
          role,
          status,
          name,
          email,
          contact_no,
          department,
          created_from,
          created_to,
          updated_from,
          updated_to,
          search,
          sort_by: sortField,
          sort_order: sortDirection.toUpperCase()
        }
      }
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message
    });
  }
};

// Get user by ID
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) },
      select: {
        id: true,
        name: true,
        email: true,
        contactNo: true,
        role: true,
        department: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        requestedTickets: {
          select: {
            id: true,
            subject: true,
            status: true,
            priority: true,
            createdAt: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({ success: false, message: 'Error fetching user', error: error.message });
  }
};

// Create new user
const createUser = async (req, res) => {
  try {
    const { name, email, password, contact_no, role, department } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User with this email already exists' });
    }

    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        contactNo: contact_no,
        role: role || 'user',
        department,
        status: true
      },
      select: {
        id: true,
        name: true,
        email: true,
        contactNo: true,
        role: true,
        department: true,
        status: true,
        createdAt: true,
        updatedAt: true
      }
    });

    res.status(201).json({ success: true, message: 'User created successfully', data: newUser });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ success: false, message: 'Error creating user', error: error.message });
  }
};

// Update user
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, contact_no, role, department, status, password } = req.body;

    const user = await prisma.user.findUnique({ where: { id: parseInt(id) } });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (email && email !== user.email) {
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ success: false, message: 'User with this email already exists' });
      }
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (contact_no) updateData.contactNo = contact_no;
    if (role) updateData.role = role;
    if (department) updateData.department = department;
    if (status !== undefined) updateData.status = status;

    if (password) {
      const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;
      updateData.password = await bcrypt.hash(password, saltRounds);
    }

    const updatedUser = await prisma.user.update({
      where: { id: parseInt(id) },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        contactNo: true,
        role: true,
        department: true,
        status: true,
        createdAt: true,
        updatedAt: true
      }
    });

    res.status(200).json({ success: true, message: 'User updated successfully', data: updatedUser });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ success: false, message: 'Error updating user', error: error.message });
  }
};

// Soft delete
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({ where: { id: parseInt(id) } });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    await prisma.user.update({ where: { id: parseInt(id) }, data: { status: false } });

    res.status(200).json({ success: true, message: 'User deactivated successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ success: false, message: 'Error deleting user', error: error.message });
  }
};

// Hard delete
const permanentDeleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({ where: { id: parseInt(id) } });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    await prisma.user.delete({ where: { id: parseInt(id) } });

    res.status(200).json({ success: true, message: 'User permanently deleted' });
  } catch (error) {
    console.error('Permanent delete user error:', error);
    res.status(500).json({ success: false, message: 'Error permanently deleting user', error: error.message });
  }
};

// Reactivate user
const reactivateUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({ where: { id: parseInt(id) } });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const reactivatedUser = await prisma.user.update({
      where: { id: parseInt(id) },
      data: { status: true },
      select: {
        id: true,
        name: true,
        email: true,
        contactNo: true,
        role: true,
        department: true,
        status: true,
        createdAt: true,
        updatedAt: true
      }
    });

    res.status(200).json({ success: true, message: 'User reactivated successfully', data: reactivatedUser });
  } catch (error) {
    console.error('Reactivate user error:', error);
    res.status(500).json({ success: false, message: 'Error reactivating user', error: error.message });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  permanentDeleteUser,
  reactivateUser
};
