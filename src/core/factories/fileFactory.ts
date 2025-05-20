import path from 'node:path';
import { ImageMeta } from '../types/messages/files/image.ts';

export class FileFactory {
    public static createImageMeta(id: string, filename: string): ImageMeta {
        return {
            id,
            name:       filename,
            mime_type:  `image/${path.extname(filename).slice(1)}`,
        }
    }
}