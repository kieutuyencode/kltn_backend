export type TMailOptions = {
  template: string;
  context: Record<string, unknown>;
  to: string;
  subject: string;
};
