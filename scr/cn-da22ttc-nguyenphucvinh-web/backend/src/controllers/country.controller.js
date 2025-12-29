import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// Lấy danh sách quốc gia
export const listCountries = async (req, res) => {
  try {
    const countries = await prisma.country.findMany({
      select: {
        id: true,
        name: true
      },
      orderBy: { name: 'asc' }
    });
    res.json({ countries: countries });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Lỗi khi lấy danh sách quốc gia" });
  }
};
