import { MigrationInterface, QueryRunner } from 'typeorm';

export class RecreateTables1715948856919 implements MigrationInterface {
  name = 'RecreateTables1715948856919';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ADD "password" character varying(128) NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "password"`);
  }
}
