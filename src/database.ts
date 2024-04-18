import { Knex, knex as knexSetup } from 'knex'
import { env } from './env'

const config: Knex.Config = {
  client: env.DATABASE_CLIENT,
  connection: {
    filename: env.DATABASE_URL,
  },
  useNullAsDefault: true,
  migrations: {
    extension: 'ts',
    directory: './db/',
  },
}

const knex = knexSetup(config)

export { knex, config }
