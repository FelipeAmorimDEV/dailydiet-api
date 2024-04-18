import { FastifyInstance } from 'fastify'
import { knex } from '../database'
import { string, z } from 'zod'
import { cookiesValidation } from '../middlewares/cookies-validation'

async function mealsRoute(app: FastifyInstance) {
  // Criar refeição
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
  // Obter refeições
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
  // Obter refeição
  app.get(
    '/:id',
    {
      preHandler: [cookiesValidation],
    },
    async (request, reply) => {
      const requestParamsSchema = z.object({
        id: z.string().uuid(),
      })
      const { sessionId } = request.user

      const { id } = requestParamsSchema.parse(request.params)
      const meal = await knex('meals').where('id', id).first()

      if (meal?.sessionId !== sessionId) {
        return reply.status(401).send({ error: 'Unouthorized' })
      }

      return { meal }
    },
  )
  // Deletar refeição
  app.delete(
    '/:id',
    {
      preHandler: [cookiesValidation],
    },
    async (request, reply) => {
      const requestParamsSchema = z.object({
        id: z.string().uuid(),
      })

      const { sessionId } = request.user
      const { id } = requestParamsSchema.parse(request.params)
      const meal = await knex('meals').where('id', id).first()
      const isAnAuthorizedUser = meal?.sessionId === sessionId

      if (!isAnAuthorizedUser) {
        return reply.status(401).send({ error: 'Unouthorized' })
      }

      await knex('meals').where('id', id).del()

      return reply.status(200).send()
    },
  )
  // Atualizar refeição
  app.put(
    '/:id',
    {
      preHandler: [cookiesValidation],
    },
    async (request, reply) => {
      const requestParamsSchema = z.object({
        id: string().uuid(),
      })

      const { id } = requestParamsSchema.parse(request.params)
      const { sessionId } = request.user
      const meal = await knex('meals').where('id', id).first()
      const isAnAuthorizedUser = meal?.sessionId === sessionId

      if (!isAnAuthorizedUser) {
        return reply.status(401).send({ error: 'Unouthorized' })
      }

      const mealRequestBodySchema = z.object({
        name: z.string(),
        description: z.string(),
        date: z.string(),
        hour: z.string(),
        onDiet: z.enum(['yes', 'no']),
      })
      const { name, description, date, hour, onDiet } =
        mealRequestBodySchema.parse(request.body)

      await knex('meals')
        .where('id', id)
        .update({
          name,
          description,
          createdAt: new Date(`${date}T${hour}`).toISOString(),
          onDiet,
        })

      return reply.status(200).send()
    },
  )

  // Obter sumário
  app.get(
    '/summary',
    {
      preHandler: [cookiesValidation],
    },
    async (request) => {
      const { sessionId } = request.user

      const meals = await knex('meals').where('sessionId', sessionId)
      const { onDiet, outDiet } = meals.reduce(
        (acc, item) =>
          item.onDiet === 'yes'
            ? { ...acc, onDiet: acc.onDiet + 1 }
            : { ...acc, outDiet: acc.outDiet + 1 },
        { onDiet: 0, outDiet: 0 },
      )

      return { totalMeals: meals.length, onDiet, outDiet }
    },
  )
}

export { mealsRoute }
