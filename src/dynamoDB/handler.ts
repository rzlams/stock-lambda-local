// libs
import { NextFunction, Request, Response } from 'express'
import AWS from 'aws-sdk'
// others
import config from './config'

AWS.config.update({ region: 'us-east-1' })
const dynamodb = new AWS.DynamoDB.DocumentClient()

const leagues = ['English Premier League', 'La Liga', 'Eredivisie', 'Calcio - Serie A'] as const

type League = typeof leagues[number]

interface Team {
  league: League
  name: string
  stadium: string
}

export const dynamoDB = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const updateInputKey: Partial<Team> = {
      name: 'Manchester City',
      league: 'English Premier League',
    }
    const updateInput = {
      TableName: 'teams',
      Key: updateInputKey,
      UpdateExpression: 'set #s = :s',
      ExpressionAttributeNames: { '#s': 'stadium' },
      ExpressionAttributeValues: { ':s': 'Etihad Stadium' },
      ReturnValues: 'ALL_NEW',
    }
    const result = await dynamodb.update(updateInput).promise()

    res.json(result)
  } catch (error) {
    next(error)
  }
}
