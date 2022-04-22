import express from 'express'
import { lambdaEiffelPim } from '../lambdaEiffelPim/handler'

const lambdasRouter = express.Router()

lambdasRouter.post('/eiffel-pim', lambdaEiffelPim)

export default lambdasRouter
