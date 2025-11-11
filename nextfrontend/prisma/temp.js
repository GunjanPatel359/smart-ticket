// import prisma from "../lib/db.ts";
// import { PrismaClient } from "@prisma/client";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const ticket = await prisma.ticket.update({
    where: {id:2},
    data:{
        requesterId: 4
    }
})


console.log(ticket)
console.log("done")