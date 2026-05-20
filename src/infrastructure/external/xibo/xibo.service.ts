import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

import { CreateXiboScheduleEventDto } from './dto/create-xibo-schedule-event.dto';
import { XiboTokenResponseDto } from './dto/xibo-token-response.dto';
import { XiboAuthToken } from './xibo.types';
import {
  XIBO_HTTP_TIMEOUT,
  XIBO_TOKEN_EXPIRY_BUFFER_MS,
} from './xibo.constants';

@Injectable()
export class XiboService {
  private readonly logger = new Logger(XiboService.name);

  private tokenCache?: XiboAuthToken;

  private readonly baseUrl: string;
  private readonly clientId: string;
  private readonly clientSecret: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.baseUrl = this.configService.getOrThrow<string>('XIBO_API_URL');
    this.clientId = this.configService.getOrThrow<string>('XIBO_CLIENT_ID');
    this.clientSecret =
      this.configService.getOrThrow<string>('XIBO_CLIENT_SECRET');
  }

  async getAccessToken(): Promise<string> {
    if (this.isTokenValid()) {
      return this.tokenCache!.accessToken;
    }

    try {
      const body = new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: this.clientId,
        client_secret: this.clientSecret,
      });

      const response = await firstValueFrom(
        this.httpService.post<XiboTokenResponseDto>(
          `${this.baseUrl}/api/authorize/access_token`,
          body.toString(),
          {
            timeout: XIBO_HTTP_TIMEOUT,
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          },
        ),
      );

      const token = response.data;

      this.tokenCache = {
        accessToken: token.access_token,
        expiresAt:
          Date.now() + token.expires_in * 1000 - XIBO_TOKEN_EXPIRY_BUFFER_MS,
      };

      this.logger.log('Successfully authenticated with Xibo CMS');

      return token.access_token;
    } catch (error) {
      this.logger.error(
        'Failed to authenticate with Xibo CMS',
        error instanceof Error ? error.stack : undefined,
      );

      throw new InternalServerErrorException('Xibo authentication failed');
    }
  }

  async getAbout(): Promise<unknown> {
    return this.get('/api/about');
  }

  async getDisplays(): Promise<unknown> {
    return this.get('/api/display');
  }

  async getDisplayGroups(): Promise<unknown> {
    return this.get('/api/displaygroup');
  }

  async getLayouts(): Promise<unknown> {
    return this.get('/api/layout');
  }

  async getCampaigns(): Promise<unknown> {
    return this.get('/api/campaign');
  }

  async getScheduleEvents(displayGroupId: number): Promise<unknown> {
    return this.get(`/api/schedule/${displayGroupId}/events`);
  }

  async createScheduleEvent(
    payload: CreateXiboScheduleEventDto,
  ): Promise<unknown> {
    return this.postForm('/api/schedule', { ...payload });
  }

  private async get<T>(url: string): Promise<T> {
    const token = await this.getAccessToken();

    try {
      const response = await firstValueFrom(
        this.httpService.get<T>(`${this.baseUrl}${url}`, {
          timeout: XIBO_HTTP_TIMEOUT,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
      );

      return response.data;
    } catch (error) {
      this.handleApiError('GET', url, error);
    }
  }

  private async postForm<T>(
    url: string,
    payload: Record<string, unknown>,
  ): Promise<T> {
    const token = await this.getAccessToken();

    const body = new URLSearchParams();

    for (const [key, value] of Object.entries(payload)) {
      if (value === undefined || value === null) {
        continue;
      }

      if (Array.isArray(value)) {
        for (const item of value) {
          // Xibo/Slim expects array form fields using PHP-style notation.
          body.append(`${key}[]`, this.toFormValue(item));
        }

        continue;
      }

      body.append(key, this.toFormValue(value));
    }

    try {
      const response = await firstValueFrom(
        this.httpService.post<T>(`${this.baseUrl}${url}`, body.toString(), {
          timeout: XIBO_HTTP_TIMEOUT,
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }),
      );

      return response.data;
    } catch (error) {
      this.handleApiError('POST', url, error);
    }
  }

  private toFormValue(value: unknown): string {
    if (
      typeof value === 'string' ||
      typeof value === 'number' ||
      typeof value === 'boolean'
    ) {
      return String(value);
    }

    throw new InternalServerErrorException(
      'Unsupported Xibo form payload value type',
    );
  }

  private isTokenValid(): boolean {
    return !!this.tokenCache && Date.now() < this.tokenCache.expiresAt;
  }

  private handleApiError(
    method: 'GET' | 'POST',
    url: string,
    error: unknown,
  ): never {
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as {
        response?: {
          status?: number;
          data?: unknown;
        };
        message?: string;
        stack?: string;
      };

      this.logger.error(
        `Xibo API request failed: ${method} ${url} - status ${axiosError.response?.status}`,
        JSON.stringify(axiosError.response?.data ?? axiosError.message),
      );
    } else {
      this.logger.error(
        `Xibo API request failed: ${method} ${url}`,
        error instanceof Error ? error.stack : undefined,
      );
    }

    throw new InternalServerErrorException('Xibo API request failed');
  }
}
