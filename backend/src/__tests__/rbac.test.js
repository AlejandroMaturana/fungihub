import { getRoleLevel, requireRole, requireMinRole } from '../middlewares/rbac.js';

describe('RBAC', () => {
  it('getRoleLevel returns correct levels', () => {
    expect(getRoleLevel('SUPER_ADMIN')).toBe(100);
    expect(getRoleLevel('ADMIN')).toBe(80);
    expect(getRoleLevel('OPERATOR')).toBe(50);
    expect(getRoleLevel('VIEWER')).toBe(10);
    expect(getRoleLevel('UNKNOWN')).toBe(0);
  });
});
