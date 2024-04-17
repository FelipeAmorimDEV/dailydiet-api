import { Knex, knex as knexSetup } from 'knex'

const config: Knex.Config = {
  client: 'sqlite3',
  connection: {
    filename: './db/app.db',
  },
  useNullAsDefault: true,
  migrations: {
    extension: 'ts',
    directory: './db/',
  },
}

const knex = knexSetup(config)

export { knex, config }
