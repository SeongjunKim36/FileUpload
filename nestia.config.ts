import { INestiaConfig } from "@nestia/sdk";
import { ConfigModule } from '@nestjs/config';

ConfigModule.forRoot({
    envFilePath: '.env.swagger'  // Swagger 전용 환경 설정 파일
});
const config: INestiaConfig = {
    input: {
        include: ["src/**/*.ts"],
        exclude: [
            "src/**/*.spec.ts",
            "src/**/*.test.ts",
            "test/**/*.ts"
        ]
    },
    output: "swagger.json",
    swagger: {
        output: "swagger.json",
        servers: [
            {
                url: "http://localhost:3000",
                description: "Local Server"
            }
        ],
        info: {
            title: "File Upload API",
            version: "1.0.0",
            description: "File Upload Service API Documentation"
        },
        // security: {
        //     bearer: {
        //         type: 'http',
        //         scheme: 'bearer'
        //     }
        // },
        // decompose: true,
    },
    primitive: false,
};
export default config; 