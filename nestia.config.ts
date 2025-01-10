import { INestiaConfig } from "@nestia/sdk";

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
    },
    primitive: false,
};
export default config; 