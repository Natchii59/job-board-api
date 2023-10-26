import {
  BadRequestException,
  ClassSerializerInterceptor,
  ValidationPipe
} from '@nestjs/common'
import { NestFactory, Reflector } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import * as cookieParser from 'cookie-parser'

import { AppModule } from './app.module'
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard'
import { RolesGuard } from './auth/guards/roles.guard'
import { validationErrorsMessages } from './lib/validators'

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

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      exceptionFactory(errors) {
        const messages = validationErrorsMessages(errors)
        return new BadRequestException(messages)
      }
    })
  )

  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)))

  app.use(cookieParser(process.env.COOKIE_SECRET))

  app.useGlobalGuards(
    new JwtAuthGuard(new Reflector()),
    new RolesGuard(new Reflector())
  )

  await app.listen(3000)
}

bootstrap()
