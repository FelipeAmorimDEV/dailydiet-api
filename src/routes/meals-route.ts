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
      const { sessionId } = request.user
      const mealSchema = z.object({
        name: z.string(),
        description: z.string(),
        date: z.string(),
        hour: z.string(),
        onDiet: z.enum(['yes', 'no']),
      })
      const { name, description, date, hour, onDiet } = mealSchema.parse(request.body)

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
      const userMeals = await knex('meals').where('sessionId', sessionId)

      return { meals: userMeals }
    },
  )

  // Obter refeição por ID
  app.get(
    '/:id',
    {
      preHandler: [cookiesValidation],
    },
    async (request, reply) => {
      const { sessionId } = request.user
      const idSchema = z.object({ id: z.string().uuid() })
      const { id } = idSchema.parse(request.params)

      const meal = await knex('meals').where('id', id).first()

      if (meal?.sessionId !== sessionId) {
        return reply.status(401).send({ error: 'Unauthorized' })
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
      const { sessionId } = request.user
      const idSchema = z.object({ id: z.string().uuid() })
      const { id } = idSchema.parse(request.params)

      const meal = await knex('meals').where('id', id).first()
      const isAuthorizedUser = meal?.sessionId === sessionId

      if (!isAuthorizedUser) {
        return reply.status(401).send({ error: 'Unauthorized' })
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
      const { sessionId } = request.user
      const idSchema = z.object({ id: string().uuid() })
      const { id } = idSchema.parse(request.params)

      const meal = await knex('meals').where('id', id).first()
      const isAuthorizedUser = meal?.sessionId === sessionId

      if (!isAuthorizedUser) {
        return reply.status(401).send({ error: 'Unauthorized' })
      }

      const updatedMealSchema = z.object({
        name: z.string(),
        description: z.string(),
        date: z.string(),
        hour: z.string(),
        onDiet: z.enum(['yes', 'no']),
      })
      const { name, description, date, hour, onDiet } = updatedMealSchema.parse(request.body)

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

  // Obter sumário das refeições
  app.get(
    '/summary',
    {
      preHandler: [cookiesValidation],
    },
    async (request) => {
      const { sessionId } = request.user

      const meals = await knex('meals').where('sessionId', sessionId)

      const { onDietCount, outDietCount } = meals.reduce((acc, meal) => {
        if (meal.onDiet === 'yes') {
          acc.onDietCount++
        } else {
          acc.outDietCount++
        }
        return acc
      },
        { onDietCount: 0, outDietCount: 0 }
      )
      const { maxDietarySequence } = meals.reduce((acc, meal) => {
        const currentDietarySequence = meal.onDiet === 'yes' ? acc.currentDietarySequence + 1 : 0
        const newMaxDietarySequence = Math.max(currentDietarySequence, acc.maxDietarySequence)

        acc.maxDietarySequence = newMaxDietarySequence
        acc.currentDietarySequence = currentDietarySequence

        return acc
      },
        { maxDietarySequence: 0, currentDietarySequence: 0 }
      )

      return { totalMeals: meals.length, onDietCount, outDietCount, maxDietarySequence }
    }
  )
}

export { mealsRoute }