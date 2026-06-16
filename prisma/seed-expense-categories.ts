import { PrismaClient } from "../generated/prisma";

const prisma = new PrismaClient();

const CATEGORIES = [
  {
    name: "고정지출",
    order: 0,
    subcategories: [
      { name: "임대료",  order: 0, description: "매월 고정적으로 납부하는 사업장 임대료" },
      { name: "공과금",  order: 1, description: "전기·수도·가스 등 공과금" },
      { name: "통신비",  order: 2, description: "인터넷, 유선·무선 전화 등 통신 비용" },
      { name: "보험료",  order: 3, description: "화재보험, 사업자보험 등 고정 보험료" },
    ],
  },
  {
    name: "재료비",
    order: 1,
    subcategories: [
      { name: "기본부자재",  order: 0, description: "실, 단추, 지퍼 등 수선에 사용하는 기본 소모품" },
      { name: "원단/보강재", order: 1, description: "원단, 심지, 보강재 등 소재 구매 비용" },
      { name: "특수부자재",  order: 2, description: "가죽, 금속 등 특수 목적 부자재" },
      { name: "외부협업",    order: 3, description: "외부 업체에 위탁하는 작업 비용" },
    ],
  },
  {
    name: "유지비",
    order: 2,
    subcategories: [
      { name: "포장및비품비",   order: 0, description: "포장재, 행거, 소도구 등 비품 구매" },
      { name: "유지보수비",     order: 1, description: "재봉틀, 인두기 등 장비·시설 수리/유지 비용" },
      { name: "교통및물류비",   order: 2, description: "배송비, 교통비 등 이동·물류 비용" },
    ],
  },
  {
    name: "기타",
    order: 3,
    subcategories: [
      { name: "마케팅",      order: 0, description: "SNS 광고, 홍보물 제작 등 마케팅 비용" },
      { name: "세무/기장료", order: 1, description: "세무사, 회계사 비용" },
      { name: "식비",        order: 2, description: "업무 관련 식사·다과 비용" },
    ],
  },
];

async function main() {
  for (const cat of CATEGORIES) {
    const existing = await prisma.expense_category.findFirst({ where: { name: cat.name } });
    const category = existing
      ? existing
      : await prisma.expense_category.create({ data: { name: cat.name, order: cat.order } });

    for (const sub of cat.subcategories) {
      const existingSub = await prisma.expense_subcategory.findFirst({
        where: { name: sub.name, categoryId: category.id },
      });
      if (!existingSub) {
        await prisma.expense_subcategory.create({
          data: {
            name: sub.name,
            description: sub.description,
            order: sub.order,
            categoryId: category.id,
          },
        });
      }
    }
    console.log(`✅ ${cat.name} (${cat.subcategories.length}개 중분류)`);
  }
  console.log("카테고리 시드 완료");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
