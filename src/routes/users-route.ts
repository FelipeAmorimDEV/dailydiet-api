import { FastifyInstance } from 'fastify'
import { knex } from '../database'
import { z } from 'zod'

async function usersRoute(app: FastifyInstance) {
  app.post('/', async (request, replay) => {
    const userRequestBodySchema = z.object({
      name: z.string(),
      email: z.string(),
    })


    let sessionId = request.cookies.sessionID
    if (!sessionId) {
      sessionId = crypto.randomUUID()

      replay.setCookie('sessionID', sessionId, {
        path: '/',
        maxAge: 60 * 60 * 7, // 7 days
      })
    }

    const { name, email } = userRequestBodySchema.parse(request.body)
    const isExistentEmail = await knex('users').where('email', email)
    if (isExistentEmail.length > 0) {
      return replay.status(409).send({ error: 'email already exists' })
    }

    await knex('users').insert({
      id: crypto.randomUUID(),
      name,
      email,
      sessionId,
    })

    return replay.status(201).send()
  })
}

export { usersRoute }
