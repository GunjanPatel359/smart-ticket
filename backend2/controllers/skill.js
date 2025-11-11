const prisma = require('../prisma/client');

// Get all skills without pagination (simple list)
const getAllSkillsSimple = async (req, res) => {
  try {
    const { is_active, sort_by = 'name', sort_order = 'ASC' } = req.query;

    // Active filter (default true)
    const where = {
      is_active: is_active !== undefined ? is_active === 'true' : true,
    };

    // Allowed sort fields
    const allowedSortFields = ['id', 'name', 'description', 'is_active', 'created_at', 'updated_at'];
    const sortField = allowedSortFields.includes(sort_by) ? sort_by : 'name';
    const sortDirection = ['ASC', 'DESC'].includes(sort_order.toUpperCase())
      ? sort_order.toUpperCase()
      : 'ASC';

    const skills = await prisma.skill.findMany({
      where,
      orderBy: { [sortField]: sortDirection.toLowerCase() },
      select: { id: true, name: true, description: true, is_active: true, created_at: true, updated_at: true },
    });

    res.status(200).json({
      success: true,
      data: {
        skills,
        total: skills.length,
        filters: { is_active: where.is_active, sort_by: sortField, sort_order: sortDirection },
      },
    });
  } catch (error) {
    console.error('Get all skills simple error:', error);
    res.status(500).json({ success: false, message: 'Error fetching skills', error: error.message });
  }
};

// Get all skills with comprehensive filtering and pagination
const getAllSkills = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      name,
      description,
      is_active,
      created_from,
      created_to,
      updated_from,
      updated_to,
      sort_by = 'created_at',
      sort_order = 'DESC',
      search,
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build filters
    const where = {};

    if (name) where.name = { contains: name, mode: 'insensitive' };
    if (description) where.description = { contains: description, mode: 'insensitive' };
    if (is_active !== undefined) where.is_active = is_active === 'true';

    if (created_from || created_to) {
      where.created_at = {};
      if (created_from) where.created_at.gte = new Date(created_from);
      if (created_to) where.created_at.lte = new Date(created_to);
    }

    if (updated_from || updated_to) {
      where.updated_at = {};
      if (updated_from) where.updated_at.gte = new Date(updated_from);
      if (updated_to) where.updated_at.lte = new Date(updated_to);
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const allowedSortFields = ['id', 'name', 'description', 'is_active', 'created_at', 'updated_at'];
    const sortField = allowedSortFields.includes(sort_by) ? sort_by : 'created_at';
    const sortDirection = ['ASC', 'DESC'].includes(sort_order.toUpperCase())
      ? sort_order.toLowerCase()
      : 'desc';

    const [skills, count] = await Promise.all([
      prisma.skill.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { [sortField]: sortDirection },
      }),
      prisma.skill.count({ where }),
    ]);

    const totalPages = Math.ceil(count / parseInt(limit));
    const currentPage = parseInt(page);

    res.status(200).json({
      success: true,
      data: {
        skills,
        pagination: {
          total: count,
          page: currentPage,
          limit: parseInt(limit),
          totalPages,
          hasNextPage: currentPage < totalPages,
          hasPrevPage: currentPage > 1,
          nextPage: currentPage < totalPages ? currentPage + 1 : null,
          prevPage: currentPage > 1 ? currentPage - 1 : null,
        },
        filters: {
          name,
          description,
          is_active,
          created_from,
          created_to,
          updated_from,
          updated_to,
          search,
          sort_by: sortField,
          sort_order: sortDirection.toUpperCase(),
        },
      },
    });
  } catch (error) {
    console.error('Get all skills error:', error);
    res.status(500).json({ success: false, message: 'Error fetching skills', error: error.message });
  }
};

// Get skill by ID
const getSkillById = async (req, res) => {
  try {
    const { id } = req.params;
    const skill = await prisma.skill.findUnique({ where: { id: parseInt(id) } });

    if (!skill) return res.status(404).json({ success: false, message: 'Skill not found' });

    res.status(200).json({ success: true, data: skill });
  } catch (error) {
    console.error('Get skill by ID error:', error);
    res.status(500).json({ success: false, message: 'Error fetching skill', error: error.message });
  }
};

// Create new skill
const createSkill = async (req, res) => {
  try {
    const { name, description, is_active } = req.body;

    const existingSkill = await prisma.skill.findUnique({ where: { name } });
    if (existingSkill) {
      return res.status(400).json({ success: false, message: 'Skill with this name already exists' });
    }

    const newSkill = await prisma.skill.create({
      data: { name, description, is_active: is_active !== undefined ? is_active : true },
    });

    res.status(201).json({ success: true, message: 'Skill created successfully', data: newSkill });
  } catch (error) {
    console.error('Create skill error:', error);
    res.status(500).json({ success: false, message: 'Error creating skill', error: error.message });
  }
};

// Update skill
const updateSkill = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, is_active } = req.body;

    const skill = await prisma.skill.findUnique({ where: { id: parseInt(id) } });
    if (!skill) return res.status(404).json({ success: false, message: 'Skill not found' });

    if (name && name !== skill.name) {
      const existingSkill = await prisma.skill.findUnique({ where: { name } });
      if (existingSkill) {
        return res.status(400).json({ success: false, message: 'Skill with this name already exists' });
      }
    }

    const updatedSkill = await prisma.skill.update({
      where: { id: parseInt(id) },
      data: { name, description, is_active },
    });

    res.status(200).json({ success: true, message: 'Skill updated successfully', data: updatedSkill });
  } catch (error) {
    console.error('Update skill error:', error);
    res.status(500).json({ success: false, message: 'Error updating skill', error: error.message });
  }
};

// Soft delete (set is_active = false)
const deleteSkill = async (req, res) => {
  try {
    const { id } = req.params;

    const skill = await prisma.skill.findUnique({ where: { id: parseInt(id) } });
    if (!skill) return res.status(404).json({ success: false, message: 'Skill not found' });

    await prisma.skill.update({ where: { id: parseInt(id) }, data: { is_active: false } });

    res.status(200).json({ success: true, message: 'Skill deactivated successfully' });
  } catch (error) {
    console.error('Delete skill error:', error);
    res.status(500).json({ success: false, message: 'Error deleting skill', error: error.message });
  }
};

// Hard delete (permanent)
const permanentDeleteSkill = async (req, res) => {
  try {
    const { id } = req.params;

    const skill = await prisma.skill.findUnique({ where: { id: parseInt(id) } });
    if (!skill) return res.status(404).json({ success: false, message: 'Skill not found' });

    await prisma.skill.delete({ where: { id: parseInt(id) } });

    res.status(200).json({ success: true, message: 'Skill permanently deleted' });
  } catch (error) {
    console.error('Permanent delete skill error:', error);
    res.status(500).json({ success: false, message: 'Error permanently deleting skill', error: error.message });
  }
};

// Reactivate skill
const reactivateSkill = async (req, res) => {
  try {
    const { id } = req.params;

    const skill = await prisma.skill.findUnique({ where: { id: parseInt(id) } });
    if (!skill) return res.status(404).json({ success: false, message: 'Skill not found' });

    const reactivatedSkill = await prisma.skill.update({
      where: { id: parseInt(id) },
      data: { is_active: true },
    });

    res.status(200).json({ success: true, message: 'Skill reactivated successfully', data: reactivatedSkill });
  } catch (error) {
    console.error('Reactivate skill error:', error);
    res.status(500).json({ success: false, message: 'Error reactivating skill', error: error.message });
  }
};

module.exports = {
  getAllSkills,
  getAllSkillsSimple,
  getSkillById,
  createSkill,
  updateSkill,
  deleteSkill,
  permanentDeleteSkill,
  reactivateSkill,
};
