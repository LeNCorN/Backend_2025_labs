import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { HttpModule } from "@nestjs/axios";

@Module({
    imports: [
        HttpModule.register({
            timeout: 10000,
            maxRedirects: 5,
        })
    ],
    controllers: [AppController],
    providers: [],
})
export class AppModule {}
