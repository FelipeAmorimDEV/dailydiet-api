import fastify from 'fastify'
import cookies from '@fastify/cookie'

import { usersRoute } from './routes/users-route'
import { mealsRoute } from './routes/meals-route'
import { env } from './env'

const app = fastify()

app.register(cookies)
app.register(usersRoute, { prefix: '/users' })
app.register(mealsRoute, { prefix: '/meals' })

app
  .listen({ port: env.PORT })
  .then(() => {
    console.log('HTTP Server Running.')
  })
