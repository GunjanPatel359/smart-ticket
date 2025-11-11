const prisma = require('../prisma/client');
const axios = require('axios');

const getAllTicketsSimple = async (req, res) => {
    try {
        const {
            status,
            priority,
            urgency,
            impact,
            sla_violated,
            assigned_technician_id,
            requester_id,
            required_skills,
            sort_by = 'created_at',
            sort_order = 'DESC'
        } = req.query;

        // Build where clause
        const whereClause = {};

        // Status filter
        if (status) {
            whereClause.status = Array.isArray(status) ? { in: status } : status;
        }

        // Priority filter
        if (priority) {
            whereClause.priority = Array.isArray(priority) ? { in: priority } : priority;
        }

        // Urgency filter
        if (urgency) {
            whereClause.urgency = Array.isArray(urgency) ? { in: urgency } : urgency;
        }

        // Impact filter
        if (impact) {
            whereClause.impact = Array.isArray(impact) ? { in: impact } : impact;
        }

        // SLA violated filter
        if (sla_violated !== undefined) {
            whereClause.slaViolated = sla_violated === 'true';
        }

        // Assigned technician filter
        if (assigned_technician_id) {
            whereClause.assignedTechnicianId = parseInt(assigned_technician_id);
        }

        // Requester filter
        if (requester_id) {
            whereClause.requesterId = parseInt(requester_id);
        }

        // Required skills filter (assuming it's stored as JSON array of IDs)
        if (required_skills) {
            const skillIds = Array.isArray(required_skills)
                ? required_skills.map(id => id.toString())
                : [required_skills.toString()];

            whereClause.requiredSkills = {
                array_contains: skillIds // Prisma JSON filter
            };
        }

        // Validate sort fields
        const allowedSortFields = [
            'id',
            'subject',
            'status',
            'priority',
            'urgency',
            'impact',
            'slaViolated',
            'escalationCount',
            'satisfactionRating',
            'score',
            'justification',
            'createdAt',
            'updatedAt',
            'resolutionDue'
        ];
        const sortField = allowedSortFields.includes(sort_by) ? sort_by : 'createdAt';
        const sortDirection = ['ASC', 'DESC'].includes(sort_order.toUpperCase())
            ? sort_order.toLowerCase()
            : 'desc';

        const tickets = await prisma.ticket.findMany({
            where: whereClause,
            orderBy: {
                [sortField]: sortDirection
            },
            select: {
                id: true,
                subject: true,
                status: true,
                priority: true,
                urgency: true,
                impact: true,
                slaViolated: true,
                escalationCount: true,
                satisfactionRating: true,
                score: true,
                justification: true,
                createdAt: true,
                updatedAt: true,
                resolutionDue: true,
                requester: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        department: true
                    }
                },
                assignedTechnician: {
                    select: {
                        id: true,
                        name: true,
                        skillLevel: true,
                        availabilityStatus: true,
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true
                            }
                        }
                    }
                }
            }
        });

        res.status(200).json({
            success: true,
            data: {
                tickets,
                total: tickets.length,
                filters: {
                    status,
                    priority,
                    urgency,
                    impact,
                    sla_violated,
                    assigned_technician_id,
                    requester_id,
                    required_skills,
                    sort_by: sortField,
                    sort_order: sortDirection
                }
            }
        });
    } catch (error) {
        console.error('Get all tickets simple error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching tickets',
            error: error.message
        });
    }
};


const getAllTickets = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            subject,
            description,
            status,
            priority,
            urgency,
            impact,
            sla_violated,
            assigned_technician_id,
            requester_id,
            required_skills,
            escalation_count_min,
            escalation_count_max,
            satisfaction_rating_min,
            satisfaction_rating_max,
            score_min,
            score_max,
            created_from,
            created_to,
            updated_from,
            updated_to,
            resolution_due_from,
            resolution_due_to,
            sort_by = 'created_at',
            sort_order = 'DESC',
            search
        } = req.query;

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const take = parseInt(limit);

        // Build where clause
        const whereClause = {};

        // Partial matches
        if (subject) {
            whereClause.subject = { contains: subject };
        }
        if (description) {
            whereClause.description = { contains: description };
        }

        // Enums
        if (status) {
            whereClause.status = Array.isArray(status) ? { in: status } : status;
        }
        if (priority) {
            whereClause.priority = Array.isArray(priority) ? { in: priority } : priority;
        }
        if (urgency) {
            whereClause.urgency = Array.isArray(urgency) ? { in: urgency } : urgency;
        }
        if (impact) {
            whereClause.impact = Array.isArray(impact) ? { in: impact } : impact;
        }

        // SLA violated
        if (sla_violated !== undefined) {
            whereClause.slaViolated = sla_violated === 'true';
        }

        // Relations
        if (assigned_technician_id) {
            whereClause.assignedTechnicianId = parseInt(assigned_technician_id);
        }
        if (requester_id) {
            whereClause.requesterId = parseInt(requester_id);
        }

        // Required skills (JSON array contains)
        if (required_skills) {
            const skillIds = Array.isArray(required_skills)
                ? required_skills.map(String)
                : [required_skills.toString()];

            whereClause.requiredSkills = { array_contains: skillIds };
        }

        // Numeric ranges
        if (escalation_count_min || escalation_count_max) {
            whereClause.escalationCount = {};
            if (escalation_count_min) whereClause.escalationCount.gte = parseInt(escalation_count_min);
            if (escalation_count_max) whereClause.escalationCount.lte = parseInt(escalation_count_max);
        }
        if (satisfaction_rating_min || satisfaction_rating_max) {
            whereClause.satisfactionRating = {};
            if (satisfaction_rating_min) whereClause.satisfactionRating.gte = parseInt(satisfaction_rating_min);
            if (satisfaction_rating_max) whereClause.satisfactionRating.lte = parseInt(satisfaction_rating_max);
        }
        if (score_min || score_max) {
            whereClause.score = {};
            if (score_min) whereClause.score.gte = parseFloat(score_min);
            if (score_max) whereClause.score.lte = parseFloat(score_max);
        }

        // Date ranges
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
        if (resolution_due_from || resolution_due_to) {
            whereClause.resolutionDue = {};
            if (resolution_due_from) whereClause.resolutionDue.gte = new Date(resolution_due_from);
            if (resolution_due_to) whereClause.resolutionDue.lte = new Date(resolution_due_to);
        }

        // Global search
        if (search) {
            whereClause.OR = [
                { subject: { contains: search } },
                { description: { contains: search } }
            ];
        }

        // Sort validation
        const allowedSortFields = [
            'id',
            'subject',
            'status',
            'priority',
            'urgency',
            'impact',
            'slaViolated',
            'escalationCount',
            'satisfactionRating',
            'score',
            'justification',
            'createdAt',
            'updatedAt',
            'resolutionDue'
        ];
        const sortField = allowedSortFields.includes(sort_by) ? sort_by : 'createdAt';
        const sortDirection = ['ASC', 'DESC'].includes(sort_order.toUpperCase())
            ? sort_order.toLowerCase()
            : 'desc';

        // Query with Prisma
        const [tickets, count] = await Promise.all([
            prisma.ticket.findMany({
                where: whereClause,
                skip,
                take,
                orderBy: { [sortField]: sortDirection },
                select: {
                    id: true,
                    subject: true,
                    description: true,
                    status: true,
                    priority: true,
                    urgency: true,
                    impact: true,
                    slaViolated: true,
                    escalationCount: true,
                    satisfactionRating: true,
                    score: true,
                    justification: true,
                    createdAt: true,
                    updatedAt: true,
                    resolutionDue: true,
                    requester: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            department: true
                        }
                    },
                    assignedTechnician: {
                        select: {
                            id: true,
                            name: true,
                            skillLevel: true,
                            availabilityStatus: true,
                            user: {
                                select: {
                                    id: true,
                                    name: true,
                                    email: true
                                }
                            }
                        }
                    }
                }
            }),
            prisma.ticket.count({ where: whereClause })
        ]);

        // Pagination metadata
        const totalPages = Math.ceil(count / take);
        const currentPage = parseInt(page);

        res.status(200).json({
            success: true,
            data: {
                tickets,
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
                    subject,
                    description,
                    status,
                    priority,
                    urgency,
                    impact,
                    sla_violated,
                    assigned_technician_id,
                    requester_id,
                    required_skills,
                    escalation_count_min,
                    escalation_count_max,
                    satisfaction_rating_min,
                    satisfaction_rating_max,
                    score_min,
                    score_max,
                    created_from,
                    created_to,
                    updated_from,
                    updated_to,
                    resolution_due_from,
                    resolution_due_to,
                    search,
                    sort_by: sortField,
                    sort_order: sortDirection
                }
            }
        });
    } catch (error) {
        console.error('Get all tickets error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching tickets',
            error: error.message
        });
    }
};

const getTicketById = async (req, res) => {
    try {
        const { id } = req.params;

        const ticket = await prisma.ticket.findUnique({
            where: { id: parseInt(id) },
            select: {
                id: true,
                subject: true,
                description: true,
                status: true,
                priority: true,
                urgency: true,
                impact: true,
                slaViolated: true,
                escalationCount: true,
                satisfactionRating: true,
                score: true,
                justification: true,
                createdAt: true,
                updatedAt: true,
                resolutionDue: true,
                requester: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        department: true,
                        contactNo: true
                    }
                },
                assignedTechnician: {
                    select: {
                        id: true,
                        name: true,
                        skillLevel: true,
                        availabilityStatus: true,
                        specialization: true,
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                contactNo: true
                            }
                        }
                    }
                }
            }
        });

        if (!ticket) {
            return res.status(404).json({
                success: false,
                message: 'Ticket not found'
            });
        }

        res.status(200).json({
            success: true,
            data: ticket
        });
    } catch (error) {
        console.error('Get ticket by ID error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching ticket',
            error: error.message
        });
    }
};

const getTicketsByUserId = async (req, res) => {
    try {
        const { userId } = req.params;
        const { page = 1, limit = 10, status, priority } = req.query;

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const take = parseInt(limit);

        // Build filters
        const filters = { requesterId: parseInt(userId) };

        if (status) {
            filters.status = Array.isArray(status) ? { in: status } : status;
        }

        if (priority) {
            filters.priority = Array.isArray(priority) ? { in: priority } : priority;
        }

        // Fetch tickets
        const [count, tickets] = await Promise.all([
            prisma.ticket.count({ where: filters }),
            prisma.ticket.findMany({
                where: filters,
                skip,
                take,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    subject: true,
                    description: true,
                    status: true,
                    priority: true,
                    urgency: true,
                    impact: true,
                    slaViolated: true,
                    escalationCount: true,
                    satisfactionRating: true,
                    score: true,
                    justification: true,
                    createdAt: true,
                    updatedAt: true,
                    assignedTechnician: {
                        select: {
                            id: true,
                            name: true,
                            skillLevel: true,
                            user: {
                                select: {
                                    id: true,
                                    name: true,
                                    email: true
                                }
                            }
                        }
                    }
                }
            })
        ]);

        // Pagination metadata
        const totalPages = Math.ceil(count / take);
        const currentPage = parseInt(page);
        const hasNextPage = currentPage < totalPages;
        const hasPrevPage = currentPage > 1;

        res.status(200).json({
            success: true,
            data: {
                tickets,
                pagination: {
                    total: count,
                    page: currentPage,
                    limit: take,
                    totalPages,
                    hasNextPage,
                    hasPrevPage,
                    nextPage: hasNextPage ? currentPage + 1 : null,
                    prevPage: hasPrevPage ? currentPage - 1 : null
                },
                filters: {
                    requester_id: userId,
                    status,
                    priority
                }
            }
        });
    } catch (error) {
        console.error('Get tickets by user ID error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching tickets for user',
            error: error.message
        });
    }
};

const getTicketsByTechnicianId = async (req, res) => {
    try {
        const { technicianId } = req.params;
        const { page = 1, limit = 10, status, priority } = req.query;

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const take = parseInt(limit);

        // Build filters
        const filters = { assignedTechnicianId: parseInt(technicianId) };

        if (status) {
            filters.status = Array.isArray(status) ? { in: status } : status;
        }

        if (priority) {
            filters.priority = Array.isArray(priority) ? { in: priority } : priority;
        }

        // Fetch tickets
        const [count, tickets] = await Promise.all([
            prisma.ticket.count({ where: filters }),
            prisma.ticket.findMany({
                where: filters,
                skip,
                take,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    subject: true,
                    description: true,
                    status: true,
                    priority: true,
                    urgency: true,
                    impact: true,
                    slaViolated: true,
                    escalationCount: true,
                    satisfactionRating: true,
                    score: true,
                    justification: true,
                    createdAt: true,
                    updatedAt: true,
                    requester: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            department: true
                        }
                    }
                }
            })
        ]);

        // Pagination metadata
        const totalPages = Math.ceil(count / take);
        const currentPage = parseInt(page);
        const hasNextPage = currentPage < totalPages;
        const hasPrevPage = currentPage > 1;

        res.status(200).json({
            success: true,
            data: {
                tickets,
                pagination: {
                    total: count,
                    page: currentPage,
                    limit: take,
                    totalPages,
                    hasNextPage,
                    hasPrevPage,
                    nextPage: hasNextPage ? currentPage + 1 : null,
                    prevPage: hasPrevPage ? currentPage - 1 : null
                },
                filters: {
                    assigned_technician_id: technicianId,
                    status,
                    priority
                }
            }
        });
    } catch (error) {
        console.error('Get tickets by technician ID error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching tickets for technician',
            error: error.message
        });
    }
};

const createTicket = async (req, res) => {
    try {
        const {
            subject,
            description,
            priority,
            impact,
            urgency,
            requester_id,
            assigned_technician_id,
            required_skills,
            tags,
            resolution_due,
            score,
            justification
        } = req.body;

        // ✅ Check if requester exists
        const requester = await prisma.user.findUnique({
            where: { id: parseInt(requester_id) }
        });

        if (!requester) {
            return res.status(400).json({
                success: false,
                message: 'Requester user not found'
            });
        }

        // ✅ Create ticket
        const newTicket = await prisma.ticket.create({
            data: {
                subject,
                description,
                status: assigned_technician_id ? 'assigned' : 'new',
                priority: priority || 'normal',
                impact: impact || 'medium',
                urgency: urgency || 'normal',
                requesterId: parseInt(requester_id),
                assignedTechnicianId: assigned_technician_id ? parseInt(assigned_technician_id) : null,
                requiredSkills: required_skills || [],
                tags: tags || [],
                resolutionDue: resolution_due ? new Date(resolution_due) : null,
                score: score !== undefined ? parseFloat(score) : null,
                justification: justification || null,
                tasks: [],
                workLogs: [],
                auditTrail: [
                    {
                        action: 'created',
                        timestamp: new Date(),
                        user_id: parseInt(requester_id),
                        details: 'Ticket created'
                    }
                ]
            }
        });

        // ✅ AI Backend Call (if configured)
        if (process.env.AI_BACKEND_URL) {
            try {
                const aiTicketData = {
                    ticket: {
                        id: newTicket.id,
                        subject,
                        description,
                        requester_id,
                        priority: priority || 'normal',
                        impact: impact || 'medium',
                        urgency: urgency || 'normal',
                        complexity_level: 'level_1',
                        tags: tags || []
                    }
                };

                const aiResponse = await axios.post(
                    `${process.env.AI_BACKEND_URL}/api/ticket-assignment`,
                    aiTicketData,
                    { headers: { 'Content-Type': 'application/json' }, timeout: 120000 }
                );

                const aiTechnicianId = aiResponse.data.selected_technician_id || aiResponse.data.assigned_technician_id;
                const aiJustification = aiResponse.data.justification;

                if (aiTechnicianId && aiResponse.data.success !== false) {
                    const aiTechnician = await prisma.technician.findUnique({
                        where: { id: parseInt(aiTechnicianId) }
                    });

                    if (aiTechnician) {
                        const auditEntry = {
                            action: 'ai_assigned',
                            timestamp: new Date(),
                            user_id: parseInt(requester_id),
                            details: `Ticket automatically assigned to technician ${aiTechnicianId} by AI`,
                            ai_justification: aiJustification || 'No justification provided by AI'
                        };

                        await prisma.ticket.update({
                            where: { id: newTicket.id },
                            data: {
                                assignedTechnicianId: parseInt(aiTechnicianId),
                                status: 'assigned',
                                justification: aiJustification || justification,
                                auditTrail: {
                                    push: auditEntry
                                }
                            }
                        });
                    } else {
                        await prisma.ticket.update({
                            where: { id: newTicket.id },
                            data: {
                                auditTrail: {
                                    push: {
                                        action: 'ai_assignment_failed',
                                        timestamp: new Date(),
                                        user_id: parseInt(requester_id),
                                        details: `AI assigned technician ${aiTechnicianId} not found in database`,
                                        ai_technician_id: aiTechnicianId
                                    }
                                }
                            }
                        });
                    }
                } else {
                    await prisma.ticket.update({
                        where: { id: newTicket.id },
                        data: {
                            auditTrail: {
                                push: {
                                    action: 'ai_no_assignment',
                                    timestamp: new Date(),
                                    user_id: parseInt(requester_id),
                                    details: 'AI did not provide technician assignment',
                                    ai_response: aiResponse.data
                                }
                            }
                        }
                    });
                }
            } catch (aiError) {
                console.error(aiError);
                await prisma.ticket.update({
                    where: { id: newTicket.id },
                    data: {
                        auditTrail: {
                            push: {
                                action: 'ai_assignment_failed',
                                timestamp: new Date(),
                                user_id: parseInt(requester_id),
                                details: 'AI ticket assignment failed',
                                error: aiError.message,
                                error_details: {
                                    code: aiError.code,
                                    status: aiError.response?.status,
                                    data: aiError.response?.data
                                }
                            }
                        }
                    }
                });
            }
        } else {
            console.log('Skipping AI backend call - reason:',
                assigned_technician_id ? 'Technician already assigned' : 'AI_BACKEND_URL not configured');
        }

        // ✅ Fetch created ticket with relations
        const createdTicket = await prisma.ticket.findUnique({
            where: { id: newTicket.id },
            include: {
                requester: {
                    select: { id: true, name: true, email: true, department: true }
                },
                assignedTechnician: {
                    select: {
                        id: true,
                        name: true,
                        skillLevel: true,
                        user: { select: { id: true, name: true, email: true } }
                    }
                }
            }
        });

        res.status(201).json({
            success: true,
            message: 'Ticket created successfully',
            data: createdTicket
        });
    } catch (error) {
        console.error('=== CREATE TICKET ERROR ===');
        console.error('Create ticket error:', error);
        console.error('Error stack:', error.stack);
        res.status(500).json({
            success: false,
            message: 'Error creating ticket',
            error: error.message
        });
    }
};

const updateTicket = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            subject,
            description,
            status,
            priority,
            impact,
            urgency,
            assigned_technician_id,
            required_skills,
            tags,
            resolution_due,
            tasks,
            work_logs,
            satisfaction_rating,
            score,
            justification,
            feedback,
            sla_violated
        } = req.body;

        const ticket = await prisma.ticket.findUnique({
            where: { id: parseInt(id) }
        });

        if (!ticket) {
            return res.status(404).json({
                success: false,
                message: 'Ticket not found'
            });
        }

        // ✅ Check assigned technician if provided
        if (assigned_technician_id && assigned_technician_id !== ticket.assignedTechnicianId) {
            const technician = await prisma.technician.findUnique({
                where: { id: parseInt(assigned_technician_id) }
            });
            if (!technician) {
                return res.status(400).json({
                    success: false,
                    message: 'Assigned technician not found'
                });
            }
        }

        // ✅ Validate required_skills
        if (required_skills && Array.isArray(required_skills)) {
            for (const skillId of required_skills) {
                if (!Number.isInteger(skillId) || skillId < 1) {
                    return res.status(400).json({
                        success: false,
                        message: 'Required skills must be an array of positive integers'
                    });
                }
            }
        }

        // ✅ Validate score
        if (score !== undefined) {
            const scoreNum = parseFloat(score);
            if (isNaN(scoreNum) || scoreNum < 0.0 || scoreNum > 10.0) {
                return res.status(400).json({
                    success: false,
                    message: 'Score must be a number between 0.0 and 10.0'
                });
            }
        }

        // ✅ Validate justification
        if (justification !== undefined && justification.length > 1000) {
            return res.status(400).json({
                success: false,
                message: 'Justification must be less than 1000 characters'
            });
        }

        // ======================
        // Prepare update data
        // ======================
        const updateData = {};
        if (subject) updateData.subject = subject;
        if (description) updateData.description = description;
        if (status) {
            updateData.status = status;
            if (status === 'resolved' && ticket.status !== 'resolved') {
                updateData.resolvedAt = new Date();
            }
            if (status === 'closed' && ticket.status !== 'closed') {
                updateData.closedAt = new Date();
            }
        }
        if (priority) updateData.priority = priority;
        if (impact) updateData.impact = impact;
        if (urgency) updateData.urgency = urgency;
        if (assigned_technician_id !== undefined)
            updateData.assignedTechnicianId = parseInt(assigned_technician_id);
        if (required_skills !== undefined) updateData.requiredSkills = required_skills;
        if (tags !== undefined) updateData.tags = tags;
        if (resolution_due !== undefined)
            updateData.resolutionDue = resolution_due ? new Date(resolution_due) : null;
        if (tasks !== undefined) updateData.tasks = tasks;
        if (work_logs !== undefined) updateData.workLogs = work_logs;
        if (satisfaction_rating !== undefined) updateData.satisfactionRating = satisfaction_rating;
        if (score !== undefined) updateData.score = parseFloat(score);
        if (justification !== undefined) updateData.justification = justification;
        if (feedback !== undefined) updateData.feedback = feedback;
        if (sla_violated !== undefined) updateData.slaViolated = sla_violated;

        // ✅ Append audit trail
        updateData.auditTrail = [
            ...(ticket.auditTrail || []),
            {
                action: 'updated',
                timestamp: new Date(),
                user_id: req.user?.id || null,
                details: 'Ticket updated',
                changes: Object.keys(updateData).filter(k => k !== 'auditTrail')
            }
        ];

        // ✅ Update ticket
        await prisma.ticket.update({
            where: { id: parseInt(id) },
            data: updateData
        });

        // ✅ Return updated ticket
        const updatedTicket = await prisma.ticket.findUnique({
            where: { id: parseInt(id) },
            include: {
                requester: {
                    select: { id: true, name: true, email: true, department: true }
                },
                assignedTechnician: {
                    select: {
                        id: true,
                        name: true,
                        skillLevel: true,
                        user: { select: { id: true, name: true, email: true } }
                    }
                }
            }
        });

        res.status(200).json({
            success: true,
            message: 'Ticket updated successfully',
            data: updatedTicket
        });
    } catch (error) {
        console.error('Update ticket error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating ticket',
            error: error.message
        });
    }
};

const deleteTicket = async (req, res) => {
    try {
        const { id } = req.params;

        const ticket = await prisma.ticket.findUnique({
            where: { id: parseInt(id) }
        });

        if (!ticket) {
            return res.status(404).json({
                success: false,
                message: 'Ticket not found'
            });
        }

        await prisma.ticket.update({
            where: { id: parseInt(id) },
            data: {
                status: 'cancelled',
                auditTrail: {
                    push: {
                        action: 'cancelled',
                        timestamp: new Date(),
                        user_id: req.user?.id || null,
                        details: 'Ticket cancelled'
                    }
                }
            }
        });

        res.status(200).json({
            success: true,
            message: 'Ticket cancelled successfully'
        });
    } catch (error) {
        console.error('Delete ticket error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting ticket',
            error: error.message
        });
    }
};

const permanentDeleteTicket = async (req, res) => {
    try {
        const { id } = req.params;

        const ticket = await prisma.ticket.findUnique({
            where: { id: parseInt(id) }
        });

        if (!ticket) {
            return res.status(404).json({
                success: false,
                message: 'Ticket not found'
            });
        }

        await prisma.ticket.delete({
            where: { id: parseInt(id) }
        });

        res.status(200).json({
            success: true,
            message: 'Ticket permanently deleted'
        });
    } catch (error) {
        console.error('Permanent delete ticket error:', error);
        res.status(500).json({
            success: false,
            message: 'Error permanently deleting ticket',
            error: error.message
        });
    }
};

// Reactivate ticket (change status from cancelled back to new)
const reactivateTicket = async (req, res) => {
    try {
        const { id } = req.params;

        const ticket = await prisma.ticket.findUnique({
            where: { id: parseInt(id) }
        });

        if (!ticket) {
            return res.status(404).json({
                success: false,
                message: 'Ticket not found'
            });
        }

        const updatedAuditTrail = [
            ...(ticket.auditTrail || []),
            {
                action: 'reactivated',
                timestamp: new Date(),
                user_id: req.user?.id || null,
                details: 'Ticket reactivated'
            }
        ];

        await prisma.ticket.update({
            where: { id: parseInt(id) },
            data: {
                status: 'new',
                auditTrail: updatedAuditTrail
            }
        });

        const reactivatedTicket = await prisma.ticket.findUnique({
            where: { id: parseInt(id) },
            include: {
                requester: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        department: true
                    }
                },
                assignedTechnician: {
                    select: {
                        id: true,
                        name: true,
                        skillLevel: true,
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true
                            }
                        }
                    }
                }
            }
        });

        res.status(200).json({
            success: true,
            message: 'Ticket reactivated successfully',
            data: reactivatedTicket
        });
    } catch (error) {
        console.error('Reactivate ticket error:', error);
        res.status(500).json({
            success: false,
            message: 'Error reactivating ticket',
            error: error.message
        });
    }
};

const getTicketsBySkills = async (req, res) => {
    try {
        const { skills, page = 1, limit = 10, status } = req.query;

        if (!skills || (Array.isArray(skills) && skills.length === 0)) {
            return res.status(400).json({
                success: false,
                message: 'Skills parameter is required',
            });
        }

        const skillIds = Array.isArray(skills) ? skills.map(Number) : [Number(skills)];
        const offset = (parseInt(page) - 1) * parseInt(limit);

        // Build Prisma where clause
        const whereClause = {
            AND: [
                { requiredSkills: { hasSome: skillIds } },
                ...(status ? [{ status: { in: Array.isArray(status) ? status : [status] } }] : [])
            ]
        };

        // Fetch tickets with pagination
        const tickets = await prisma.ticket.findMany({
            where: whereClause,
            include: {
                requester: {
                    select: { id: true, name: true, email: true, department: true },
                },
                assignedTechnician: {
                    select: {
                        id: true,
                        name: true,
                        skillLevel: true,
                        user: { select: { id: true, name: true, email: true } },
                    },
                },
            },
            skip: offset,
            take: parseInt(limit),
            orderBy: [
                { priority: 'desc' }, // High priority first
                { createdAt: 'asc' }  // Then oldest first
            ],
        });

        // Total count for pagination
        const totalCount = await prisma.ticket.count({ where: whereClause });
        const totalPages = Math.ceil(totalCount / parseInt(limit));
        const currentPage = parseInt(page);

        res.status(200).json({
            success: true,
            data: {
                tickets,
                pagination: {
                    total: totalCount,
                    page: currentPage,
                    limit: parseInt(limit),
                    totalPages,
                    hasNextPage: currentPage < totalPages,
                    hasPrevPage: currentPage > 1,
                    nextPage: currentPage < totalPages ? currentPage + 1 : null,
                    prevPage: currentPage > 1 ? currentPage - 1 : null,
                },
                filters: {
                    required_skills: skillIds,
                    status,
                },
            },
        });
    } catch (error) {
        console.error('Get tickets by skills error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching tickets by skills',
            error: error.message,
        });
    }
};

const processSkillsAndUpdateTicket = async (req, res) => {
    try {
        const { skills, ticket_id } = req.body;

        if (!skills || !Array.isArray(skills) || skills.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Skills array is required and must not be empty',
            });
        }

        if (!ticket_id) {
            return res.status(400).json({
                success: false,
                message: 'Ticket ID is required',
            });
        }

        for (const skill of skills) {
            if (!skill.name || typeof skill.name !== 'string') {
                return res.status(400).json({
                    success: false,
                    message: 'Each skill must have a valid name',
                });
            }
        }

        // Check ticket exists
        const ticket = await prisma.ticket.findUnique({ where: { id: ticket_id } });
        if (!ticket) {
            return res.status(404).json({ success: false, message: 'Ticket not found' });
        }

        const processedSkills = [];
        const newSkills = [];
        const updatedSkills = [];

        for (const skillData of skills) {
            if (skillData.id) {
                // Update existing skill
                const existingSkill = await prisma.skill.findUnique({ where: { id: skillData.id } });
                if (!existingSkill) {
                    return res.status(404).json({ success: false, message: `Skill with ID ${skillData.id} not found` });
                }

                // Check for name conflict
                if (skillData.name && skillData.name !== existingSkill.name) {
                    const nameExists = await prisma.skill.findFirst({
                        where: { name: skillData.name, NOT: { id: skillData.id } }
                    });
                    if (nameExists) {
                        return res.status(400).json({ success: false, message: `Skill with name '${skillData.name}' already exists` });
                    }
                }

                const updated = await prisma.skill.update({
                    where: { id: skillData.id },
                    data: {
                        name: skillData.name,
                        description: skillData.description ?? existingSkill.description,
                        isActive: skillData.is_active ?? existingSkill.isActive,
                    },
                });

                updatedSkills.push(updated);
                processedSkills.push(updated.id);
            } else {
                // Create new skill or reuse existing by name
                let existingSkill = await prisma.skill.findUnique({ where: { name: skillData.name } });
                if (!existingSkill) {
                    existingSkill = await prisma.skill.create({
                        data: {
                            name: skillData.name,
                            description: skillData.description ?? null,
                            isActive: skillData.is_active ?? true,
                        },
                    });
                    newSkills.push(existingSkill);
                }
                processedSkills.push(existingSkill.id);
            }
        }

        // Update ticket requiredSkills JSON
        const updatedRequiredSkills = Array.from(new Set([...(ticket.requiredSkills ?? []), ...processedSkills]));

        const auditEntry = {
            action: 'skills_processed',
            timestamp: new Date(),
            user_id: req.user?.id ?? null,
            details: 'Skills processed and ticket updated',
            changes: {
                new_skills: newSkills.map(s => ({ id: s.id, name: s.name })),
                updated_skills: updatedSkills.map(s => ({ id: s.id, name: s.name })),
                total_skills_processed: processedSkills.length,
                skills_added_to_ticket: processedSkills,
            },
        };

        const updatedTicket = await prisma.ticket.update({
            where: { id: ticket_id },
            data: {
                requiredSkills: updatedRequiredSkills,
                auditTrail: [...(ticket.auditTrail ?? []), auditEntry],
            },
            include: {
                requester: { select: { id: true, name: true, email: true, department: true } },
                assignedTechnician: {
                    select: {
                        id: true,
                        name: true,
                        skillLevel: true,
                        user: { select: { id: true, name: true, email: true } }
                    }
                },
            },
        });

        res.status(200).json({
            success: true,
            message: 'Skills processed and ticket updated successfully',
            data: {
                ticket: updatedTicket,
                processed_skills: {
                    total: processedSkills.length,
                    new_skills: newSkills.map(s => ({ id: s.id, name: s.name })),
                    updated_skills: updatedSkills.map(s => ({ id: s.id, name: s.name })),
                    all_skill_ids: processedSkills,
                },
            },
        });
    } catch (error) {
        console.error('Process skills and update ticket error:', error);
        res.status(500).json({
            success: false,
            message: 'Error processing skills and updating ticket',
            error: error.message,
        });
    }
};

const debugAIBackend = async (req, res) => {
    try {
        console.log('=== AI BACKEND DEBUG TEST ===');

        if (!process.env.AI_BACKEND_URL) {
            return res.status(400).json({
                success: false,
                message: 'AI_BACKEND_URL not configured',
                env_vars: {
                    AI_BACKEND_URL: process.env.AI_BACKEND_URL,
                    NODE_ENV: process.env.NODE_ENV
                }
            });
        }

        const results = {
            healthCheck: null,
            serviceStatus: null,
            sampleAssignment: null
        };

        // Health check
        try {
            const healthResponse = await axios.get(`${process.env.AI_BACKEND_URL}/health`, { timeout: 10000 });
            results.healthCheck = { success: true, data: healthResponse.data };
            console.log('Health check response:', healthResponse.data);
        } catch (err) {
            results.healthCheck = { success: false, error: err.message, data: err.response?.data };
            console.error('Health check failed:', err.message);
        }

        // Service status
        try {
            const statusResponse = await axios.get(`${process.env.AI_BACKEND_URL}/api/service-status`, { timeout: 10000 });
            results.serviceStatus = { success: true, data: statusResponse.data };
            console.log('Service status response:', statusResponse.data);
        } catch (err) {
            results.serviceStatus = { success: false, error: err.message, data: err.response?.data };
            console.error('Service status check failed:', err.message);
        }

        // Sample ticket assignment
        const sampleTicketData = {
            ticket: {
                subject: "Test ticket for debugging",
                description: "This is a test ticket to verify AI backend integration",
                requester_id: 1,
                priority: "normal",
                impact: "medium",
                urgency: "normal",
                complexity_level: "level_1",
                tags: ["test", "debug"]
            }
        };
        console.log('Sending sample ticket data:', JSON.stringify(sampleTicketData, null, 2));

        try {
            const assignmentResponse = await axios.post(
                `${process.env.AI_BACKEND_URL}/api/ticket-assignment`,
                sampleTicketData,
                { headers: { 'Content-Type': 'application/json' }, timeout: 30000 }
            );

            results.sampleAssignment = { success: true, data: assignmentResponse.data };
            console.log('Sample assignment response:', assignmentResponse.data);

            return res.json({
                success: true,
                message: 'AI backend debug test completed',
                ai_backend_url: process.env.AI_BACKEND_URL,
                results,
                response_fields: {
                    success: assignmentResponse.data.success,
                    selected_technician_id: assignmentResponse.data.selected_technician_id,
                    assigned_technician_id: assignmentResponse.data.assigned_technician_id,
                    justification: assignmentResponse.data.justification,
                    error_message: assignmentResponse.data.error_message
                }
            });
        } catch (assignmentError) {
            console.error('Sample assignment failed:', assignmentError.message);

            results.sampleAssignment = { success: false, error: assignmentError.message, data: assignmentError.response?.data };

            return res.status(500).json({
                success: false,
                message: 'AI backend assignment test failed',
                ai_backend_url: process.env.AI_BACKEND_URL,
                results,
                error_details: {
                    code: assignmentError.code,
                    status: assignmentError.response?.status,
                    statusText: assignmentError.response?.statusText,
                    data: assignmentError.response?.data
                }
            });
        }
    } catch (error) {
        console.error('AI backend debug error:', error);
        res.status(500).json({
            success: false,
            message: 'Error during AI backend debug test',
            error: error.message
        });
    }
};

const closeTicket = async (req, res) => {
    try {
        const { id } = req.params;
        const { feedback, satisfaction_rating, resolution_notes } = req.body;

        // Find ticket
        const ticket = await prisma.ticket.findUnique({
            where: { id: parseInt(id) },
            include: {
                requester: {
                    select: { id: true, name: true, email: true, department: true }
                },
                assignedTechnician: {
                    select: {
                        id: true,
                        name: true,
                        skillLevel: true,
                        user: { select: { id: true, name: true, email: true } }
                    }
                }
            }
        });

        if (!ticket) {
            return res.status(404).json({ success: false, message: 'Ticket not found' });
        }

        if (ticket.status === 'closed') {
            return res.status(400).json({ success: false, message: 'Ticket is already closed' });
        }

        // Update ticket to closed
        const auditEntry = {
            action: 'closed',
            timestamp: new Date(),
            user_id: req.user?.id || null,
            details: 'Ticket closed',
            notes: resolution_notes
        };

        const updatedTicket = await prisma.ticket.update({
            where: { id: ticket.id },
            data: {
                status: 'closed',
                closedAt: new Date(),
                feedback: feedback || null,
                satisfactionRating: satisfaction_rating || null,
                auditTrail: [...(ticket.auditTrail || []), auditEntry]
            },
            include: {
                requester: { select: { id: true, name: true, email: true, department: true } },
                assignedTechnician: {
                    select: {
                        id: true,
                        name: true,
                        skillLevel: true,
                        user: { select: { id: true, name: true, email: true } }
                    }
                }
            }
        });

        // Call AI backend for skills evaluation (optional)
        if (process.env.AI_BACKEND_URL) {
            try {
                const evaluationResponse = await axios.post(
                    `${process.env.AI_BACKEND_URL}/api/evaluate-skills`,
                    {
                        ticket: {
                            id: updatedTicket.id,
                            subject: updatedTicket.subject,
                            description: updatedTicket.description,
                            resolution: resolution_notes,
                            status: 'closed',
                            priority: updatedTicket.priority,
                            impact: updatedTicket.impact,
                            urgency: updatedTicket.urgency,
                            required_skills: updatedTicket.requiredSkills,
                            assigned_technician_id: updatedTicket.assignedTechnicianId,
                            tasks: updatedTicket.tasks,
                            work_logs: updatedTicket.workLogs,
                            feedback: updatedTicket.feedback,
                            satisfaction_rating: updatedTicket.satisfactionRating
                        }
                    },
                    { headers: { 'Content-Type': 'application/json' } }
                );

                const { metrics, technician } = evaluationResponse.data;

                if (technician?.technician_id) {
                    // Update technician skills
                    await prisma.technician.update({
                        where: { id: technician.technician_id },
                        data: {
                            skills: technician.skills,
                            updatedAt: new Date()
                        }
                    });

                    // Append evaluation info to ticket auditTrail
                    await prisma.ticket.update({
                        where: { id: updatedTicket.id },
                        data: {
                            auditTrail: {
                                push: {
                                    action: 'skills_evaluated',
                                    timestamp: new Date(),
                                    user_id: req.user?.id || null,
                                    details: 'Technician skills updated based on ticket resolution',
                                    updates: {
                                        skills: technician.skills,
                                        metrics: metrics
                                    },
                                    evaluation_success: true
                                }
                            }
                        }
                    });
                }
            } catch (evalError) {
                console.error('Skills evaluation error:', evalError.message);
            }
        }

        return res.status(200).json({
            success: true,
            message: 'Ticket closed successfully',
            data: updatedTicket
        });
    } catch (error) {
        console.error('Close ticket error:', error);
        return res.status(500).json({
            success: false,
            message: 'Error closing ticket',
            error: error.message
        });
    }
};

module.exports = {
    closeTicket,
    debugAIBackend, 
    processSkillsAndUpdateTicket, 
    getTicketsBySkills,
    permanentDeleteTicket,
    reactivateTicket, 
    updateTicket, 
    deleteTicket, 
    createTicket, 
    getTicketsByTechnicianId, 
    getTicketsByUserId, 
    getTicketById, 
    getAllTickets, 
    getAllTicketsSimple
};

