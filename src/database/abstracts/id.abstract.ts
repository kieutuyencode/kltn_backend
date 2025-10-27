import { PrimaryGeneratedColumn } from 'typeorm';
import { IId } from '../interfaces';

export abstract class Id implements IId {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;
}
