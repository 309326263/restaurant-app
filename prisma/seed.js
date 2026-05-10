import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // =========================
  // 🧱 LIMPIEZA (opcional)
  // =========================
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.table.deleteMany();
  await prisma.extra.deleteMany();
  await prisma.KitchenTicket.deleteMany(); // si existe

  // =========================
  // 🍽 MESAS
  // =========================
  await prisma.table.createMany({
    data: [
      { name: "Mesa 1" },
      { name: "Mesa 2" },
      { name: "Mesa 3" },
      { name: "Mesa 4" },
      { name: "Mesa 5" },
      { name: "Mesa 6" },
      { name: "Mesa 7" },
      { name: "Mesa 8" },
      { name: "Mesa 9" },
    ],
  });

  // =========================
  // 🍶 EXTRAS
  // =========================
  await prisma.extra.createMany({
    data: [
      { name: "Salsa dulce", price: 30 },
      { name: "Salsa spicy", price: 30 },
      { name: "Salsa ponzu", price: 30 },
      { name: "Salsa tampico", price: 30 },
    ],
  });

  // =========================
  // 🥗 CATEGORÍAS
  // =========================
  const entradas = await prisma.category.create({
  data: {
    name: "Entradas",
    key: "entradas",
  },
});

const sopas = await prisma.category.create({
  data: {
    name: "Sopas y Ramen",
    key: "soup_ramen",
  },
});

const udon = await prisma.category.create({
  data: {
    name: "Udon y Tallarines",
    key: "udon_noodles",
  },
});

const arroz = await prisma.category.create({
  data: {
    name: "Arroz",
    key: "rice",
  },
});

const sushi = await prisma.category.create({
  data: {
    name: "Sushi",
    key: "sushi",
  },
});

const especiales = await prisma.category.create({
  data: {
    name: "Especialidades y Paquetes",
    key: "specialties",
  },
});

const bebidas = await prisma.category.create({
  data: {
    name: "Bebidas",
    key: "drinks",
  },
});

const postres = await prisma.category.create({
  data: {
    name: "Postres",
    key: "desserts",
  },
});


const manuales = await prisma.category.create({
  data: {
    name: "Manuales",
    key: "manuals",
  },
});

  // =========================
  // 🍣 ENTRADAS
  // =========================
  await prisma.product.createMany({
    data: [
      {
        name: "Gyoza",
        price: 91,
        description: "3 pzs empanaditas japonesas",
        categoryId: entradas.id,
        station: "KITCHEN",
      },
      {
        name: "Camarón Roca",
        price: 220,
        description: "Tempura con salsa spicy",
        categoryId: entradas.id,
        station: "KITCHEN",
      },
    ],
  });

  await prisma.product.create({
    data: {
      name: "Edamame",
        price: 101,
        description: "Frijol de soya al vapor o asado",
        categoryId: entradas.id,
        station: "KITCHEN",
      variants: {
        create: [
          { name: "Al vapor", price: 126 },
          { name: "Asados", price: 210 }
        
        ],
      },
    },
  }); 

  // =========================
  // 🍜 SOPAS / RAMEN
  // =========================
  const ramen = await prisma.product.create({
    data: {
      name: "Shoyu Ramen",
      price: 236,
      description: "Tallarín con chasyu, huevo y vegetales",
      categoryId: sopas.id,
      station: "KITCHEN",
      variants: {
        create: [
          { name: "Pollo", price: 276 },
          { name: "Res", price: 296 },
          { name: "Camarón", price: 308 },
          { name: "Mixto", price: 320 },
        ],
      },
    },
  });

  await prisma.product.create({
    data: {
      name: "Curry Ramen",
      price: 220,
      description: "Sabor curry con vegetales",
      categoryId: sopas.id,
      station: "KITCHEN",
      variants: {
        create: [
          { name: "Pollo", price: 276 },
          { name: "Res", price: 296 },
          { name: "Camarón", price: 308 },
          { name: "Mixto", price: 320 },
        ],
      },
    },
  });

  // =========================
  // 🍱 ARROZ
  // =========================
  await prisma.product.create({
    data: {
      name: "Yakimeshi",
      price: 126,
      description: "Arroz frito con verduras",
      categoryId: arroz.id,
      station: "KITCHEN",
      variants: {
        create: [
          { name: "Pollo", price: 133 },
          { name: "Res", price: 146 },
          { name: "Camarón", price: 166 },
          { name: "Mixto", price: 171 },
        ],
      },
    },
  });

  // =========================
  // 🍣 SUSHI (principal cocina)
  // =========================
  await prisma.product.createMany({
    data: [
      {
        name: "California Roll",
        price: 126,
        description: "Surimi, pepino, aguacate",
        categoryId: sushi.id,
        station: "KITCHEN",
      },
      {
        name: "Philadelphia Roll",
        price: 149,
        description: "Salmón, pepino, queso",
        categoryId: sushi.id,
        station: "KITCHEN",
      },
      {
        name: "Dragon Roll",
        price: 210,
        description: "Camarón, queso, capeado",
        categoryId: sushi.id,
        station: "KITCHEN",
      },
    ],
  });

  // =========================
  // 🍶 BEBIDAS (BAR)
  // =========================
  await prisma.product.createMany({
    data: [
      {
        name: "Coca Cola",
        price: 50,
        description: "Refresco",
        categoryId: bebidas.id,
        station: "BAR",
      },
      {
        name: "Agua",
        price: 36,
        description: "Agua natural",
        categoryId: bebidas.id,
        station: "BAR",
      },
      {
        name: "Calpis",
        price: 50,
        description: "Bebida japonesa",
        categoryId: bebidas.id,
        station: "BAR",
      },
    ],
  });

  // =========================
  // 🍰 POSTRES
  // =========================
  await prisma.product.createMany({
    data: [
      {
        name: "Tempura Helado",
        price: 85,
        description: "Helado frito",
        categoryId: postres.id,
        station: "KITCHEN",
      },
      {
        name: "Helado Matcha",
        price: 85,
        description: "Helado verde japonés",
        categoryId: postres.id,
        station: "KITCHEN",
      },
    ],
  });

  console.log("✅ SEED COMPLETO LISTO");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });