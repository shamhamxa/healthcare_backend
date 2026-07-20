"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var NotificationsModule_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsModule = void 0;
const common_1 = require("@nestjs/common");
const bullmq_1 = require("@nestjs/bullmq");
const notifications_controller_1 = require("./notifications.controller");
const notifications_service_1 = require("./notifications.service");
const notifications_processor_1 = require("./notifications.processor");
let NotificationsModule = NotificationsModule_1 = class NotificationsModule {
    static forRoot() {
        const redisEnabled = process.env.REDIS_ENABLED === 'true';
        if (redisEnabled) {
            return {
                module: NotificationsModule_1,
                imports: [
                    bullmq_1.BullModule.forRoot({
                        connection: {
                            host: process.env.REDIS_HOST ?? 'localhost',
                            port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
                        },
                    }),
                    bullmq_1.BullModule.registerQueue({ name: notifications_service_1.NOTIFICATIONS_QUEUE }),
                ],
                controllers: [notifications_controller_1.NotificationsController],
                providers: [notifications_service_1.NotificationsService, notifications_processor_1.NotificationsProcessor],
                exports: [notifications_service_1.NotificationsService],
            };
        }
        return {
            module: NotificationsModule_1,
            controllers: [notifications_controller_1.NotificationsController],
            providers: [
                notifications_service_1.NotificationsService,
                { provide: `BullQueue_${notifications_service_1.NOTIFICATIONS_QUEUE}`, useValue: null },
            ],
            exports: [notifications_service_1.NotificationsService],
        };
    }
};
exports.NotificationsModule = NotificationsModule;
exports.NotificationsModule = NotificationsModule = NotificationsModule_1 = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({})
], NotificationsModule);
//# sourceMappingURL=notifications.module.js.map