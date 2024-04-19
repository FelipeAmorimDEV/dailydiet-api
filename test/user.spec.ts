
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { execSync } from 'node:child_process'
import request from 'supertest'
import { app } from '../src/app'


describe('User route', () => {
  beforeEach(() => {
    execSync('npm run knex migrate:rollback --all')
    execSync('npm run knex migrate:latest --all')
  })

  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  it('should be able to create a new user', async () => {
    await request(app.server)
      .post('/users')
      .send({
        name: 'felipe amorim',
        email: 'felipe@gmail.comm'
      }).expect(201)
  })

  it('should be able to validate email existence for new user creation', async () => {
    await request(app.server)
      .post('/users')
      .send({
        name: 'felipe amorim',
        email: 'felipe@gmail.comm'
      }).expect(201)

    await request(app.server)
      .post('/users')
      .send({
        name: 'felipe amorim',
        email: 'felipe@gmail.comm'
      }).expect(409)
  })
})