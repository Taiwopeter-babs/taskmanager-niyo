import { MigrationInterface, QueryRunner } from "typeorm";

export class RecreateTwoTables1715949298749 implements MigrationInterface {
    name = 'RecreateTwoTables1715949298749'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "password" character varying(128) NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "password"`);
    }

}
