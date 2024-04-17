import { FastifyReply, FastifyRequest } from 'fastify'
import { knex } from '../database'

async function cookiesValidation(request: FastifyRequest, reply: FastifyReply) {
  const { sessionID } = request.cookies

  if (!sessionID) {
    return reply.status(401).send({ error: 'Unauthorized' })
  }

  const user = await knex('users').where('sessionId', sessionID).first()

  request.user = user
}

export { cookiesValidation }
