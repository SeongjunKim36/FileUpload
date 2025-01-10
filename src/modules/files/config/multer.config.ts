import { diskStorage } from 'multer';
import { extname } from 'path';

type FileFilterCallback = (error: Error | null, acceptFile: boolean) => void;
type FilenameCallback = (error: Error | null, filename: string) => void;

export const fileUploadConfig = {
    storage: diskStorage({
        destination: './uploads',
        filename: generateFileName,
    }),
    fileFilter: fileFilter,
};

export function generateFileName(
    req: Express.Request, 
    file: Express.Multer.File, 
    callback: FilenameCallback
) {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    callback(null, `${uniqueSuffix}${extname(file.originalname)}`);
}

export function fileFilter(
    req: Express.Request, 
    file: Express.Multer.File, 
    callback: FileFilterCallback
) {
    callback(null, true);
} 