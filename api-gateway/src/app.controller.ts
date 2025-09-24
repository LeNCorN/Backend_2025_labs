import {
    Controller,
    Req,
    Res,
    Get,
    Post,
    Put,
    Delete,
    Body,
    HttpStatus,
    ValidationPipe,
} from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { Request, Response } from "express";
import { ApiTags, ApiOperation, ApiBody, ApiResponse, ApiExcludeEndpoint } from "@nestjs/swagger";

@Controller()
export class AppController {
    private readonly services = {
        user: "http://jobboard-user-resume:3001",
        company: "http://jobboard-company-vacancy:3002",
        industry: "http://jobboard-industry:3003",
    };

    constructor(private readonly httpService: HttpService) {}

    // ==================== SWAGGER ENDPOINTS ====================

    @Get("docs/:service")
    @ApiExcludeEndpoint()
    async getServiceSwagger(@Req() req: Request, @Res() res: Response) {
        const { service } = req.params;

        if (!this.services[service]) {
            return res.status(404).json({ error: `Service "${service}" not found` });
        }

        try {
            const response = await this.httpService.axiosRef.get(
                `${this.services[service]}/api/docs`,
                {
                    headers: { ...req.headers, host: new URL(this.services[service]).host },
                    timeout: 5000
                }
            );

            let html = response.data;
            html = html.replace(/href="\/(.*?)"/g, `href="/api/${service}/$1"`);
            html = html.replace(/src="\/(.*?)"/g, `src="/api/${service}/$1"`);
            html = html.replace(/url:?\s*["']\/(.*?)["']/g, `url: "/api/${service}/$1"`);

            res.setHeader('Content-Type', 'text/html');
            res.send(html);
        } catch (error) {
            console.error(`Failed to load Swagger UI for ${service}:`, error.message);
            res.status(500).json({
                error: `Failed to load Swagger UI for ${service}`,
                details: error.message
            });
        }
    }

    @Get("health/:service")
    @ApiExcludeEndpoint()
    async getServiceHealth(@Req() req: Request, @Res() res: Response) {
        const { service } = req.params;

        if (!this.services[service]) {
            return res.status(404).json({ error: `Service "${service}" not found` });
        }

        try {
            const response = await this.httpService.axiosRef.get(
                `${this.services[service]}/health`,
                { timeout: 3000 }
            );
            res.json(response.data);
        } catch (error) {
            res.status(500).json({
                status: "unhealthy",
                service,
                error: error.message
            });
        }
    }

    // ==================== PROXY ENDPOINTS ====================

    @Get("api/:service/*")
    @ApiTags("gateway")
    @ApiOperation({ summary: "Proxy GET requests to microservices" })
    @ApiResponse({ status: 200, description: "Success response from microservice" })
    @ApiResponse({ status: 404, description: "Service not found" })
    @ApiResponse({ status: 502, description: "Bad gateway - service unavailable" })
    async proxyGet(@Req() req: Request, @Res() res: Response) {
        await this.proxyRequest(req, res, 'GET');
    }

    @Post("api/:service/*")
    @ApiTags("gateway")
    @ApiOperation({ summary: "Proxy POST requests to microservices" })
    @ApiBody({ description: "Data to send to microservice" })
    @ApiResponse({ status: 201, description: "Resource created successfully" })
    @ApiResponse({ status: 400, description: "Validation error" })
    @ApiResponse({ status: 404, description: "Service not found" })
    async proxyPost(
        @Req() req: Request,
        @Res() res: Response,
        @Body(new ValidationPipe({ transform: true })) body: any
    ) {
        await this.proxyRequest(req, res, 'POST', body);
    }

    @Put("api/:service/*")
    @ApiTags("gateway")
    @ApiOperation({ summary: "Proxy PUT requests to microservices" })
    @ApiBody({ description: "Data to update" })
    @ApiResponse({ status: 200, description: "Resource updated successfully" })
    @ApiResponse({ status: 404, description: "Service or resource not found" })
    async proxyPut(
        @Req() req: Request,
        @Res() res: Response,
        @Body(new ValidationPipe({ transform: true })) body: any
    ) {
        await this.proxyRequest(req, res, 'PUT', body);
    }

    @Delete("api/:service/*")
    @ApiTags("gateway")
    @ApiOperation({ summary: "Proxy DELETE requests to microservices" })
    @ApiResponse({ status: 200, description: "Resource deleted successfully" })
    @ApiResponse({ status: 404, description: "Service or resource not found" })
    async proxyDelete(@Req() req: Request, @Res() res: Response) {
        await this.proxyRequest(req, res, 'DELETE');
    }

    // ==================== HEALTH CHECK ====================

    @Get("health")
    @ApiTags("gateway")
    @ApiOperation({ summary: "Gateway health check" })
    @ApiResponse({ status: 200, description: "Gateway is healthy" })
    async healthCheck() {
        const health = {
            status: "healthy",
            gateway: "API Gateway is running",
            timestamp: new Date().toISOString(),
            services: {} as Record<string, string>
        };

        // Проверяем здоровье всех сервисов
        for (const [serviceName, serviceUrl] of Object.entries(this.services)) {
            try {
                const response = await this.httpService.axiosRef.get(
                    `${serviceUrl}/health`,
                    { timeout: 3000 }
                );
                health.services[serviceName] = response.data.status || "healthy";
            } catch (error) {
                health.services[serviceName] = "unhealthy";
            }
        }

        return health;
    }

    // ==================== PRIVATE METHODS ====================

    private async proxyRequest(
        req: Request,
        res: Response,
        method: 'GET' | 'POST' | 'PUT' | 'DELETE',
        body?: any
    ) {
        const { service } = req.params;
        this.logRequest(req, service, body);

        if (!this.services[service]) {
            return res.status(HttpStatus.NOT_FOUND).json({
                error: `Service "${service}" not found`,
                availableServices: Object.keys(this.services)
            });
        }

        const url = this.buildUrl(req, service);

        try {
            const config = {
                headers: this.cleanHeaders(req.headers),
                timeout: 10000,
                validateStatus: () => true
            };

            let response;
            switch (method) {
                case 'GET':
                    response = await this.httpService.axiosRef.get(url, config);
                    break;
                case 'POST':
                    response = await this.httpService.axiosRef.post(url, body, config);
                    break;
                case 'PUT':
                    response = await this.httpService.axiosRef.put(url, body, config);
                    break;
                case 'DELETE':
                    response = await this.httpService.axiosRef.delete(url, config);
                    break;
            }

            this.proxyResponse(res, response);
        } catch (error) {
            this.handleError(res, error, service);
        }
    }

    private buildUrl(req: Request, service: string): string {
        const baseUrl = this.services[service];
        const originalPath = req.originalUrl;

        // Извлекаем путь после /api/:service
        const pathMatch = originalPath.match(new RegExp(`/api/${service}(/.*)?`));
        const path = pathMatch ? (pathMatch[1] || '') : '';

        const queryString = req.url.includes('?') ? req.url.split('?')[1] : '';
        const finalUrl = `${baseUrl}${path}${queryString ? `?${queryString}` : ''}`;

        console.log(`Proxying to: ${finalUrl}`);
        return finalUrl;
    }

    private cleanHeaders(headers: any): any {
        const headersToRemove = ['host', 'content-length', 'connection'];
        const cleaned = { ...headers };

        headersToRemove.forEach(header => {
            delete cleaned[header];
        });

        return cleaned;
    }

    private proxyResponse(res: Response, response: any) {
        // Копируем заголовки ответа
        Object.keys(response.headers).forEach(key => {
            if (key.toLowerCase() !== 'content-length') {
                res.setHeader(key, response.headers[key]);
            }
        });

        res.status(response.status).send(response.data);
    }

    private handleError(res: Response, error: any, service?: string) {
        console.error(`Error proxying to ${service}:`, error.message);

        if (error.code === 'ECONNREFUSED') {
            return res.status(HttpStatus.BAD_GATEWAY).json({
                error: `Service ${service} is unavailable`,
                message: `Cannot connect to ${service} service`,
                details: error.message
            });
        }

        if (error.response) {
            return res.status(error.response.status).json(error.response.data);
        }

        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            error: "Internal Gateway Error",
            message: error.message
        });
    }

    private logRequest(req: Request, service: string, body?: any) {
        console.log(`📨 ${req.method} ${req.originalUrl} -> ${service} service`);
        if (body && Object.keys(body).length > 0) {
            console.log(`   Body:`, JSON.stringify(body, null, 2));
        }
    }
}

@Controller("info")
export class AppInfoController {
    @Get()
    @ApiTags("gateway")
    @ApiOperation({ summary: "Get gateway information" })
    getInfo() {
        return {
            name: "API Gateway",
            version: "1.0.0",
            description: "Gateway for microservices architecture",
            endpoints: {
                gateway: "/api/docs",
                userService: "/docs/user",
                companyService: "/docs/company",
                industryService: "/docs/industry",
                health: "/health"
            }
        };
    }
}
