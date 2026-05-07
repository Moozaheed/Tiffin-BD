import { Injectable } from '@nestjs/common';
import { v4 as uuid } from 'uuid';
import { DevicesRepository, BranchesRepository, AuditLogsRepository } from '../../database/repositories';
import { Devices } from '../../database/entities';
import { LoggerService } from '../../common/logger/logger.service';
import { NotFoundException, ConflictException } from '../../common/exceptions';
import { AuditAction } from '../../common/constants';
import { RegisterDeviceDto, UpdateFcmTokenDto } from './dto';

@Injectable()
export class DevicesService {
  constructor(
    private readonly devicesRepository: DevicesRepository,
    private readonly branchesRepository: BranchesRepository,
    private readonly auditLogsRepository: AuditLogsRepository,
    private readonly logger: LoggerService,
  ) {}

  async register(dto: RegisterDeviceDto, userId: string): Promise<Devices> {
    const branch = await this.branchesRepository.findOne({ where: { id: dto.branchId } });
    if (!branch) {
      throw new NotFoundException('Branch', dto.branchId);
    }

    const code = `DEV-${uuid().slice(0, 8).toUpperCase()}`;

    const device = this.devicesRepository.create({
      code,
      name: dto.name,
      deviceType: dto.deviceType,
      branchId: dto.branchId,
      assignedUserId: userId,
      serialNumber: dto.serialNumber,
      imei: dto.imei,
      fcmToken: dto.fcmToken,
      status: 'active',
      lastActivityAt: new Date(),
    });

    const saved = await this.devicesRepository.save(device);

    await this.auditLogsRepository.save({
      userId,
      branchId: dto.branchId,
      action: AuditAction.CREATE,
      entityType: 'Device',
      entityId: saved.id,
      newValues: { code, name: dto.name, deviceType: dto.deviceType },
    });

    this.logger.info(`Device registered: ${code}`, 'DevicesService', { deviceId: saved.id, userId });
    return saved;
  }

  async updateFcmToken(deviceId: string, dto: UpdateFcmTokenDto, userId: string): Promise<Devices> {
    const device = await this.devicesRepository.findOne({ where: { id: deviceId } });
    if (!device) {
      throw new NotFoundException('Device', deviceId);
    }

    device.fcmToken = dto.fcmToken;
    device.lastActivityAt = new Date();
    const saved = await this.devicesRepository.save(device);

    this.logger.info(`FCM token updated for device: ${device.code}`, 'DevicesService', { deviceId });
    return saved;
  }

  async findBranchDevices(branchId: string): Promise<Devices[]> {
    return this.devicesRepository.findActiveBranchDevices(branchId);
  }

  async findUserDevices(userId: string): Promise<Devices[]> {
    return this.devicesRepository.find({
      where: { assignedUserId: userId, isActive: true },
      relations: ['branch'],
    });
  }

  async deactivate(deviceId: string, userId: string): Promise<void> {
    const device = await this.devicesRepository.findOne({ where: { id: deviceId } });
    if (!device) {
      throw new NotFoundException('Device', deviceId);
    }

    device.status = 'inactive';
    device.isActive = false;
    await this.devicesRepository.save(device);

    await this.auditLogsRepository.save({
      userId,
      branchId: device.branchId,
      action: AuditAction.DELETE,
      entityType: 'Device',
      entityId: deviceId,
      oldValues: { status: 'active' },
      newValues: { status: 'inactive' },
    });

    this.logger.info(`Device deactivated: ${device.code}`, 'DevicesService', { deviceId });
  }
}
