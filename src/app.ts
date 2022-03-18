import * as dotenv from 'dotenv'
import path from 'path'
import express, { Application, Errback, Request, Response, NextFunction, RequestHandler } from 'express'
import router from './routes'

class App {
  private dotenv: any
  private app: Application
  private port: string | number

  constructor() {
    this.dotenv = dotenv.config()
    this.port = process.env.PORT || 4444
    this.app = express()
    this.loadMiddlewares()
    this.loadRoutes()
    this.assets()
    this.template()
  }

  private loadMiddlewares(): void {
    this.app.use(express.json() as RequestHandler)
    this.app.use(express.urlencoded({ extended: true }) as RequestHandler)
  }

  private loadRoutes(): void {
    this.app.use(router)
  }

  private assets(): void {
    this.app.use('assets', express.static(`${process.env.PWD}/public/assets`))
  }

  private template(): void {
    this.app.set('views', path.join(`${process.env.PWD}/public`, 'views'))
    this.app.set('view engine', 'pug')
  }

  public listen(): void {
    this.app.listen(this.port, (): void => {
      console.log(`Server listening on localhost:${this.port}`)
    })
  }
}

new App().listen()
