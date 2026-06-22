import { Injectable } from "@nestjs/common";
import { HttpService } from '@nestjs/axios';
import { ConfigService } from "@nestjs/config";
import { Request } from "express";
import { firstValueFrom } from "rxjs";
import { AxiosRequestConfig } from "axios";

@Injectable()
export class AuthProxyService {
    private readonly authUrl: string;

    constructor(
        private readonly httpService: HttpService,
        private readonly configService: ConfigService,
    ) {
        this.authUrl = this.configService.get<string>('services.authUrl');
    }

    async forward(req: Request, path: string, method: string) {
        const config: AxiosRequestConfig = {
            method,
            url: `${this.authUrl}${path}`,
            data: req.body,
            headers: this.buildHeaders(req)
        }

        const response = await firstValueFrom(
            this.httpService.request(config),

        )

        return response.data;
    }

    /**
   * Forward only safe headers,not internal headers.
   * Authorization is forwarded so auth-service guards work
   * Cookie is forwarded for refresh token.
   */
    private buildHeaders(req: Request): Record<string, string> {
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
        };
    
        if (req.headers.authorization) {
            headers['Authorization'] = req.headers.authorization;
        }
    
        if (req.headers.cookie) {
            headers['Cookie'] = req.headers.cookie;
        }
    
        return headers;
    }
}