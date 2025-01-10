import { diskStorage } from 'multer';
import { extname } from 'path';

export const fileUploadConfig = {
    storage: diskStorage({
        destination: './uploads',
        filename: generateFileName,
    }),
    fileFilter: fileFilter,
};

export function generateFileName(req: any, file: Express.Multer.File, callback: Function) {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    callback(null, `${uniqueSuffix}${extname(file.originalname)}`);
}

export function fileFilter(req: any, file: Express.Multer.File, callback: Function) {
    callback(null, true);
} 