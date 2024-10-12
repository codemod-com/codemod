it('should not be changed when disabled', async () => {
  const { root, input, increment, decrement } = setup({
    defaultValue: 0,
    disabled: true,
  });

  expect(root.getAttribute('data-disabled')).toBe('');
  expect(input.getAttribute('data-disabled')).toBe('');

  await fireEvent.keyDown(input, { key: kbd.ARROW_UP });
  expect(input.value).toBe('0');
  await fireEvent.keyDown(input, { key: kbd.ARROW_DOWN });
  expect(input.value).toBe('0');
  await userEvent.click(increment);
  expect(input.value).toBe('0');
  await userEvent.click(decrement);
  expect(input.value).toBe('0');
});