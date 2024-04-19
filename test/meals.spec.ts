import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import request from 'supertest'
import { execSync } from 'child_process'
import { app } from '../src/app'


describe('Meals routes', () => {
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

  it('should be able to create a new meal', async () => {
    const userResponse = await request(app.server)
      .post('/users')
      .send({ name: 'John Doe', email: 'johndoe@gmail.com' })
      .expect(201)

    await request(app.server)
      .post('/meals')
      .send({
        name: 'Breakfast',
        description: "It's a breakfast",
        onDiet: 'yes',
        date: '2024-04-17',
        hour: '20:20',
      })
      .set('Cookie', userResponse.get('Set-Cookie')!)
      .expect(201)

  })

  it('should be able to view all user meals', async () => {
    const userResponse = await request(app.server)
      .post('/users')
      .send({ name: 'John Doe', email: 'johndoe@gmail.com' })
      .expect(201)

    await request(app.server)
      .post('/meals')
      .send({
        name: 'Breakfast',
        description: "It's a breakfast",
        onDiet: 'yes',
        date: '2024-04-17',
        hour: '20:20',
      })
      .set('Cookie', userResponse.get('Set-Cookie')!)
      .expect(201)

    const userMeals = await request(app.server)
      .get('/meals')
      .set('Cookie', userResponse.get('Set-Cookie')!)
      .expect(200)

    expect(userMeals.body.meals).toEqual([expect.objectContaining({
      name: 'Breakfast',
      description: "It's a breakfast",
      onDiet: 'yes',
      createdAt: new Date('2024-04-17T20:20').toISOString()
    })])
  })

  it('should be able to view a user meal', async () => {
    const userResponse = await request(app.server)
      .post('/users')
      .send({ name: 'John Doe', email: 'johndoe@gmail.com' })
      .expect(201)

    await request(app.server)
      .post('/meals')
      .send({
        name: 'Breakfast',
        description: "It's a breakfast",
        onDiet: 'yes',
        date: '2024-04-17',
        hour: '20:20',
      })
      .set('Cookie', userResponse.get('Set-Cookie')!)
      .expect(201)

    const userMeals = await request(app.server)
      .get('/meals')
      .set('Cookie', userResponse.get('Set-Cookie')!)
      .expect(200)

    const { id } = userMeals.body.meals[0]

    const userMeal = await request(app.server)
      .get(`/meals/${id}`)
      .set('Cookie', userResponse.get('Set-Cookie')!)
      .expect(200)

    expect(userMeal.body.meal).toEqual(expect.objectContaining(
      {
        name: 'Breakfast',
        description: "It's a breakfast",
        onDiet: 'yes',
        createdAt: new Date('2024-04-17T20:20').toISOString()
      }
    ))
  })

  it('should be able to delete a user meal', async () => {
    const userResponse = await request(app.server)
      .post('/users')
      .send({ name: 'John Doe', email: 'johndoe@gmail.com' })
      .expect(201)

    await request(app.server)
      .post('/meals')
      .send({
        name: 'Breakfast',
        description: "It's a breakfast",
        onDiet: 'yes',
        date: '2024-04-17',
        hour: '20:20',
      })
      .set('Cookie', userResponse.get('Set-Cookie')!)
      .expect(201)

    const userMeals = await request(app.server)
      .get('/meals')
      .set('Cookie', userResponse.get('Set-Cookie')!)
      .expect(200)

    const { id } = userMeals.body.meals[0]

    await request(app.server)
      .delete(`/meals/${id}`)
      .set('Cookie', userResponse.get('Set-Cookie')!)
      .expect(200)
  })

  it('should be able to edit a user meal', async () => {
    const userResponse = await request(app.server)
      .post('/users')
      .send({ name: 'John Doe', email: 'johndoe@gmail.com' })
      .expect(201)

    await request(app.server)
      .post('/meals')
      .send({
        name: 'Breakfast',
        description: "It's a breakfast",
        onDiet: 'yes',
        date: '2024-04-17',
        hour: '20:20',
      })
      .set('Cookie', userResponse.get('Set-Cookie')!)
      .expect(201)

    const userMeals = await request(app.server)
      .get('/meals')
      .set('Cookie', userResponse.get('Set-Cookie')!)
      .expect(200)

    const { id } = userMeals.body.meals[0]

    await request(app.server)
      .put(`/meals/${id}`)
      .set('Cookie', userResponse.get('Set-Cookie')!)
      .send({
        name: 'Feijão',
        description: 'Feijão com bacon',
        date: '2024-04-19',
        hour: '10:20',
        onDiet: 'no'
      })
      .expect(200)
  })

  it('should be able to view the user meals summary', async () => {
    const userResponse = await request(app.server)
      .post('/users')
      .send({ name: 'John Doe', email: 'johndoe@gmail.com' })
      .expect(201)

    await request(app.server)
      .post('/meals')
      .send({
        name: 'Breakfast',
        description: "It's a breakfast",
        onDiet: 'yes',
        date: '2024-04-17',
        hour: '20:20',
      })
      .set('Cookie', userResponse.get('Set-Cookie')!)
      .expect(201)

    await request(app.server)
      .post('/meals')
      .send({
        name: 'Feijão',
        description: "Feijão com bacon",
        onDiet: 'no',
        date: '2024-04-17',
        hour: '20:20',
      })
      .set('Cookie', userResponse.get('Set-Cookie')!)
      .expect(201)

    await request(app.server)
      .post('/meals')
      .send({
        name: 'Feijão',
        description: "Feijão com bacon",
        onDiet: 'yes',
        date: '2024-04-17',
        hour: '20:20',
      })
      .set('Cookie', userResponse.get('Set-Cookie')!)
      .expect(201)

    await request(app.server)
      .post('/meals')
      .send({
        name: 'Feijão',
        description: "Feijão com bacon",
        onDiet: 'yes',
        date: '2024-04-17',
        hour: '20:20',
      })
      .set('Cookie', userResponse.get('Set-Cookie')!)
      .expect(201)

    const userMealsSummary = await request(app.server)
      .get('/meals/summary')
      .set('Cookie', userResponse.get('Set-Cookie')!)
      .expect(200)

    expect(userMealsSummary.body).toEqual(expect.objectContaining({
      "totalMeals": 4,
      "onDietCount": 3,
      "outDietCount": 1,
      "maxDietarySequence": 2
    }))
  })
})