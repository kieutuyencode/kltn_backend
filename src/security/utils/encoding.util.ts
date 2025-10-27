export const encode = (value: any) => {
  return Buffer.from(
    typeof value === 'object' ? JSON.stringify(value) : value,
  ).toString('base64');
};
export const decode = (value: string) => {
  return Buffer.from(value, 'base64').toString();
};
