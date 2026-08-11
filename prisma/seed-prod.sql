-- Production seed for Coolify Postgres (mirrors prisma/seed.ts)
-- Password for ALL users: Admin@12345
-- Safe to re-run: every insert is ON CONFLICT DO NOTHING or guarded.

BEGIN;

-- ============================ PERMISSIONS ============================
INSERT INTO permissions (id, code, module, description) VALUES
  (gen_random_uuid(), 'clinics.manage',        'clinics',       'manage clinics'),
  (gen_random_uuid(), 'settings.manage',       'settings',      'manage settings'),
  (gen_random_uuid(), 'users.manage',          'users',         'manage users'),
  (gen_random_uuid(), 'patients.read',         'patients',      'read patients'),
  (gen_random_uuid(), 'patients.create',       'patients',      'create patients'),
  (gen_random_uuid(), 'patients.update',       'patients',      'update patients'),
  (gen_random_uuid(), 'patients.delete',       'patients',      'delete patients'),
  (gen_random_uuid(), 'appointments.read',     'appointments',  'read appointments'),
  (gen_random_uuid(), 'appointments.create',   'appointments',  'create appointments'),
  (gen_random_uuid(), 'appointments.update',   'appointments',  'update appointments'),
  (gen_random_uuid(), 'appointments.cancel',   'appointments',  'cancel appointments'),
  (gen_random_uuid(), 'visits.read',           'visits',        'read visits'),
  (gen_random_uuid(), 'visits.create',         'visits',        'create visits'),
  (gen_random_uuid(), 'visits.assess',         'visits',        'assess visits'),
  (gen_random_uuid(), 'visits.consult',        'visits',        'consult visits'),
  (gen_random_uuid(), 'visits.complete',       'visits',        'complete visits'),
  (gen_random_uuid(), 'visits.cancel',         'visits',        'cancel visits'),
  (gen_random_uuid(), 'queue.read',            'queue',         'read queue'),
  (gen_random_uuid(), 'queue.manage',          'queue',         'manage queue'),
  (gen_random_uuid(), 'medicines.read',        'medicines',     'read medicines'),
  (gen_random_uuid(), 'medicines.manage',      'medicines',     'manage medicines'),
  (gen_random_uuid(), 'prescriptions.read',    'prescriptions', 'read prescriptions'),
  (gen_random_uuid(), 'prescriptions.write',   'prescriptions', 'write prescriptions'),
  (gen_random_uuid(), 'prescriptions.sign',    'prescriptions', 'sign prescriptions'),
  (gen_random_uuid(), 'billing.read',          'billing',       'read billing'),
  (gen_random_uuid(), 'billing.collect',       'billing',       'collect billing'),
  (gen_random_uuid(), 'billing.refund',        'billing',       'refund billing'),
  (gen_random_uuid(), 'followups.read',        'followups',     'read followups'),
  (gen_random_uuid(), 'followups.manage',      'followups',     'manage followups'),
  (gen_random_uuid(), 'files.read',            'files',         'read files'),
  (gen_random_uuid(), 'files.upload',          'files',         'upload files'),
  (gen_random_uuid(), 'notifications.read',    'notifications', 'read notifications'),
  (gen_random_uuid(), 'notifications.manage',  'notifications', 'manage notifications'),
  (gen_random_uuid(), 'analytics.read',        'analytics',     'read analytics'),
  (gen_random_uuid(), 'audit.read',            'audit',         'read audit')
ON CONFLICT (code) DO NOTHING;

-- ============================== ROLES ================================
INSERT INTO roles (id, "clinicId", name, code, "isSystem", "createdAt", "updatedAt")
SELECT v.id::uuid, NULL, v.name, v.code, true, now(), now()
FROM (VALUES
  ('a1000000-0000-4000-8000-000000000001', 'Super Admin',  'SUPER_ADMIN'),
  ('a1000000-0000-4000-8000-000000000002', 'Clinic Admin', 'CLINIC_ADMIN'),
  ('a1000000-0000-4000-8000-000000000003', 'Doctor',       'DOCTOR'),
  ('a1000000-0000-4000-8000-000000000004', 'Receptionist', 'RECEPTIONIST'),
  ('a1000000-0000-4000-8000-000000000005', 'Assistant',    'ASSISTANT'),
  ('a1000000-0000-4000-8000-000000000006', 'Cashier',      'CASHIER')
) AS v(id, name, code)
WHERE NOT EXISTS (SELECT 1 FROM roles r WHERE r.code = v.code AND r."clinicId" IS NULL);

-- ========================= ROLE PERMISSIONS ==========================
-- SUPER_ADMIN: everything
INSERT INTO role_permissions ("roleId", "permissionId")
SELECT r.id, p.id FROM roles r CROSS JOIN permissions p
WHERE r.code = 'SUPER_ADMIN' AND r."clinicId" IS NULL
ON CONFLICT DO NOTHING;

-- CLINIC_ADMIN: everything except clinics.*
INSERT INTO role_permissions ("roleId", "permissionId")
SELECT r.id, p.id FROM roles r CROSS JOIN permissions p
WHERE r.code = 'CLINIC_ADMIN' AND r."clinicId" IS NULL AND p.module <> 'clinics'
ON CONFLICT DO NOTHING;

-- DOCTOR
INSERT INTO role_permissions ("roleId", "permissionId")
SELECT r.id, p.id FROM roles r JOIN permissions p ON p.code IN (
  'patients.read','patients.update','appointments.read','appointments.create',
  'visits.read','visits.assess','visits.consult',
  'visits.complete','queue.read','queue.manage','medicines.read','medicines.manage',
  'prescriptions.read','prescriptions.write','prescriptions.sign','followups.read',
  'followups.manage','files.read','files.upload','analytics.read')
WHERE r.code = 'DOCTOR' AND r."clinicId" IS NULL
ON CONFLICT DO NOTHING;

-- RECEPTIONIST
INSERT INTO role_permissions ("roleId", "permissionId")
SELECT r.id, p.id FROM roles r JOIN permissions p ON p.code IN (
  'patients.read','patients.create','patients.update','appointments.read','appointments.create',
  'appointments.update','appointments.cancel','visits.read','visits.create','visits.cancel',
  'visits.complete','queue.read','queue.manage','billing.read','billing.collect','billing.refund',
  'followups.read','followups.manage','files.read','files.upload','notifications.read',
  'analytics.read','prescriptions.read')
WHERE r.code = 'RECEPTIONIST' AND r."clinicId" IS NULL
ON CONFLICT DO NOTHING;

-- ASSISTANT (patients.update = profile completion before vitals)
INSERT INTO role_permissions ("roleId", "permissionId")
SELECT r.id, p.id FROM roles r JOIN permissions p ON p.code IN (
  'patients.read','patients.update','visits.read','visits.assess','queue.read',
  'queue.manage','medicines.read','files.read','files.upload','prescriptions.read')
WHERE r.code = 'ASSISTANT' AND r."clinicId" IS NULL
ON CONFLICT DO NOTHING;

-- CASHIER
INSERT INTO role_permissions ("roleId", "permissionId")
SELECT r.id, p.id FROM roles r JOIN permissions p ON p.code IN (
  'patients.read','visits.read','billing.read','billing.collect','billing.refund','analytics.read')
WHERE r.code = 'CASHIER' AND r."clinicId" IS NULL
ON CONFLICT DO NOTHING;

-- ============================== CLINIC ===============================
INSERT INTO clinics (id, name, code, phone, email, address, city, country, "createdAt", "updatedAt")
VALUES ('c1000000-0000-4000-8000-000000000001', 'City Care Clinic', 'CCC', '+92-300-0000000',
        'info@citycare.clinic', 'Main Boulevard', 'Lahore', 'Pakistan', now(), now())
ON CONFLICT (code) DO NOTHING;

-- ============================== USERS ================================
-- passwordHash = bcrypt('Admin@12345', 10)
INSERT INTO users (id, "clinicId", "roleId", "fullName", email, "passwordHash", "createdAt", "updatedAt")
SELECT v.id::uuid,
       CASE WHEN v.role_code = 'SUPER_ADMIN' THEN NULL ELSE c.id END,
       r.id, v.full_name, v.email,
       '$2b$10$n7j.vpXFAPpltKjZAHLx8ui0/fEvG1KbeWFpKySBsQF3u9ftlL5Pm',
       now(), now()
FROM (VALUES
  ('b1000000-0000-4000-8000-000000000001', 'super@clinic.local',         'Super Admin',        'SUPER_ADMIN'),
  ('b1000000-0000-4000-8000-000000000002', 'admin@citycare.clinic',      'Clinic Admin',       'CLINIC_ADMIN'),
  ('b1000000-0000-4000-8000-000000000003', 'dr.ahmed@citycare.clinic',   'Dr. Ahmed Khan',     'DOCTOR'),
  ('b1000000-0000-4000-8000-000000000004', 'dr.sara@citycare.clinic',    'Dr. Sara Malik',     'DOCTOR'),
  ('b1000000-0000-4000-8000-000000000005', 'reception@citycare.clinic',  'Front Desk',         'RECEPTIONIST'),
  ('b1000000-0000-4000-8000-000000000006', 'assistant@citycare.clinic',  'Clinical Assistant', 'ASSISTANT'),
  ('b1000000-0000-4000-8000-000000000007', 'cashier@citycare.clinic',    'Cashier',            'CASHIER')
) AS v(id, email, full_name, role_code)
JOIN roles r ON r.code = v.role_code AND r."clinicId" IS NULL
LEFT JOIN clinics c ON c.code = 'CCC'
ON CONFLICT (email) DO NOTHING;

-- ========================= DOCTOR PROFILES ===========================
INSERT INTO doctor_profiles (id, "userId", specialization, qualifications, "consultationFee", "followUpFee", "avgConsultMinutes")
SELECT gen_random_uuid(), u.id, 'General Physician', 'MBBS', 1500, 800, 10
FROM users u
WHERE u.email IN ('dr.ahmed@citycare.clinic', 'dr.sara@citycare.clinic')
  AND NOT EXISTS (SELECT 1 FROM doctor_profiles dp WHERE dp."userId" = u.id);

-- ========================== MEDICINE MASTER ==========================
INSERT INTO medicines (id, "clinicId", name, "genericName", form, strength, "createdAt", "updatedAt")
SELECT gen_random_uuid(), NULL, v.name, v.generic, v.form, v.strength, now(), now()
FROM (VALUES
  ('Panadol', 'Paracetamol', 'Tablet', '500mg'),
  ('Panadol Extra', 'Paracetamol + Caffeine', 'Tablet', '500mg/65mg'),
  ('Brufen', 'Ibuprofen', 'Tablet', '400mg'),
  ('Augmentin', 'Amoxicillin + Clavulanic Acid', 'Tablet', '625mg'),
  ('Amoxil', 'Amoxicillin', 'Capsule', '500mg'),
  ('Azomax', 'Azithromycin', 'Tablet', '500mg'),
  ('Flagyl', 'Metronidazole', 'Tablet', '400mg'),
  ('Ciproxin', 'Ciprofloxacin', 'Tablet', '500mg'),
  ('Risek', 'Omeprazole', 'Capsule', '40mg'),
  ('Nexum', 'Esomeprazole', 'Tablet', '40mg'),
  ('Ventolin', 'Salbutamol', 'Inhaler', '100mcg'),
  ('Ventolin Syrup', 'Salbutamol', 'Syrup', '2mg/5ml'),
  ('Zyrtec', 'Cetirizine', 'Tablet', '10mg'),
  ('Telfast', 'Fexofenadine', 'Tablet', '120mg'),
  ('Glucophage', 'Metformin', 'Tablet', '500mg'),
  ('Amaryl', 'Glimepiride', 'Tablet', '2mg'),
  ('Norvasc', 'Amlodipine', 'Tablet', '5mg'),
  ('Concor', 'Bisoprolol', 'Tablet', '5mg'),
  ('Lipiget', 'Atorvastatin', 'Tablet', '20mg'),
  ('Deltacortril', 'Prednisolone', 'Tablet', '5mg'),
  ('Motilium', 'Domperidone', 'Tablet', '10mg'),
  ('Gravinate', 'Dimenhydrinate', 'Tablet', '50mg'),
  ('Ponstan', 'Mefenamic Acid', 'Tablet', '500mg'),
  ('Calpol Syrup', 'Paracetamol', 'Syrup', '120mg/5ml'),
  ('ORS Sachet', 'Oral Rehydration Salts', 'Sachet', '-')
) AS v(name, generic, form, strength)
WHERE NOT EXISTS (SELECT 1 FROM medicines m WHERE m."clinicId" IS NULL AND m.name = v.name);

COMMIT;

-- Verify:
-- SELECT count(*) FROM permissions;      -- 35
-- SELECT count(*) FROM roles;            -- 6
-- SELECT count(*) FROM users;            -- 7
-- SELECT count(*) FROM medicines;        -- 25
