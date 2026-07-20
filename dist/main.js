"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.setGlobalPrefix('api/v1');
    const corsOrigins = process.env.CORS_ORIGINS?.split(',').map((o) => o.trim());
    app.enableCors({
        origin: corsOrigins?.length ? corsOrigins : true,
        credentials: true,
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        transform: true,
    }));
    app.enableShutdownHooks();
    const port = process.env.PORT ?? 3000;
    await app.listen(port);
    console.log(`Clinic Management API running on http://localhost:${port}/api/v1`);
}
void bootstrap();
//# sourceMappingURL=main.js.map