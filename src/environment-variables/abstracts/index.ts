export abstract class EnvironmentVariables {
  abstract PORT: number;
  abstract DB_USERNAME: string;
  abstract DB_PASSWORD: string;
  abstract DB_NAME: string;
  abstract DB_HOST: string;
  abstract DB_PORT: number;
  abstract LOGGER_SERVER_URL: string;
  abstract LOGGER_API_KEY: string;
  abstract JWT_SECRET: string;
  abstract JWT_EXPIRES_IN: string;
  abstract MAIL_HOST: string;
  abstract MAIL_PORT: number;
  abstract MAIL_USER: string;
  abstract MAIL_PASSWORD: string;
  abstract MAIL_FROM_NAME: string;
  abstract ETHERSCAN_V2_API_URL: string;
  abstract ETHERSCAN_V2_API_KEY: string;
  abstract EVENT_ADMIN_PRIVATE_KEY: string;
  abstract TOBESCAN_API_URL: string;
}
