// src/seed/sampleLocations.js

export const provinces = [
  { id: 1, name: "Thành phố Hồ Chí Minh" },
  { id: 2, name: "Tỉnh Bình Dương" },
  { id: 3, name: "Tỉnh Đồng Nai" },
  { id: 4, name: "Tỉnh Long An" },
  { id: 5, name: "Tỉnh Tiền Giang" },
];

export const communes = [
  { id: 1, provinceId: 1, name: "Quận 1" },
  { id: 2, provinceId: 1, name: "Quận 4" },
  { id: 3, provinceId: 1, name: "Quận 5" },
  { id: 4, provinceId: 1, name: "Huyện Bình Chánh" },
  { id: 5, provinceId: 1, name: "Quận 13" },
  { id: 6, provinceId: 1, name: "Quận 9" },
  { id: 7, provinceId: 2, name: "Thành phố Thủ Dầu Một" },
  { id: 8, provinceId: 2, name: "Huyện Bến Cát" },
  { id: 9, provinceId: 3, name: "Thành phố Biên Hòa" },
  { id: 10, provinceId: 3, name: "Huyện Trảng Bom" },
];

export const organizations = [
  { id: 1, name: "Tổ chức xanh Việt Nam", type: "NGO" },
  { id: 2, name: "Hội từ thiện Hoa Hướng Dương", type: "NGO" },
  { id: 3, name: "Trung tâm giáo dục cộng đồng", type: "SCHOOL" },
];

// Sample participation records linking ORG users to organizations
// Assuming ORG user IDs are the volunteers with ORG role (you'll need to check your actual data)
export const participations = [
  { userId: 2, organizationId: 1, startDate: new Date("2025-01-01") }, // Link user 2 to org 1
  { userId: 3, organizationId: 2, startDate: new Date("2025-01-01") }, // Link user 3 to org 2
  { userId: 4, organizationId: 3, startDate: new Date("2025-01-01") }, // Link user 4 to org 3
];
