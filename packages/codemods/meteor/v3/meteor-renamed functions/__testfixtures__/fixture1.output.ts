async function someFunction(userId, newPassword) {
  await Accounts.setPasswordAsync(userId, newPassword);
}