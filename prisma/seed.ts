import { PrismaClient } from "../generated/prisma";

const prisma = new PrismaClient();

async function main() {
  await prisma.plan.createMany({
    data: [
      {
        name: "프리",
        print:        false,
        register:     false,
        send_message: false,
      },
      {
        name: "베이직",
        print:        false,
        register:     false,
        send_message: true,
      },
      {
        name: "프리미엄",
        print:        true,
        register:     true,
        send_message: true,
      },
    ],
    skipDuplicates: true,
  });

  console.log("✅ Plan seed 완료");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
