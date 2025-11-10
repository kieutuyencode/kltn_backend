export abstract class MailTransportOptions {
  abstract host: string;
  abstract port: number;
  abstract auth: {
    user: string;
    pass: string;
  };
  abstract secure: boolean;
}
