import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { Repository } from 'typeorm';
import { Users, Branches } from '../database/entities';
import * as bcrypt from 'bcrypt';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const usersRepository = app.get('UsersRepository') as Repository<Users>;
  const branchesRepository = app.get('BranchesRepository') as Repository<Branches>;

  const superAdminEmail = process.env.SUPER_ADMIN_EMAIL || 'admin@tiffinbd.local';
  const superAdminUsername = process.env.SUPER_ADMIN_USERNAME || 'admin';
  const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD || 'SecureAdminPass123!';
  const superAdminFullName = process.env.SUPER_ADMIN_FULLNAME || 'Super Administrator';

  try {
    // Check if super admin already exists
    const existingAdmin = await usersRepository.findOne({
      where: [{ email: superAdminEmail }, { username: superAdminUsername }],
    });

    if (existingAdmin) {
      console.log('✓ Super admin already exists. Skipping creation.');
      await app.close();
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
    console.error('Error creating super admin:', error.message);
  } finally {
    await app.close();
  }
}

bootstrap();
