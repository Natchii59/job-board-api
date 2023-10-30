import { NestFactory } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import * as cookieParser from 'cookie-parser'

import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  const config = new DocumentBuilder()
    .setTitle('Job board API')
    .setDescription('Job board API description')
    .setVersion('1.0')
    .addBearerAuth({
      name: 'Authorization',
      description: 'Bearer token',
      type: 'http',
      in: 'Header',
      bearerFormat: 'Bearer',
      scheme: 'Bearer'
    })
    .build()

  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api', app, document, {
    customSiteTitle: 'Job board API Docs'
  })

  app.use(cookieParser(process.env.COOKIE_SECRET))

  await app.listen(3000)
}

bootstrap()
