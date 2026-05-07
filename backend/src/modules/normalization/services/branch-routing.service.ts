import { Injectable } from '@nestjs/common';
import { BranchesRepository } from '../../../database/repositories';
import { LoggerService } from '../../../common/logger/logger.service';
import { Branches } from '../../../database/entities';
import { IntermediateOrder } from '../../ingestion/connectors/interfaces';

export interface RoutingResult {
  branchId: string;
  strategy: 'explicit' | 'source_mapping' | 'default' | 'unassigned';
  confidence: number;
}

@Injectable()
export class BranchRoutingService {
  constructor(
    private readonly branchesRepository: BranchesRepository,
    private readonly logger: LoggerService,
  ) {}

  async determineBranch(
    intermediate: IntermediateOrder,
    rawOrderBranchId?: string,
  ): Promise<RoutingResult> {
    if (rawOrderBranchId && rawOrderBranchId !== 'unassigned') {
      const branch = await this.branchesRepository.findOne({
        where: { id: rawOrderBranchId, isActive: true },
      });
      if (branch) {
        return { branchId: branch.id, strategy: 'explicit', confidence: 1.0 };
      }
      this.logger.warn(
        `Explicit branch ${rawOrderBranchId} not found or inactive, falling back`,
        'BranchRoutingService',
      );
    }

    if (intermediate.branchId) {
      const branch = await this.branchesRepository.findOne({
        where: { id: intermediate.branchId, isActive: true },
      });
      if (branch) {
        return { branchId: branch.id, strategy: 'explicit', confidence: 1.0 };
      }
    }

    if (intermediate.metadata?.branchCode) {
      const branch = await this.branchesRepository.findByCode(intermediate.metadata.branchCode);
      if (branch && branch.isActive) {
        return { branchId: branch.id, strategy: 'source_mapping', confidence: 0.9 };
      }
    }

    const defaultBranch = await this.getDefaultBranch();
    if (defaultBranch) {
      return { branchId: defaultBranch.id, strategy: 'default', confidence: 0.5 };
    }

    return { branchId: 'unassigned', strategy: 'unassigned', confidence: 0 };
  }

  private async getDefaultBranch(): Promise<Branches | null> {
    const branches = await this.branchesRepository.findActiveBranches();
    return branches.length > 0 ? branches[0] : null;
  }
}
