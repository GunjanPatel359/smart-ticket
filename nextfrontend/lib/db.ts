import { PrismaClient, Prisma } from "@prisma/client";

import * as util from "util";

const globalForPrisma = globalThis as { prisma?: PrismaClient };

// Initialize or reuse Prisma
const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: ["warn", "error"],
}).$extends({
  query: {
    $allModels: {
      async $allOperations({ operation, model, args, query }) {
        const start = performance.now();
        const result = await query(args);
        const end = performance.now();
        const time = end - start;
        console.log(
          util.inspect(
            { model, operation, args, time },
            { showHidden: false, depth: null, colors: true }
          )
        );
        return result;
      },
    },
  },
});;

// ✅ Correctly typed middleware
// prisma.$use(async (params: Prisma.MiddlewareParams, next: Prisma.MiddlewareNext) => {
//   const start = Date.now();
//   const result = await next(params);
//   const duration = Date.now() - start;
//   console.log(`[⏱️ Prisma] ${params.model}.${params.action} took ${duration}ms`);
//   return result;
// });

export default prisma;
