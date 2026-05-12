import { createConnection } from 'typeorm';
import {
  Users,
  Branches,
  Roles,
  UserBranchRoles,
  Devices,
  SourceConnectors,
  RawOrders,
  NormalizedOrders,
  NormalizationErrors,
  AuditLogs,
} from '../database/entities';
import * as bcrypt from 'bcrypt';

async function seed() {
  const connection = await createConnection({
    type: 'mysql',
    host: process.env.DB_HOST || 'mysql',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    username: process.env.DB_USERNAME || 'tiffin_user',
    password: process.env.DB_PASSWORD || 'tiffin_pass_123',
    database: process.env.DB_DATABASE || 'tiffin_db',
    entities: [Users, Branches, Roles, UserBranchRoles, Devices, SourceConnectors, RawOrders, NormalizedOrders, NormalizationErrors, AuditLogs],
    synchronize: false,
    logging: false,
  });

  try {
    const superAdminEmail = process.env.SUPER_ADMIN_EMAIL || 'admin@tiffinbd.local';
    const superAdminUsername = process.env.SUPER_ADMIN_USERNAME || 'admin';
    const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD || 'SecureAdminPass123!';
    const superAdminFullName = process.env.SUPER_ADMIN_FULLNAME || 'Super Administrator';

    const usersRepository = connection.getRepository(Users);
    const branchesRepository = connection.getRepository(Branches);

    // Check if super admin already exists
    const existingAdmin = await usersRepository.findOne({
      where: [{ email: superAdminEmail }, { username: superAdminUsername }],
    });

    if (existingAdmin) {
      console.log('✓ Super admin already exists. Skipping creation.');
      await connection.close();
      return;
    }

    // Get or create a default branch
    let primaryBranch = await branchesRepository.findOne({
      where: { name: 'Main Branch' },
    });

    if (!primaryBranch) {
      primaryBranch = branchesRepository.create({
        name: 'Main Branch',
        code: 'MAIN',
        address: 'Headquarters',
        phone: '+8801700000000',
        timezone: 'Asia/Dhaka',
        status: 'ACTIVE',
        isActive: true,
      });
      await branchesRepository.save(primaryBranch);
      console.log('✓ Default branch created');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(superAdminPassword, 12);

    // Create super admin user
    const superAdmin = usersRepository.create({
      email: superAdminEmail,
      username: superAdminUsername,
      fullName: superAdminFullName,
      passwordHash,
      primaryBranch,
      primaryBranchId: primaryBranch.id,
      isSuperAdmin: true,
      isActive: true,
      authProvider: 'local',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await usersRepository.save(superAdmin);

    console.log('✓ Super admin created successfully!');
    console.log(`  Email: ${superAdminEmail}`);
    console.log(`  Username: ${superAdminUsername}`);
    console.log(`  Password: ${superAdminPassword}`);
    console.log(`  Full Name: ${superAdminFullName}`);
    console.log(`  ID: ${superAdmin.id}`);
    console.log('\n⚠️  IMPORTANT: Please change the password immediately after first login!');
  } catch (error) {
    console.error('Error creating super admin:', (error as any).message);
  } finally {
    await connection.close();
  }
}

seed();
