// const prisma = require('../prisma/client');

// // Get all tickets (simple list)
// const getAllTicketsSimple = async (req, res) => {
//   try {
//     const { status, priority, sort_by = 'created_at', sort_order = 'DESC' } = req.query;

//     const where = {};
//     if (status) where.status = status;
//     if (priority) where.priority = priority;

//     const tickets = await prisma.ticket.findMany({
//       where,
//       include: {
//         requester: { select: { id: true, name: true, email: true, department: true } },
//         assigned_technician: {
//           include: { user: { select: { id: true, name: true, email: true } } }
//         }
//       },
//       orderBy: { [sort_by]: sort_order.toLowerCase() === 'asc' ? 'asc' : 'desc' }
//     });

//     res.status(200).json({
//       success: true,
//       data: tickets
//     });
//   } catch (error) {
//     console.error('getAllTicketsSimple error:', error);
//     res.status(500).json({ success: false, message: 'Error fetching tickets', error: error.message });
//   }
// };

// // Get all tickets with pagination + filters
// const getAllTickets = async (req, res) => {
//   try {
//     const {
//       page = 1,
//       limit = 10,
//       subject,
//       description,
//       status,
//       priority,
//       requester_id,
//       assigned_technician_id,
//       created_from,
//       created_to,
//       updated_from,
//       updated_to,
//       sort_by = 'created_at',
//       sort_order = 'DESC',
//       search
//     } = req.query;

//     const where = {};
//     if (subject) where.subject = { contains: subject, mode: 'insensitive' };
//     if (description) where.description = { contains: description, mode: 'insensitive' };
//     if (status) where.status = status;
//     if (priority) where.priority = priority;
//     if (requester_id) where.requester_id = parseInt(requester_id);
//     if (assigned_technician_id) where.assigned_technician_id = parseInt(assigned_technician_id);

//     if (created_from || created_to) {
//       where.created_at = {};
//       if (created_from) where.created_at.gte = new Date(created_from);
//       if (created_to) where.created_at.lte = new Date(created_to);
//     }

//     if (updated_from || updated_to) {
//       where.updated_at = {};
//       if (updated_from) where.updated_at.gte = new Date(updated_from);
//       if (updated_to) where.updated_at.lte = new Date(updated_to);
//     }

//     if (search) {
//       where.OR = [
//         { subject: { contains: search, mode: 'insensitive' } },
//         { description: { contains: search, mode: 'insensitive' } }
//       ];
//     }

//     const total = await prisma.ticket.count({ where });
//     const tickets = await prisma.ticket.findMany({
//       where,
//       skip: (page - 1) * parseInt(limit),
//       take: parseInt(limit),
//       include: {
//         requester: { select: { id: true, name: true, email: true, department: true } },
//         assigned_technician: {
//           include: { user: { select: { id: true, name: true, email: true } } }
//         }
//       },
//       orderBy: { [sort_by]: sort_order.toLowerCase() === 'asc' ? 'asc' : 'desc' }
//     });

//     res.status(200).json({
//       success: true,
//       data: {
//         tickets,
//         pagination: {
//           total,
//           page: parseInt(page),
//           limit: parseInt(limit),
//           totalPages: Math.ceil(total / limit)
//         }
//       }
//     });
//   } catch (error) {
//     console.error('getAllTickets error:', error);
//     res.status(500).json({ success: false, message: 'Error fetching tickets', error: error.message });
//   }
// };

// // Get ticket by ID
// const getTicketById = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const ticket = await prisma.ticket.findUnique({
//       where: { id: parseInt(id) },
//       include: {
//         requester: { select: { id: true, name: true, email: true } },
//         assigned_technician: {
//           include: { user: { select: { id: true, name: true, email: true } } }
//         }
//       }
//     });

//     if (!ticket) return res.status(404).json({ success: false, message: 'Ticket not found' });

//     res.status(200).json({ success: true, data: ticket });
//   } catch (error) {
//     console.error('getTicketById error:', error);
//     res.status(500).json({ success: false, message: 'Error fetching ticket', error: error.message });
//   }
// };

// // Create ticket
// const createTicket = async (req, res) => {
//   try {
//     const { subject, description, requester_id, priority, assigned_technician_id, required_skills, tags } = req.body;

//     const ticket = await prisma.ticket.create({
//       data: {
//         subject,
//         description,
//         requester_id,
//         priority: priority || 'medium',
//         status: 'open',
//         assigned_technician_id: assigned_technician_id || null,
//         required_skills: required_skills || [],
//         tags: tags || [],
//         audit_trail: [{ action: 'created', timestamp: new Date() }]
//       }
//     });

//     res.status(201).json({ success: true, message: 'Ticket created successfully', data: ticket });
//   } catch (error) {
//     console.error('createTicket error:', error);
//     res.status(500).json({ success: false, message: 'Error creating ticket', error: error.message });
//   }
// };

// // Update ticket
// const updateTicket = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const data = req.body;

//     const ticket = await prisma.ticket.update({
//       where: { id: parseInt(id) },
//       data: {
//         ...data,
//         audit_trail: {
//           push: { action: 'updated', timestamp: new Date(), changes: data }
//         }
//       }
//     });

//     res.status(200).json({ success: true, message: 'Ticket updated successfully', data: ticket });
//   } catch (error) {
//     console.error('updateTicket error:', error);
//     res.status(500).json({ success: false, message: 'Error updating ticket', error: error.message });
//   }
// };

// // Delete ticket (hard delete)
// const deleteTicket = async (req, res) => {
//   try {
//     const { id } = req.params;
//     await prisma.ticket.delete({ where: { id: parseInt(id) } });
//     res.status(200).json({ success: true, message: 'Ticket deleted successfully' });
//   } catch (error) {
//     console.error('deleteTicket error:', error);
//     res.status(500).json({ success: false, message: 'Error deleting ticket', error: error.message });
//   }
// };

// module.exports = {
//   getAllTicketsSimple,
//   getAllTickets,
//   getTicketById,
//   createTicket,
//   updateTicket,
//   deleteTicket
// };

const prisma = require('../prisma/client');

const getAllTechniciansSimple = async (req, res) => {
  try {
    const {
      is_active,
      availability_status,
      skill_level,
      skills,
      sort_by = 'name',
      sort_order = 'asc'
    } = req.query;

    // Build Prisma where clause
    const whereClause = {};

    // Active status filter (default true)
    whereClause.isActive = is_active !== undefined ? is_active === 'true' : true;

    // Availability status filter
    if (availability_status) {
      const statuses = Array.isArray(availability_status) ? availability_status : [availability_status];
      whereClause.availabilityStatus = { in: statuses };
    }

    // Skill level filter
    if (skill_level) {
      const levels = Array.isArray(skill_level) ? skill_level : [skill_level];
      whereClause.skillLevel = { in: levels };
    }

    // Skills filter (check if technician has any of the provided skill IDs)
    if (skills) {
      const skillIds = Array.isArray(skills) ? skills.map(Number) : [Number(skills)];
      whereClause.skills = {
        some: skillIds.map((id) => ({
          path: '$',
          array_contains: [{ id }]
        }))
      };
    }

    // Validate sort fields
    const allowedSortFields = [
      'id', 'name', 'workload', 'availabilityStatus',
      'skillLevel', 'specialization', 'isActive', 'createdAt', 'updatedAt'
    ];
    const sortField = allowedSortFields.includes(sort_by) ? sort_by : 'name';
    const sortDirection = ['asc', 'desc'].includes(sort_order.toLowerCase()) ? sort_order.toLowerCase() : 'asc';

    const technicians = await prisma.technician.findMany({
      where: whereClause,
      include: {
        user: {
          select: { id: true, name: true, email: true, role: true, department: true }
        }
      },
      orderBy: { [sortField]: sortDirection }
    });

    res.status(200).json({
      success: true,
      data: {
        technicians,
        total: technicians.length,
        filters: {
          is_active: is_active !== undefined ? is_active : 'true',
          availability_status,
          skill_level,
          skills,
          sort_by: sortField,
          sort_order: sortDirection
        }
      }
    });
  } catch (error) {
    console.error('Get all technicians simple error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching technicians',
      error: error.message
    });
  }
};

const getAllTechnicians = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      name,
      user_id,
      availability_status,
      skill_level,
      specialization,
      workload_min,
      workload_max,
      is_active,
      skills,
      created_from,
      created_to,
      updated_from,
      updated_to,
      sort_by = 'createdAt',
      sort_order = 'desc',
      search
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    // Build Prisma where clause
    const whereClause = {};

    if (name) whereClause.name = { contains: name, mode: 'insensitive' };
    if (user_id) whereClause.userId = parseInt(user_id);
    if (availability_status) {
      const statuses = Array.isArray(availability_status) ? availability_status : [availability_status];
      whereClause.availabilityStatus = { in: statuses };
    }
    if (skill_level) {
      const levels = Array.isArray(skill_level) ? skill_level : [skill_level];
      whereClause.skillLevel = { in: levels };
    }
    if (specialization) whereClause.specialization = { contains: specialization, mode: 'insensitive' };
    if (workload_min || workload_max) {
      whereClause.workload = {};
      if (workload_min) whereClause.workload.gte = parseInt(workload_min);
      if (workload_max) whereClause.workload.lte = parseInt(workload_max);
    }
    if (is_active !== undefined) whereClause.isActive = is_active === 'true';

    if (skills) {
      const skillIds = Array.isArray(skills) ? skills.map(Number) : [Number(skills)];
      // Check if any skill id exists in JSON column
      whereClause.OR = skillIds.map(id => ({
        skills: {
          array_contains: [{ id }]
        }
      }));
    }

    if (created_from || created_to) {
      whereClause.createdAt = {};
      if (created_from) whereClause.createdAt.gte = new Date(created_from);
      if (created_to) whereClause.createdAt.lte = new Date(created_to);
    }

    if (updated_from || updated_to) {
      whereClause.updatedAt = {};
      if (updated_from) whereClause.updatedAt.gte = new Date(updated_from);
      if (updated_to) whereClause.updatedAt.lte = new Date(updated_to);
    }

    if (search) {
      whereClause.OR = [
        ...(whereClause.OR || []),
        { name: { contains: search, mode: 'insensitive' } },
        { specialization: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Validate sort fields
    const allowedSortFields = ['id', 'name', 'workload', 'availabilityStatus', 'skillLevel', 'specialization', 'isActive', 'createdAt', 'updatedAt'];
    const sortField = allowedSortFields.includes(sort_by) ? sort_by : 'createdAt';
    const sortDirection = ['asc', 'desc'].includes(sort_order.toLowerCase()) ? sort_order.toLowerCase() : 'desc';

    const [technicians, total] = await Promise.all([
      prisma.technician.findMany({
        where: whereClause,
        include: {
          user: { select: { id: true, name: true, email: true, role: true, department: true } }
        },
        skip,
        take,
        orderBy: { [sortField]: sortDirection }
      }),
      prisma.technician.count({ where: whereClause })
    ]);

    const totalPages = Math.ceil(total / take);
    const currentPage = parseInt(page);
    const hasNextPage = currentPage < totalPages;
    const hasPrevPage = currentPage > 1;

    res.status(200).json({
      success: true,
      data: {
        technicians,
        pagination: {
          total,
          page: currentPage,
          limit: take,
          totalPages,
          hasNextPage,
          hasPrevPage,
          nextPage: hasNextPage ? currentPage + 1 : null,
          prevPage: hasPrevPage ? currentPage - 1 : null
        },
        filters: {
          name,
          user_id,
          availability_status,
          skill_level,
          specialization,
          workload_min,
          workload_max,
          is_active,
          skills,
          created_from,
          created_to,
          updated_from,
          updated_to,
          search,
          sort_by: sortField,
          sort_order: sortDirection
        }
      }
    });

  } catch (error) {
    console.error('Get all technicians error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching technicians',
      error: error.message
    });
  }
};

const getTechnicianById = async (req, res) => {
  try {
    const { id } = req.params;

    const technician = await prisma.technician.findUnique({
      where: { id: parseInt(id) },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            department: true
          }
        },
        tickets: {
          orderBy: { createdAt: 'desc' },
          take: 5,
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

    if (!technician) {
      return res.status(404).json({
        success: false,
        message: 'Technician not found'
      });
    }

    res.status(200).json({
      success: true,
      data: technician
    });
  } catch (error) {
    console.error('Get technician by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching technician',
      error: error.message
    });
  }
};

const createTechnician = async (req, res) => {
  try {
    const { 
      name, 
      user_id, 
      skills, 
      availability_status, 
      skill_level, 
      specialization,
      workload,
      is_active 
    } = req.body;

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: parseInt(user_id) }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if technician already exists for this user
    const existingTechnician = await prisma.technician.findUnique({
      where: { userId: parseInt(user_id) }
    });

    if (existingTechnician) {
      return res.status(400).json({
        success: false,
        message: 'Technician profile already exists for this user'
      });
    }

    // Validate skills format if provided
    if (skills && Array.isArray(skills)) {
      for (const skill of skills) {
        if (!skill.id || typeof skill.percentage !== 'number' || skill.percentage < 0 || skill.percentage > 100) {
          return res.status(400).json({
            success: false,
            message: 'Skills must be in format [{id: number, percentage: number}] with percentage 0-100'
          });
        }
      }
    }

    // Create technician
    const newTechnician = await prisma.technician.create({
      data: {
        name,
        userId: parseInt(user_id),
        skills: skills || [],
        assignedTickets: [],
        assignedTicketsTotal: 0,
        availabilityStatus: availability_status || 'available',
        skillLevel: skill_level || 'junior',
        specialization,
        workload: workload || 0,
        isActive: is_active !== undefined ? is_active : true
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            department: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'Technician created successfully',
      data: newTechnician
    });

  } catch (error) {
    console.error('Create technician error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating technician',
      error: error.message
    });
  }
};

const updateTechnician = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      name, 
      skills, 
      assigned_tickets,
      availability_status, 
      skill_level, 
      specialization,
      workload,
      is_active 
    } = req.body;

    // Find technician
    const existingTechnician = await prisma.technician.findUnique({
      where: { id: parseInt(id) }
    });

    if (!existingTechnician) {
      return res.status(404).json({
        success: false,
        message: 'Technician not found'
      });
    }

    // Validate skills format if provided
    if (skills && Array.isArray(skills)) {
      for (const skill of skills) {
        if (!skill.id || typeof skill.percentage !== 'number' || skill.percentage < 0 || skill.percentage > 100) {
          return res.status(400).json({
            success: false,
            message: 'Skills must be in format [{id: number, percentage: number}] with percentage 0-100'
          });
        }
      }
    }

    // Prepare update data
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (skills !== undefined) updateData.skills = skills;
    if (assigned_tickets !== undefined) {
      updateData.assignedTickets = assigned_tickets;
      updateData.assignedTicketsTotal = Array.isArray(assigned_tickets) ? assigned_tickets.length : 0;
    }
    if (availability_status !== undefined) updateData.availabilityStatus = availability_status;
    if (skill_level !== undefined) updateData.skillLevel = skill_level;
    if (specialization !== undefined) updateData.specialization = specialization;
    if (workload !== undefined) updateData.workload = workload;
    if (is_active !== undefined) updateData.isActive = is_active;

    // Update technician
    const updatedTechnician = await prisma.technician.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            department: true
          }
        }
      }
    });

    res.status(200).json({
      success: true,
      message: 'Technician updated successfully',
      data: updatedTechnician
    });

  } catch (error) {
    console.error('Update technician error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating technician',
      error: error.message
    });
  }
};

const deleteTechnician = async (req, res) => {
  try {
    const { id } = req.params;

    // Find technician
    const technician = await prisma.technician.findUnique({
      where: { id: parseInt(id) }
    });

    if (!technician) {
      return res.status(404).json({
        success: false,
        message: 'Technician not found'
      });
    }

    // Soft delete by setting isActive to false
    await prisma.technician.update({
      where: { id: parseInt(id) },
      data: { isActive: false }
    });

    res.status(200).json({
      success: true,
      message: 'Technician deactivated successfully'
    });

  } catch (error) {
    console.error('Delete technician error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting technician',
      error: error.message
    });
  }
};

const permanentDeleteTechnician = async (req, res) => {
  try {
    const { id } = req.params;

    // Find technician
    const technician = await prisma.technician.findUnique({
      where: { id: parseInt(id) }
    });

    if (!technician) {
      return res.status(404).json({
        success: false,
        message: 'Technician not found'
      });
    }

    // Permanently delete technician
    await prisma.technician.delete({
      where: { id: parseInt(id) }
    });

    res.status(200).json({
      success: true,
      message: 'Technician permanently deleted'
    });

  } catch (error) {
    console.error('Permanent delete technician error:', error);
    res.status(500).json({
      success: false,
      message: 'Error permanently deleting technician',
      error: error.message
    });
  }
};

const reactivateTechnician = async (req, res) => {
  try {
    const { id } = req.params;

    // Find technician
    const technician = await prisma.technician.findUnique({
      where: { id: parseInt(id) }
    });

    if (!technician) {
      return res.status(404).json({
        success: false,
        message: 'Technician not found'
      });
    }

    // Reactivate technician
    await prisma.technician.update({
      where: { id: parseInt(id) },
      data: { isActive: true }
    });

    // Fetch updated technician with user info
    const reactivatedTechnician = await prisma.technician.findUnique({
      where: { id: parseInt(id) },
      include: {
        user: {
          select: { id: true, name: true, email: true, role: true, department: true }
        }
      }
    });

    res.status(200).json({
      success: true,
      message: 'Technician reactivated successfully',
      data: reactivatedTechnician
    });

  } catch (error) {
    console.error('Reactivate technician error:', error);
    res.status(500).json({
      success: false,
      message: 'Error reactivating technician',
      error: error.message
    });
  }
};

const getTechniciansBySkills = async (req, res) => {
  try {
    const { skills, page = 1, limit = 10, debug = false } = req.query;

    if (!skills || (Array.isArray(skills) && skills.length === 0)) {
      return res.status(400).json({
        success: false,
        message: 'Skills parameter is required'
      });
    }

    const skillIds = Array.isArray(skills) ? skills.map(id => parseInt(id)) : [parseInt(skills)];
    const offset = (parseInt(page) - 1) * parseInt(limit);

    // Build Prisma OR conditions for skills
    const skillsFilter = skillIds.map(skillId => ({
      skills: {
        some: {
          path: '$.id',
          equals: skillId
        }
      }
    }));

    // Debug mode - fetch few technicians to check skills structure
    if (debug === 'true') {
      const allTechnicians = await prisma.technician.findMany({
        where: { isActive: true },
        select: { id: true, name: true, skills: true },
        take: 5
      });
      console.log('Debug - Sample technician skills structure:');
      allTechnicians.forEach(tech => {
        console.log(`Technician ${tech.id} (${tech.name}):`, JSON.stringify(tech.skills));
      });
      console.log('Searching for skill IDs:', skillIds);
    }

    // Fetch technicians with pagination
    const [totalCount, technicians] = await Promise.all([
      prisma.technician.count({
        where: {
          isActive: true,
          OR: skillsFilter
        }
      }),
      prisma.technician.findMany({
        where: {
          isActive: true,
          OR: skillsFilter
        },
        include: {
          user: {
            select: { id: true, name: true, email: true, role: true, department: true }
          }
        },
        orderBy: [
          { workload: 'asc' },
          { name: 'asc' }
        ],
        skip: offset,
        take: parseInt(limit)
      })
    ]);

    const totalPages = Math.ceil(totalCount / parseInt(limit));
    const currentPage = parseInt(page);

    res.status(200).json({
      success: true,
      data: {
        technicians,
        pagination: {
          total: totalCount,
          page: currentPage,
          limit: parseInt(limit),
          totalPages,
          hasNextPage: currentPage < totalPages,
          hasPrevPage: currentPage > 1,
          nextPage: currentPage < totalPages ? currentPage + 1 : null,
          prevPage: currentPage > 1 ? currentPage - 1 : null
        },
        filters: {
          skills: skillIds
        }
      }
    });
  } catch (error) {
    console.error('Get technicians by skills error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching technicians by skills',
      error: error.message
    });
  }
};

const debugTechniciansSkills = async (req, res) => {
  try {
    const technicians = await prisma.technician.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        skills: true,
        availabilityStatus: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      take: 20
    });

    res.status(200).json({
      success: true,
      message: 'Debug information for technicians and their skills',
      data: {
        technicians: technicians.map(tech => ({
          id: tech.id,
          name: tech.name,
          skills: tech.skills,
          availability_status: tech.availabilityStatus,
          user: tech.user
        })),
        total: technicians.length,
        skillsStructureExample: "Skills should be in format: [{id: 50, percentage: 85}, {id: 60, percentage: 70}]"
      }
    });
  } catch (error) {
    console.error('Debug technicians skills error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching debug information',
      error: error.message
    });
  }
};

const getAverageTechnicianPerformance = async (req, res) => {
  try {
    // Get all active technicians
    const technicians = await prisma.technician.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true
      }
    });

    // Get average score for each technician
    const technicianScores = await Promise.all(
      technicians.map(async (technician) => {
        const result = await prisma.ticket.aggregate({
          where: {
            assignedTechnicianId: technician.id,
            score: {
              not: null
            }
          },
          _avg: {
            score: true
          }
        });

        const avgScore = result._avg.score || 0;

        return {
          id: technician.id,
          name: technician.name,
          average_score: avgScore
        };
      })
    );

    // Calculate overall average of all technician scores
    const totalTechnicians = technicianScores.length;
    const totalScore = technicianScores.reduce((sum, tech) => sum + tech.average_score, 0);
    const overallAverageScore = totalTechnicians > 0 ? totalScore / totalTechnicians : 0;

    res.status(200).json({
      success: true,
      message: 'Average technician performance calculated successfully',
      data: {
        overall_average_score: overallAverageScore.toFixed(2),
        total_technicians: totalTechnicians,
        technician_scores: technicianScores.map(tech => ({
          id: tech.id,
          name: tech.name,
          average_score: tech.average_score.toFixed(2)
        }))
      }
    });

  } catch (error) {
    console.error('Get average technician performance error:', error);
    res.status(500).json({
      success: false,
      message: 'Error calculating average technician performance',
      error: error.message
    });
  }
};

const getPerformanceRating = (score) => {
  if (score >= 9.0) return 'Excellent';
  if (score >= 8.0) return 'Good';
  if (score >= 7.0) return 'Average';
  if (score >= 6.0) return 'Below Average';
  return 'Poor';
};

module.exports = {
  getAllTechnicians,
  getAllTechniciansSimple,
  getTechnicianById,
  createTechnician,
  updateTechnician,
  deleteTechnician,
  permanentDeleteTechnician,
  reactivateTechnician,
  getTechniciansBySkills,
  debugTechniciansSkills,
  getAverageTechnicianPerformance
};