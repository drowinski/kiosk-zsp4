async function createSuperuser() {
  const { userService } = await import('@/features/users/.server/users.service');

  await userService.registerUser('superuser', 'superuser');

  process.exit(0);
}

await createSuperuser();

export {};
