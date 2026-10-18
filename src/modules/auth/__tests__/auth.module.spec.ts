describe('AuthModule bootstrap variations', () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...originalEnv };
    jest.resetModules();
  });

  it('imports AuthModule with default env values', async () => {
    delete process.env.JWT_SECRET;
    delete process.env.JWT_EXPIRES_IN;
    jest.resetModules();
    const mod = await import('../auth.module');
    expect(mod.AuthModule).toBeDefined();
  });

  it('imports AuthModule with custom env values', async () => {
    process.env.JWT_SECRET = 'custom-secret';
    process.env.JWT_EXPIRES_IN = '2h';
    jest.resetModules();
    const mod = await import('../auth.module');
    expect(mod.AuthModule).toBeDefined();
  });

  it('imports AuthModule with secret set but default expires', async () => {
    process.env.JWT_SECRET = 'only-secret';
    delete process.env.JWT_EXPIRES_IN;
    jest.resetModules();
    const mod = await import('../auth.module');
    expect(mod.AuthModule).toBeDefined();
  });

  it('imports AuthModule with expires set but default secret', async () => {
    delete process.env.JWT_SECRET;
    process.env.JWT_EXPIRES_IN = '3h';
    jest.resetModules();
    const mod = await import('../auth.module');
    expect(mod.AuthModule).toBeDefined();
  });
});
