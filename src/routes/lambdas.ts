import express from 'express'
import { lambdaEiffelPim } from '../lambdaEiffelPim/handler'
import { dynamoDB } from '../dynamoDB/handler'

const lambdasRouter = express.Router()

lambdasRouter.post('/eiffel-pim', lambdaEiffelPim)
lambdasRouter.post('/dynamo-db', dynamoDB)

export default lambdasRouter
