'use strict';

const { faker } = require('@faker-js/faker');

module.exports = {
  async up(queryInterface, Sequelize) {
    // ---------------- USERS ----------------
    const users = [];
    for (let i = 0; i < 15; i++) {
      const phone = faker.string.numeric(10);
      const phoneWithCode = `+91${phone}`;
      users.push({
        name: faker.person.fullName(),
        email: faker.internet.email(),
        contact_no: phoneWithCode,
        role: 'user',
        password: faker.internet.password(8),
        department: faker.commerce.department(),
        status: true,
        created_at: new Date(),
        updated_at: new Date()
      });
    }
    await queryInterface.bulkInsert('users', users, {});

    // Fetch inserted users
    const insertedUsers = await queryInterface.sequelize.query(
      `SELECT id FROM users ORDER BY id ASC LIMIT 15;`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );
    const userIds = insertedUsers.map(u => u.id);

    // ---------------- SKILLS ----------------
    const skillNames = [
      'Networking',
      'VPN Configuration',
      'Firewall',
      'Linux Admin',
      'Windows Server',
      'Cloud Support',
      'Database Management'
    ];

    const skills = skillNames.map(name => ({
      name,
      description: faker.lorem.sentence(),
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    }));

    await queryInterface.bulkInsert('skills', skills, {});

    // Fetch inserted skills
    const insertedSkills = await queryInterface.sequelize.query(
      `SELECT id, name FROM skills ORDER BY id ASC;`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    // ---------------- TECHNICIANS ----------------
    const technicians = [];
    const techUserIds = userIds.slice(0, 5); // first 5 users become technicians

    for (let i = 0; i < techUserIds.length; i++) {
      // assign 1–4 random skills
      const selectedSkills = faker.helpers.arrayElements(insertedSkills, faker.number.int({ min: 1, max: 4 }));
      const skillObjects = selectedSkills.map(s => ({
        id: s.id,
        percentage: faker.number.int({ min: 50, max: 100 })
      }));

      technicians.push({
        name: faker.person.fullName(),
        user_id: techUserIds[i],
        assigned_tickets_total: 0,
        assigned_tickets: JSON.stringify([]),
        skills: JSON.stringify(skillObjects), // store as JSON
        workload: faker.number.int({ min: 0, max: 100 }),
        availability_status: faker.helpers.arrayElement([
          'available',
          'busy',
          'in_meeting',
          'on_break',
          'end_of_shift',
          'focus_mode'
        ]),
        skill_level: faker.helpers.arrayElement(['junior', 'mid', 'senior', 'expert']),
        specialization: faker.commerce.department(),
        is_active: true,
        created_at: new Date(),
        updated_at: new Date()
      });
    }

    await queryInterface.bulkInsert('technicians', technicians, {});

    // Fetch inserted technicians
    const insertedTechs = await queryInterface.sequelize.query(
      `SELECT id FROM technicians ORDER BY id ASC;`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );
    const techIds = insertedTechs.map(t => t.id);

    // ---------------- TICKETS ----------------
    const tickets = [];
    const priorities = ['low', 'normal', 'high', 'critical'];
    const impacts = ['low', 'medium', 'high', 'critical'];

    for (let i = 0; i < 20; i++) {
      const requesterId = faker.helpers.arrayElement(userIds);
      const assignedTechnicianId = faker.helpers.arrayElement(techIds);
      const requiredSkills = faker.helpers.arrayElements(insertedSkills.map(s => s.id), 2);

      tickets.push({
        subject: faker.lorem.words(5),
        description: faker.lorem.sentence(12),
        status: faker.helpers.arrayElement(['new', 'assigned', 'in_progress', 'on_hold', 'resolved']),
        tags: JSON.stringify(faker.helpers.arrayElements(['network', 'vpn', 'server', 'firewall', 'database', 'cloud'], 2)),
        priority: faker.helpers.arrayElement(priorities),
        impact: faker.helpers.arrayElement(impacts),
        urgency: faker.helpers.arrayElement(priorities),
        requester_id: requesterId,
        assigned_technician_id: assignedTechnicianId,
        required_skills: JSON.stringify(requiredSkills),
        tasks: JSON.stringify([{ sub: 'Check system', status: 'pending', description: 'Initial troubleshooting' }]),
        work_logs: JSON.stringify([]),
        audit_trail: JSON.stringify([]),
        sla_violated: false,
        created_at: new Date(),
        updated_at: new Date()
      });
    }

    await queryInterface.bulkInsert('tickets', tickets, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('tickets', null, {});
    await queryInterface.bulkDelete('technicians', null, {});
    await queryInterface.bulkDelete('skills', null, {});
    await queryInterface.bulkDelete('users', null, {});
  }
};
