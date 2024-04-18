import fastify from 'fastify'
import cookies from '@fastify/cookie'

import { usersRoute } from './routes/users-route'
import { mealsRoute } from './routes/meals-route'

const app = fastify()

app.register(cookies)
app.register(usersRoute, { prefix: '/users' })
app.register(mealsRoute, { prefix: '/meals' })

app
  .listen({ port: 3333 })
  .then(() => {
    console.log('HTTP Server Running.')
  })
