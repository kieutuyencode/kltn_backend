import { Column, ColumnOptions } from 'typeorm';
import Decimal from 'decimal.js';
import { applyDecorators } from '@nestjs/common';
import { Transform } from 'class-transformer';

// Định nghĩa các hằng số dùng chung
const DECIMAL_PRECISION = 38; // Tổng số chữ số
const DECIMAL_SCALE = 18; // Số chữ số thập phân
const DECIMAL_NEG_EXPONENT = DECIMAL_SCALE * -1; // -18, để xử lý số nhỏ đến 1e-18
const DECIMAL_POS_EXPONENT = DECIMAL_PRECISION; // 38, để xử lý số lớn đến 1e38

// Cấu hình Decimal.js
Decimal.set({
  precision: DECIMAL_PRECISION, // Đủ để xử lý 38 chữ số tổng cộng
  rounding: Decimal.ROUND_DOWN, // Làm tròn xuống để tránh sai lệch trong tài chính
  toExpNeg: DECIMAL_NEG_EXPONENT, // Không chuyển sang dạng khoa học cho số nhỏ hơn 0.000000000000000001
  toExpPos: DECIMAL_POS_EXPONENT, // Không chuyển sang dạng khoa học cho số lớn hơn 10^38
});

// Decorator tùy chỉnh cho cột DECIMAL
export const DecimalColumn = (options: ColumnOptions = {}) =>
  applyDecorators(
    Column({
      ...options,
      type: 'decimal',
      precision: DECIMAL_PRECISION, // Tổng số chữ số
      scale: DECIMAL_SCALE, // Số chữ số thập phân
      transformer: {
        to: (value: Decimal) => new Decimal(value || 0).toString(), // Chuyển Decimal sang chuỗi khi lưu
        from: (value: string) => new Decimal(value || 0), // Chuyển chuỗi từ DB sang Decimal
      },
    }),
    Transform(({ value }) => value && value.toString(), { toPlainOnly: true }),
  );

export const BigIntColumn = (options: ColumnOptions = {}) =>
  applyDecorators(
    Column({
      ...options,
      type: 'bigint',
      transformer: {
        to: (value: Decimal) => new Decimal(value || 0).toString(),
        from: (value: string) => new Decimal(value || 0),
      },
    }),
    Transform(({ value }) => value && value.toString(), { toPlainOnly: true }),
  );
