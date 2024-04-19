import { Knex, knex as knexSetup } from 'knex'
import { env } from './env'

const config: Knex.Config = {
  client: env.DATABASE_CLIENT,
  connection: env.DATABASE_CLIENT === 'sqlite3' ?
    {
      filename: env.DATABASE_URL
    }
    : env.DATABASE_URL,

  useNullAsDefault: true,
  migrations: {
    extension: 'ts',
    directory: './db/',
  },
}

const knex = knexSetup(config)

export { knex, config }
