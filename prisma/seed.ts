import { PrismaClient, IndustryCategory } from "../app/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import "dotenv/config";
import { ALL_TEMPLATES } from "../templates/registry";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding SuperAdmin Master Industry Templates from templates/ directory...\n");

  for (const tpl of ALL_TEMPLATES) {
    console.log(`📦 Processing Template: ${tpl.name} [${tpl.slug}]`);

    const allowedBlocks = tpl.components.map((c) => c.type);

    // Upsert Template Root
    const templateRecord = await prisma.template.upsert({
      where: { slug: tpl.slug },
      update: {
        name: tpl.name,
        industry: tpl.industry as unknown as IndustryCategory,
        brandVibe: tpl.brandVibe,
        version: tpl.version,
        description: tpl.description,
        thumbnailUrl: tpl.thumbnailUrl,
        allowedBlocks,
        isActive: true,
      },
      create: {
        name: tpl.name,
        slug: tpl.slug,
        industry: tpl.industry as unknown as IndustryCategory,
        brandVibe: tpl.brandVibe,
        version: tpl.version,
        description: tpl.description,
        thumbnailUrl: tpl.thumbnailUrl,
        allowedBlocks,
        isActive: true,
      },
    });

    // Upsert Template Pages
    for (const page of tpl.pages) {
      await prisma.templatePage.upsert({
        where: {
          templateId_slug: {
            templateId: templateRecord.id,
            slug: page.slug,
          },
        },
        update: {
          title: page.title,
          isSystem: page.isSystem,
          version: page.version,
          sections: page.sections as any,
        },
        create: {
          templateId: templateRecord.id,
          slug: page.slug,
          title: page.title,
          isSystem: page.isSystem,
          version: page.version,
          sections: page.sections as any,
        },
      });
      console.log(`   └─ Page: /${page.slug} ("${page.title}") [${page.sections.length} sections]`);
    }

    console.log(`   ✅ Seeded ${tpl.name} (${allowedBlocks.length} components registered)\n`);
  }

  console.log("🎉 SuperAdmin Master Templates Seed Completed Successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
