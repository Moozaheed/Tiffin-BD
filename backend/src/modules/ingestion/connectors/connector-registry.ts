import { Injectable } from '@nestjs/common';
import { BaseConnector } from './interfaces';

@Injectable()
export class ConnectorRegistry {
  private connectors = new Map<string, BaseConnector>();

  register(sourceType: string, connector: BaseConnector): void {
    this.connectors.set(sourceType, connector);
  }

  getConnector(sourceType: string): BaseConnector | undefined {
    return this.connectors.get(sourceType);
  }

  getConnectorOrThrow(sourceType: string): BaseConnector {
    const connector = this.connectors.get(sourceType);
    if (!connector) {
      throw new Error(`Connector not registered for source type: ${sourceType}`);
    }
    return connector;
  }

  listConnectors(): string[] {
    return Array.from(this.connectors.keys());
  }

  isRegistered(sourceType: string): boolean {
    return this.connectors.has(sourceType);
  }
}
