/* eslint-disable no-console */
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// ----------------------------- RBAC ---------------------------------

const PERMISSIONS: Record<string, string[]> = {
  clinics: ['manage'],
  settings: ['manage'],
  users: ['manage'],
  patients: ['read', 'create', 'update', 'delete'],
  appointments: ['read', 'create', 'update', 'cancel'],
  visits: ['read', 'create', 'assess', 'consult', 'complete', 'cancel'],
  queue: ['read', 'manage'],
  medicines: ['read', 'manage'],
  prescriptions: ['read', 'write', 'sign'],
  billing: ['read', 'collect', 'refund'],
  followups: ['read', 'manage'],
  files: ['read', 'upload'],
  notifications: ['read', 'manage'],
  analytics: ['read'],
  audit: ['read'],
};

const ROLE_PERMISSIONS: Record<string, string[] | '*'> = {
  SUPER_ADMIN: '*',
  CLINIC_ADMIN: Object.entries(PERMISSIONS)
    .filter(([m]) => m !== 'clinics')
    .flatMap(([m, actions]) => actions.map((a) => `${m}.${a}`)),
  DOCTOR: [
    'patients.read',
    'patients.update',
    'appointments.read',
    'visits.read',
    'visits.consult',
    'visits.complete',
    'queue.read',
    'queue.manage',
    'medicines.read',
    'medicines.manage',
    'prescriptions.read',
    'prescriptions.write',
    'prescriptions.sign',
    'followups.read',
    'followups.manage',
    'files.read',
    'files.upload',
    'analytics.read',
  ],
  RECEPTIONIST: [
    'patients.read',
    'patients.create',
    'patients.update',
    'appointments.read',
    'appointments.create',
    'appointments.update',
    'appointments.cancel',
    'visits.read',
    'visits.create',
    'visits.cancel',
    'visits.complete',
    'queue.read',
    'queue.manage',
    'billing.read',
    'billing.collect',
    'billing.refund', // reception hi paisay leti hai — koi alag cashier nahi
    'followups.read',
    'followups.manage',
    'files.read',
    'files.upload',
    'notifications.read',
    'analytics.read',
    'prescriptions.read', // print Rx at the front desk
  ],
  ASSISTANT: [
    'patients.read',
    'patients.update', // profile completion (blood group, allergies…) before vitals
    'visits.read',
    'visits.assess',
    'queue.read',
    'queue.manage',
    'medicines.read',
    'files.read',
    'files.upload',
    'prescriptions.read', // print Rx at the assistant desk
  ],
  CASHIER: [
    'patients.read',
    'visits.read',
    'billing.read',
    'billing.collect',
    'billing.refund',
    'analytics.read',
  ],
};

const MEDICINES: Array<[string, string, string, string]> = [
  ['Panadol', 'Paracetamol', 'Tablet', '500mg'],
  ['Panadol Extra', 'Paracetamol + Caffeine', 'Tablet', '500mg/65mg'],
  ['Brufen', 'Ibuprofen', 'Tablet', '400mg'],
  ['Augmentin', 'Amoxicillin + Clavulanic Acid', 'Tablet', '625mg'],
  ['Amoxil', 'Amoxicillin', 'Capsule', '500mg'],
  ['Azomax', 'Azithromycin', 'Tablet', '500mg'],
  ['Flagyl', 'Metronidazole', 'Tablet', '400mg'],
  ['Ciproxin', 'Ciprofloxacin', 'Tablet', '500mg'],
  ['Risek', 'Omeprazole', 'Capsule', '40mg'],
  ['Nexum', 'Esomeprazole', 'Tablet', '40mg'],
  ['Ventolin', 'Salbutamol', 'Inhaler', '100mcg'],
  ['Ventolin Syrup', 'Salbutamol', 'Syrup', '2mg/5ml'],
  ['Zyrtec', 'Cetirizine', 'Tablet', '10mg'],
  ['Telfast', 'Fexofenadine', 'Tablet', '120mg'],
  ['Glucophage', 'Metformin', 'Tablet', '500mg'],
  ['Amaryl', 'Glimepiride', 'Tablet', '2mg'],
  ['Norvasc', 'Amlodipine', 'Tablet', '5mg'],
  ['Concor', 'Bisoprolol', 'Tablet', '5mg'],
  ['Lipiget', 'Atorvastatin', 'Tablet', '20mg'],
  ['Deltacortril', 'Prednisolone', 'Tablet', '5mg'],
  ['Motilium', 'Domperidone', 'Tablet', '10mg'],
  ['Gravinate', 'Dimenhydrinate', 'Tablet', '50mg'],
  ['Ponstan', 'Mefenamic Acid', 'Tablet', '500mg'],
  ['Calpol Syrup', 'Paracetamol', 'Syrup', '120mg/5ml'],
  ['ORS Sachet', 'Oral Rehydration Salts', 'Sachet', '—'],
];

async function main() {
  console.log('Seeding permissions…');
  const allPermissionCodes: string[] = [];
  for (const [module, actions] of Object.entries(PERMISSIONS)) {
    for (const action of actions) {
      const code = `${module}.${action}`;
      allPermissionCodes.push(code);
      await prisma.permission.upsert({
        where: { code },
        create: { code, module, description: `${action} ${module}` },
        update: {},
      });
    }
  }
  const allPermissions = await prisma.permission.findMany();
  const permissionByCode = new Map(allPermissions.map((p) => [p.code, p.id]));

  console.log('Seeding system roles…');
  const roleIdByCode = new Map<string, string>();
  for (const [code, perms] of Object.entries(ROLE_PERMISSIONS)) {
    const roleName = code
      .split('_')
      .map((w) => w[0] + w.slice(1).toLowerCase())
      .join(' ');
    const role =
      (await prisma.role.findFirst({ where: { code, clinicId: null } })) ??
      (await prisma.role.create({
        data: { code, name: roleName, isSystem: true },
      }));
    roleIdByCode.set(code, role.id);

    const codes = perms === '*' ? allPermissionCodes : perms;
    await prisma.rolePermission.deleteMany({ where: { roleId: role.id } });
    await prisma.rolePermission.createMany({
      data: codes.map((c) => ({
        roleId: role.id,
        permissionId: permissionByCode.get(c)!,
      })),
    });
  }

  console.log('Seeding super admin…');
  const password = await bcrypt.hash('Admin@12345', 10);
  await prisma.user.upsert({
    where: { email: 'super@clinic.local' },
    create: {
      email: 'super@clinic.local',
      fullName: 'Super Admin',
      passwordHash: password,
      roleId: roleIdByCode.get('SUPER_ADMIN')!,
    },
    update: {},
  });

  console.log('Seeding demo clinic…');
  let clinic = await prisma.clinic.findUnique({ where: { code: 'CCC' } });
  if (!clinic) {
    clinic = await prisma.clinic.create({
      data: {
        name: 'City Care Clinic',
        code: 'CCC',
        phone: '+92-300-0000000',
        email: 'info@citycare.clinic',
        address: 'Main Boulevard',
        city: 'Lahore',
        country: 'Pakistan',
      },
    });
  }

  const staff: Array<{
    email: string;
    fullName: string;
    role: string;
    doctor?: boolean;
  }> = [
    { email: 'admin@citycare.clinic', fullName: 'Clinic Admin', role: 'CLINIC_ADMIN' },
    { email: 'dr.ahmed@citycare.clinic', fullName: 'Dr. Ahmed Khan', role: 'DOCTOR', doctor: true },
    { email: 'dr.sara@citycare.clinic', fullName: 'Dr. Sara Malik', role: 'DOCTOR', doctor: true },
    { email: 'reception@citycare.clinic', fullName: 'Front Desk', role: 'RECEPTIONIST' },
    { email: 'assistant@citycare.clinic', fullName: 'Clinical Assistant', role: 'ASSISTANT' },
    { email: 'cashier@citycare.clinic', fullName: 'Cashier', role: 'CASHIER' },
  ];

  for (const s of staff) {
    await prisma.user.upsert({
      where: { email: s.email },
      create: {
        email: s.email,
        fullName: s.fullName,
        passwordHash: password,
        clinicId: clinic.id,
        roleId: roleIdByCode.get(s.role)!,
        ...(s.doctor
          ? {
              doctorProfile: {
                create: {
                  specialization: 'General Physician',
                  qualifications: 'MBBS',
                  consultationFee: 1500,
                  followUpFee: 800,
                  avgConsultMinutes: 10,
                },
              },
            }
          : {}),
      },
      update: {},
    });
  }

  console.log('Seeding medicine master…');
  const count = await prisma.medicine.count({ where: { clinicId: null } });
  if (count === 0) {
    await prisma.medicine.createMany({
      data: MEDICINES.map(([name, genericName, form, strength]) => ({
        name,
        genericName,
        form,
        strength,
      })),
    });
  }

  console.log('Seed complete.');
  console.log('Logins (password for all: Admin@12345):');
  console.log('  super@clinic.local        — Super Admin');
  for (const s of staff) console.log(`  ${s.email}  — ${s.role}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
