import bcrypt from "bcryptjs";

const DEFAULTS = {
  ADMIN_EMAIL: "admin@clinicos.com",
  ADMIN_PASSWORD: "Admin@1234",
  RECEPTIONIST_EMAIL: "receptionist@clinicos.com",
  RECEPTIONIST_PASSWORD: "Receptionist@1234",
  ACCOUNTANT_EMAIL: "accountant@clinicos.com",
  ACCOUNTANT_PASSWORD: "Accountant@1234",
  NURSE_EMAIL: "nurse@clinicos.com",
  NURSE_PASSWORD: "Nurse@1234",
} as const;

const DOCTORS = [
  { firstName: "James", lastName: "Wilson", username: "drwilson", email: "james.wilson@clinicos.com", phone: "9000000001", departmentCode: "CARD", specialtyCode: "cardiology", qualification: "MD Cardiology", experienceYears: 12, consultationFee: "1500", bio: "Interventional cardiologist specializing in heart disease diagnosis and treatment." },
  { firstName: "Sarah", lastName: "Chen", username: "drchen", email: "sarah.chen@clinicos.com", phone: "9000000002", departmentCode: "ORTHO", specialtyCode: "orthopedics", qualification: "MS Orthopedics", experienceYears: 10, consultationFee: "1200", bio: "Orthopedic surgeon focusing on joint replacement and sports injuries." },
  { firstName: "Michael", lastName: "Patel", username: "drpatel", email: "michael.patel@clinicos.com", phone: "9000000003", departmentCode: "PED", specialtyCode: "pediatrics", qualification: "MD Pediatrics", experienceYears: 8, consultationFee: "800", bio: "Pediatrician dedicated to children's health and developmental care." },
  { firstName: "Emily", lastName: "Rodriguez", username: "drrodriguez", email: "emily.rodriguez@clinicos.com", phone: "9000000004", departmentCode: "DERM", specialtyCode: "dermatology", qualification: "MD Dermatology", experienceYears: 9, consultationFee: "1000", bio: "Board-certified dermatologist treating skin, hair, and nail disorders." },
  { firstName: "David", lastName: "Kim", username: "drkim", email: "david.kim@clinicos.com", phone: "9000000005", departmentCode: "NEURO", specialtyCode: "neurology", qualification: "DM Neurology", experienceYears: 14, consultationFee: "1800", bio: "Neurologist specializing in stroke, epilepsy, and movement disorders." },
  { firstName: "Lisa", lastName: "Thompson", username: "drthompson", email: "lisa.thompson@clinicos.com", phone: "9000000006", departmentCode: "GYN", specialtyCode: "gynecology", qualification: "MD OB/GYN", experienceYears: 11, consultationFee: "1100", bio: "Obstetrician-gynecologist providing comprehensive women's health care." },
  { firstName: "Robert", lastName: "Martinez", username: "drmartinez", email: "robert.martinez@clinicos.com", phone: "9000000007", departmentCode: "OPHTH", specialtyCode: "ophthalmology", qualification: "MS Ophthalmology", experienceYears: 7, consultationFee: "900", bio: "Ophthalmologist offering medical and surgical eye care." },
  { firstName: "Amanda", lastName: "Foster", username: "drfoster", email: "amanda.foster@clinicos.com", phone: "9000000008", departmentCode: "ENT", specialtyCode: "ent", qualification: "MS ENT", experienceYears: 9, consultationFee: "850", bio: "ENT specialist treating ear, nose, and throat conditions." },
  { firstName: "John", lastName: "Mitchell", username: "drmitchell", email: "john.mitchell@clinicos.com", phone: "9000000009", departmentCode: "EMR", specialtyCode: "emergency", qualification: "MD Emergency Medicine", experienceYears: 13, consultationFee: "1600", bio: "Emergency medicine physician with trauma and critical care expertise." },
  { firstName: "Jennifer", lastName: "Park", username: "drpark", email: "jennifer.park@clinicos.com", phone: "9000000010", departmentCode: "GEN", specialtyCode: "general-surgery", qualification: "MS General Surgery", experienceYears: 15, consultationFee: "2000", bio: "General surgeon experienced in minimally invasive and laparoscopic procedures." },
];

const DOCTOR_PASSWORD = "Doctor@1234";

export async function getUsersData() {
  const doctorUsers = await Promise.all(
    DOCTORS.map(async (d) => ({
      firstName: d.firstName,
      lastName: d.lastName,
      username: d.username,
      email: d.email,
      phone: d.phone,
      passwordHash: await bcrypt.hash(DOCTOR_PASSWORD, 10),
      avatar: null,
      status: "active" as const,
      emailVerified: true,
      lastLoginAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      roleCode: "doctor" as const,
      doctorMeta: {
        departmentCode: d.departmentCode,
        specialtyCode: d.specialtyCode,
        qualification: d.qualification,
        experienceYears: d.experienceYears,
        consultationFee: d.consultationFee,
        bio: d.bio,
      },
    })),
  );

  return [
    {
      firstName: "Admin",
      lastName: "User",
      username: "admin",
      email: process.env.ADMIN_EMAIL ?? DEFAULTS.ADMIN_EMAIL,
      phone: "9999999999",
      passwordHash: await bcrypt.hash(process.env.ADMIN_PASSWORD ?? DEFAULTS.ADMIN_PASSWORD, 10),
      avatar: null,
      status: "active",
      emailVerified: true,
      lastLoginAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      roleCode: "admin",
    },
    ...doctorUsers,
    {
      firstName: "Receptionist",
      lastName: "User",
      username: "receptionist",
      email: process.env.RECEPTIONIST_EMAIL ?? DEFAULTS.RECEPTIONIST_EMAIL,
      phone: "9999999996",
      passwordHash: await bcrypt.hash(process.env.RECEPTIONIST_PASSWORD ?? DEFAULTS.RECEPTIONIST_PASSWORD, 10),
      avatar: null,
      status: "active",
      emailVerified: true,
      lastLoginAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      roleCode: "receptionist",
    },
    {
      firstName: "Accountant",
      lastName: "User",
      username: "accountant",
      email: process.env.ACCOUNTANT_EMAIL ?? DEFAULTS.ACCOUNTANT_EMAIL,
      phone: "9999999995",
      passwordHash: await bcrypt.hash(process.env.ACCOUNTANT_PASSWORD ?? DEFAULTS.ACCOUNTANT_PASSWORD, 10),
      avatar: null,
      status: "active",
      emailVerified: true,
      lastLoginAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      roleCode: "accountant",
    },
    {
      firstName: "Nurse",
      lastName: "User",
      username: "nurse",
      email: process.env.NURSE_EMAIL ?? DEFAULTS.NURSE_EMAIL,
      phone: "9999999994",
      passwordHash: await bcrypt.hash(process.env.NURSE_PASSWORD ?? DEFAULTS.NURSE_PASSWORD, 10),
      avatar: null,
      status: "active",
      emailVerified: true,
      lastLoginAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      roleCode: "nurse",
    },
  ];
}
