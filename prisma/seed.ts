const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@rawaa.ma'
  const adminPassword = 'admin123'

  const existingAdmin = await prisma.admin.findUnique({ where: { email: adminEmail } })
  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash(adminPassword, 12)
    await prisma.admin.create({
      data: { email: adminEmail, password: hashedPassword },
    })
    console.log(`Admin created: ${adminEmail} / ${adminPassword}`)
  }

  const products = [
    {
      name: 'Rose Éternelle',
      nameAr: 'الوردة الأبدية',
      slug: 'rose-eternelle',
      description: 'Un parfum floral élégant aux notes de rose et de musc blanc. Parfait pour une touche de féminité au quotidien.',
      descriptionAr: 'عطر زهري أنيق مع نوتات الورد والمسك الأبيض. مثالي للمسات الأنوثة اليومية.',
      price: 250,
      originalPrice: 350,
      images: ['/images/perfume-1.svg', '/images/perfume-2.svg'],
      category: 'PERFUME',
      subcategory: 'Eau de Parfum',
      stock: 25,
      featured: true,
      tags: ['rose', 'floral', 'musc'],
    },
    {
      name: 'Ambre Royal',
      nameAr: 'العنبر الملكي',
      slug: 'ambre-royal',
      description: 'Un parfum oriental chaleureux mêlant ambre, vanille et bois de santal.',
      descriptionAr: 'عطر شرقي دافئ يمزج بين العنبر والفانيليا وخشب الصندل.',
      price: 320,
      originalPrice: null,
      images: ['/images/perfume-2.svg', '/images/perfume-1.svg'],
      category: 'PERFUME',
      subcategory: 'Eau de Parfum',
      stock: 18,
      featured: true,
      tags: ['ambre', 'oriental', 'vanille'],
    },
    {
      name: 'Bracelet Doré',
      nameAr: 'سوار ذهبي',
      slug: 'bracelet-dore',
      description: 'Un bracelet élégant en acier inoxydable avec finition dorée. Ajustable et résistant.',
      descriptionAr: 'سوار أنيق من الفولاذ المقاوم للصدأ بلمسة ذهبية. قابل للتعديل ومتين.',
      price: 180,
      originalPrice: 250,
      images: ['/images/jewelry-1.svg', '/images/jewelry-2.svg'],
      category: 'JEWELRY',
      subcategory: 'Bracelets',
      stock: 30,
      featured: true,
      tags: ['bracelet', 'doré', 'acier'],
    },
    {
      name: 'Collier Perle',
      nameAr: 'قلادة لؤلؤ',
      slug: 'collier-perle',
      description: 'Un collier subtil avec perle naturelle et chaîne en argent. Idéal pour toutes les occasions.',
      descriptionAr: 'قلادة رقيقة مع لؤلؤة طبيعية وسلسلة فضية. مثالية لجميع المناسبات.',
      price: 290,
      originalPrice: null,
      images: ['/images/jewelry-2.svg', '/images/jewelry-1.svg'],
      category: 'JEWELRY',
      subcategory: 'Colliers',
      stock: 15,
      featured: true,
      tags: ['collier', 'perle', 'argent'],
    },
    {
      name: 'Oud Mystique',
      nameAr: 'عود غامض',
      slug: 'oud-mystique',
      description: 'Un parfum intense au oud, encens et cuir. Une signature olfactive puissante.',
      descriptionAr: 'عطر قوي مع العود والبخور والجلد. بصمة عطرية قوية.',
      price: 400,
      originalPrice: 550,
      images: ['/images/perfume-1.svg'],
      category: 'PERFUME',
      subcategory: 'Eau de Parfum',
      stock: 0,
      featured: false,
      tags: ['oud', 'cuir', 'intense'],
    },
  ]

  for (const product of products) {
    const existing = await prisma.product.findUnique({ where: { slug: product.slug } })
    if (!existing) {
      await prisma.product.create({ data: product })
      console.log(`Product created: ${product.name}`)
    }
  }

  console.log('Seed completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
