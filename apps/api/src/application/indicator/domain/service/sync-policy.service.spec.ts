import { SyncPolicyService } from './sync-policy.service';

describe('SyncPolicyService', () => {
  let service: SyncPolicyService;

  beforeEach(() => {
    service = new SyncPolicyService();
  });

  it('should be due when the indicator was never synced', () => {
    expect(service.isDue(null, 60)).toBe(true);
  });

  it('should not be due when synced well within the TTL window', () => {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60_000);
    expect(service.isDue(fiveMinutesAgo, 60)).toBe(false);
  });

  it('should be due when synced longer ago than the TTL window', () => {
    const twoHoursAgo = new Date(Date.now() - 120 * 60_000);
    expect(service.isDue(twoHoursAgo, 60)).toBe(true);
  });

  it('should be due exactly at the TTL boundary', () => {
    const exactlyTtlAgo = new Date(Date.now() - 60 * 60_000);
    expect(service.isDue(exactlyTtlAgo, 60)).toBe(true);
  });
});
