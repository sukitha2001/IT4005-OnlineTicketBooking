const User = require('../../../src/models/User');

describe('User Model (OOP Encapsulation)', () => {
  it('should initialize with correct fields', () => {
    const user = new User({ user_id: 1, name: 'Alice', email: 'alice@test.com', role: 'CUSTOMER', status: 'ACTIVE' });
    expect(user.id).toBe(1);
    expect(user.name).toBe('Alice');
    expect(user.isActive).toBe(true);
  });

  it('toJSON should exclude password_hash', () => {
    const user = new User({ user_id: 1, password_hash: 'secret' });
    const json = user.toJSON();
    expect(json.passwordHash).toBeUndefined();
    expect(json.id).toBe(1);
  });

  it('updateProfile should update allowed fields', () => {
    const user = new User({ user_id: 1, name: 'Alice', email: 'alice@test.com' });
    user.updateProfile('Alice Smith', 'new@test.com');
    expect(user.name).toBe('Alice Smith');
    expect(user.email).toBe('new@test.com');
  });

  it('disable and enable should transition status correctly', () => {
    const user = new User({ user_id: 1, status: 'ACTIVE' });
    user.disable();
    expect(user.isActive).toBe(false);
    expect(user.status).toBe('DISABLED');
    
    user.enable();
    expect(user.isActive).toBe(true);
    expect(user.status).toBe('ACTIVE');
  });
});
