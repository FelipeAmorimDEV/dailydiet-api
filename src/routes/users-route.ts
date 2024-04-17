import { FastifyInstance } from 'fastify'
import { knex } from '../database'
import { z } from 'zod'

async function usersRoute(app: FastifyInstance) {
  app.post('/', async (request, replay) => {
    const userRequestBodySchema = z.object({
      name: z.string(),
      email: z.string(),
    })

    const { name, email } = userRequestBodySchema.parse(request.body)

    await knex('users').insert({
      name,
      email,
    })

    return replay.status(201).send()
  })

  app.get('/', async () => {
    const users = await knex('users').select()

    return { users }
  })
}

export { usersRoute }
