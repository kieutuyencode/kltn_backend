export type TMailOptions = {
  template: string;
  context: Record<string, unknown>;
  from?: string;
  to: string;
  subject: string;
};
