import express from 'express'
import lambdasRouter from './lambdas'

const router = express.Router()

router.use('/lambdas', lambdasRouter)

export default router
