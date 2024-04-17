import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('users', async (table) => {
    table.uuid('id')
    table.string('name').notNullable()
    table.string('email').notNullable()
    table.uuid('sessionId').index()
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('users')
}
