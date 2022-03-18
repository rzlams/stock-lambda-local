import express from 'express'
import { handler } from '../lambdaEiffelPim/handler'

const lambdasRouter = express.Router()

lambdasRouter.post('/eiffel-pim', handler)

export default lambdasRouter
