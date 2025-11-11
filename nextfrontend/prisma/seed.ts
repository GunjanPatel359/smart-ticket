import {
  PrismaClient,
  TicketStatus,
  Priority,
  Impact,
  Urgency,
  SkillLevel,
  AvailabilityStatus,
} from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // ---- Users ----
  await Promise.all([
    prisma.user.upsert({
      where: { email: "alice@example.com" },
      update: {},
      create: { name: "Alice Johnson", email: "alice@example.com", password: "hashedpwd1" },
    }),
    prisma.user.upsert({
      where: { email: "bob@example.com" },
      update: {},
      create: { name: "Bob Smith", email: "bob@example.com", password: "hashedpwd2" },
    }),
    prisma.user.upsert({
      where: { email: "carol@example.com" },
      update: {},
      create: { name: "Carol Davis", email: "carol@example.com", password: "hashedpwd3" },
    }),
  ]);

  // ---- Skills ----
  await Promise.all([
    prisma.skill.upsert({
      where: { name: "Networking" },
      update: {},
      create: { name: "Networking", category: "Infrastructure", description: "Knowledge of network troubleshooting" },
    }),
    prisma.skill.upsert({
      where: { name: "Hardware Repair" },
      update: {},
      create: { name: "Hardware Repair", category: "Hardware", description: "Diagnose and fix hardware issues" },
    }),
    prisma.skill.upsert({
      where: { name: "Software Installation" },
      update: {},
      create: { name: "Software Installation", category: "Software", description: "Install and configure applications" },
    }),
    prisma.skill.upsert({
      where: { name: "Security" },
      update: {},
      create: { name: "Security", category: "Infrastructure", description: "Network and system security knowledge" },
    }),
    prisma.skill.upsert({
      where: { name: "Database Management" },
      update: {},
      create: { name: "Database Management", category: "Software", description: "Manage databases and queries" },
    }),
  ]);

  // ---- Technicians (with new fields) ----
  await prisma.technician.upsert({
    where: { email: "john.doe@example.com" },
    update: {},
    create: {
      name: "John Doe",
      email: "john.doe@example.com",
      contactNo: "1234567890",
      department: "Infrastructure",
      password: "hashedpwd",
      resolvedTickets: 15,
      totalTickets: 20,
      workload: 5,
      technicianLevel: SkillLevel.senior,
      availabilityStatus: AvailabilityStatus.available,
      isActive: true,
      experience: 7.5,
    },
  });

  await prisma.technician.upsert({
    where: { email: "jane.smith@example.com" },
    update: {},
    create: {
      name: "Jane Smith",
      email: "jane.smith@example.com",
      contactNo: "9876543210",
      department: "Software",
      password: "hashedpwd",
      resolvedTickets: 10,
      totalTickets: 15,
      workload: 3,
      technicianLevel: SkillLevel.mid,
      availabilityStatus: AvailabilityStatus.busy,
      isActive: true,
      experience: 4.2,
    },
  });

  // ---- Fetch entities ----
  const [alice, bob, carol] = await Promise.all([
    prisma.user.findUnique({ where: { email: "alice@example.com" } }),
    prisma.user.findUnique({ where: { email: "bob@example.com" } }),
    prisma.user.findUnique({ where: { email: "carol@example.com" } }),
  ]);

  const [john, jane] = await Promise.all([
    prisma.technician.findUnique({ where: { email: "john.doe@example.com" } }),
    prisma.technician.findUnique({ where: { email: "jane.smith@example.com" } }),
  ]);

  const [networking, hardware, software, security, database] = await Promise.all([
    prisma.skill.findUnique({ where: { name: "Networking" } }),
    prisma.skill.findUnique({ where: { name: "Hardware Repair" } }),
    prisma.skill.findUnique({ where: { name: "Software Installation" } }),
    prisma.skill.findUnique({ where: { name: "Security" } }),
    prisma.skill.findUnique({ where: { name: "Database Management" } }),
  ]);

  if (!alice || !bob || !carol || !john || !jane || !networking || !hardware || !software || !security || !database) {
    throw new Error("Required seed data not found");
  }

  // ---- Technician Skills ----
  await prisma.technicianSkill.createMany({
    data: [
      { technicianId: john.id, skillId: networking.id, score: 80 },
      { technicianId: john.id, skillId: software.id, score: 85 },
      { technicianId: john.id, skillId: security.id, score: 75 },
      { technicianId: jane.id, skillId: hardware.id, score: 70 },
      { technicianId: jane.id, skillId: database.id, score: 90 },
    ],
    skipDuplicates: true,
  });

  // ---- Tickets ----
  const ticketsData = [
    {
      subject: "Email server down",
      description: "Exchange server not responding",
      status: TicketStatus.in_progress,
      priority: Priority.critical,
      impact: Impact.high,
      urgency: Urgency.critical,
      requesterId: alice.id,
      assignedTechnicianId: john.id,
      requiredSkills: [networking.id, software.id],
    },
    {
      subject: "Password reset request",
      description: "User unable to access account",
      status: TicketStatus.resolved,
      priority: Priority.low,
      impact: Impact.low,
      urgency: Urgency.normal,
      requesterId: bob.id,
      assignedTechnicianId: jane.id,
      satisfactionRating: 5,
      requiredSkills: [software.id, hardware.id],
    },
    {
      subject: "Software installation",
      description: "Need Adobe Creative Suite installed",
      status: TicketStatus.assigned,
      priority: Priority.normal,
      impact: Impact.medium,
      urgency: Urgency.normal,
      requesterId: carol.id,
      assignedTechnicianId: john.id,
      requiredSkills: [software.id, networking.id],
    },
    {
      subject: "Network connectivity issue",
      description: "Unable to connect to company VPN",
      status: TicketStatus.new,
      priority: Priority.high,
      impact: Impact.high,
      urgency: Urgency.high,
      requesterId: alice.id,
      requiredSkills: [networking.id, hardware.id, software.id],
    },
    {
      subject: "Printer not working",
      description: "Office printer showing error messages",
      status: TicketStatus.on_hold,
      priority: Priority.normal,
      impact: Impact.medium,
      urgency: Urgency.normal,
      requesterId: bob.id,
      assignedTechnicianId: jane.id,
      slaViolated: true,
      requiredSkills: [hardware.id, networking.id],
    },
    {
      subject: "Database performance issue",
      description: "Database queries are slow",
      status: TicketStatus.in_progress,
      priority: Priority.high,
      impact: Impact.critical,
      urgency: Urgency.high,
      requesterId: carol.id,
      assignedTechnicianId: jane.id,
      requiredSkills: [database.id, software.id],
    },
  ];

  // Create tickets
  await prisma.ticket.createMany({
    data: ticketsData.map(t => ({
      subject: t.subject,
      description: t.description,
      status: t.status,
      priority: t.priority,
      impact: t.impact,
      urgency: t.urgency,
      requesterId: t.requesterId,
      assignedTechnicianId: t.assignedTechnicianId,
      satisfactionRating: t.satisfactionRating,
      slaViolated: t.slaViolated,
    })),
    skipDuplicates: true,
  });

  // Connect required skills
  for (const ticket of ticketsData) {
    const dbTicket = await prisma.ticket.findFirst({ where: { subject: ticket.subject } });
    if (dbTicket) {
      await prisma.ticket.update({
        where: { id: dbTicket.id },
        data: {
          requiredSkills: {
            connect: ticket.requiredSkills.map(id => ({ id })),
          },
        },
      });
    }
  }
}

main()
  .then(() => console.log("✅ Seed completed."))
  .catch(e => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
