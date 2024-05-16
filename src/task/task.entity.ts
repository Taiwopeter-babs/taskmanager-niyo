import { Entity, Column, ManyToOne } from 'typeorm';
import BaseEntity from '../utils/base.entity';
import User from '../user/user.entity';

export enum TaskStatus {
  COMPLETED = 'completed',
  PENDING = 'pending',
}

@Entity('tasks')
export default class Task extends BaseEntity {
  @Column({
    type: 'varchar',
    length: 60,
    nullable: false,
  })
  public title: string;

  @Column({
    type: 'varchar',
    length: 256,
    nullable: false,
  })
  public description: string;

  @Column({
    type: 'enum',
    enum: TaskStatus,
    default: TaskStatus.PENDING,
  })
  public isCompleted: TaskStatus;

  @Column({
    type: 'int',
    nullable: false,
  })
  public userId: number;

  @ManyToOne(() => User, (user: User) => user.tasks)
  public user: User;
}
