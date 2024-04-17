import { FastifyInstance } from 'fastify'
import { knex } from '../database'
import { z } from 'zod'
import { cookiesValidation } from '../middlewares/cookies-validation'

async function mealsRoute(app: FastifyInstance) {
  app.post(
    '/',
    {
      preHandler: [cookiesValidation],
    },
    async (request, reply) => {
      const meatsRequestBodySchema = z.object({
        name: z.string(),
        description: z.string(),
        date: z.string(),
        hour: z.string(),
        onDiet: z.enum(['yes', 'no']),
      })

      const { name, description, date, hour, onDiet } =
        meatsRequestBodySchema.parse(request.body)

      const { sessionId } = request.user

      await knex('meals').insert({
        id: crypto.randomUUID(),
        name,
        description,
        createdAt: new Date(`${date}T${hour}`).toISOString(),
        onDiet,
        sessionId,
      })

      return reply.status(201).send('')
    },
  )

  app.get(
    '/',
    {
      preHandler: [cookiesValidation],
    },
    async (request) => {
      const { sessionId } = request.user

      const meals = await knex('meals').where('sessionId', sessionId)

      return { meals }
    },
  )
}

export { mealsRoute }
