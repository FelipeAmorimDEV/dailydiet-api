import { FastifyInstance } from 'fastify'
import { knex } from '../database'

async function usersRoute(app: FastifyInstance) {
  app.post('/', async (request, replay) => {
    const userRequestBody = request.body

    await knex('users').insert({
      name: userRequestBody.name,
      email: userRequestBody.email,
    })

    return replay.status(201).send()
  })
}

export { usersRoute }
