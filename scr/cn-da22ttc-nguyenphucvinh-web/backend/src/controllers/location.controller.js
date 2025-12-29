import prisma from "../utils/prisma.js";

export async function getProvinces(req, res) {
  try {
    const provinces = await prisma.province.findMany({
      orderBy: { name: "asc" }
    });

    res.json(provinces);
  } catch (err) {
    console.error("getProvinces error:", err);
    res.status(500).json({ message: "Không thể tải danh sách tỉnh" });
  }
}

export async function getCommunesByProvince(req, res) {
  try {
    var provinceId = Number(req.params.id);

    const communes = await prisma.commune.findMany({
      where: { provinceId: provinceId },
      orderBy: { name: "asc" }
    });

    res.json(communes);
  } catch (err) {
    console.error("getCommunesByProvince error:", err);
    res.status(500).json({ message: "Không thể tải danh sách xã" });
  }
}
