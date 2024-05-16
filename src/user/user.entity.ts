import { Entity, Column, OneToMany, Index, BeforeInsert } from 'typeorm';
import BaseEntity from '../utils/base.entity';
import Task from '../task/task.entity';

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
}

@Entity('users')
export default class User extends BaseEntity {
  @Column({
    type: 'varchar',
    nullable: false,
  })
  public firstName: string;

  @Column({
    type: 'varchar',
    nullable: false,
  })
  public lastName: string;

  @Column({
    type: 'enum',
    enum: Gender,
    nullable: false,
  })
  public gender: Gender;

  @Index()
  @Column({
    type: 'varchar',
    length: 60,
    unique: true,
    nullable: false,
  })
  public email: string;

  @OneToMany(() => Task, (task) => task.user)
  public tasks: Task[];

  /**
   * Before insert event listeners.
   */
  @BeforeInsert()
  toLowerCase() {
    this.email = this.email.toLowerCase();
  }
}
