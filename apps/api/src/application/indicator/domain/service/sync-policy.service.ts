import { Injectable } from '@nestjs/common';

@Injectable()
export class SyncPolicyService {
  isDue(lastSyncedAt: Date | null, ttlMinutes: number): boolean {
    if (!lastSyncedAt) {
      return true;
    }

    const elapsedMinutes = (Date.now() - lastSyncedAt.getTime()) / 60_000;
    return elapsedMinutes >= ttlMinutes;
  }
}
