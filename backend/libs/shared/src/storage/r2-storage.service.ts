import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  DeleteObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export interface PresignedUpload {
  uploadUrl: string;
  publicUrl: string;
}

const UPLOAD_URL_EXPIRY_SECONDS = 5 * 60;

@Injectable()
export class R2StorageService {
  private readonly logger = new Logger(R2StorageService.name);
  private readonly client: S3Client;
  private readonly bucket: string;
  private readonly publicUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.bucket = this.configService.getOrThrow<string>('r2.bucket');
    this.publicUrl = this.configService
      .getOrThrow<string>('r2.publicUrl')
      .replace(/\/+$/, '');

    this.client = new S3Client({
      region: 'auto',
      endpoint: this.configService.getOrThrow<string>('r2.endpoint'),
      credentials: {
        accessKeyId: this.configService.getOrThrow<string>('r2.accessKeyId'),
        secretAccessKey: this.configService.getOrThrow<string>(
          'r2.secretAccessKey',
        ),
      },
    });
  }

  getPublicUrl(key: string): string {
    return `${this.publicUrl}/${key}`;
  }

  /** Returns the object key if this URL points at our own R2 bucket, or null otherwise. */
  keyFromPublicUrl(url: string): string | null {
    if (!url.startsWith(`${this.publicUrl}/`)) return null;
    return url.slice(this.publicUrl.length + 1);
  }

  async createPresignedUpload(
    key: string,
    contentType: string,
    contentLength: number,
  ): Promise<PresignedUpload> {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: contentType,
      ContentLength: contentLength,
    });

    const uploadUrl = await getSignedUrl(this.client, command, {
      expiresIn: UPLOAD_URL_EXPIRY_SECONDS,
    });

    return { uploadUrl, publicUrl: this.getPublicUrl(key) };
  }

  /** Uploads a buffer directly — for server-mediated uploads (no presigned URL). */
  async uploadObject(
    key: string,
    body: Buffer,
    contentType: string,
  ): Promise<string> {
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: body,
        ContentType: contentType,
      }),
    );

    return this.getPublicUrl(key);
  }

  /** Confirms an object was actually uploaded before we trust it as someone's avatar. */
  async objectExists(key: string): Promise<boolean> {
    try {
      await this.client.send(
        new HeadObjectCommand({ Bucket: this.bucket, Key: key }),
      );
      return true;
    } catch {
      return false;
    }
  }

  async deleteObject(key: string): Promise<void> {
    try {
      await this.client.send(
        new DeleteObjectCommand({ Bucket: this.bucket, Key: key }),
      );
    } catch (err: any) {
      // Best-effort cleanup — a failure here shouldn't block the caller.
      this.logger.warn(`Failed to delete R2 object "${key}": ${err.message}`);
    }
  }
}
