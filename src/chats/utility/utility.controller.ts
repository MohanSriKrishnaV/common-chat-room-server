import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';

interface MulterFile {
    originalname: string;
    filename: string;
    path: string;
    mimetype: string;
    size: number;
}

@Controller('upload-dp')
export class UtilityController {

    @Post('')
    @UseInterceptors(FileInterceptor('file', {
        storage: diskStorage({
            destination: './uploads',
            filename: (req, file, cb) => {
                const uniqueSuffix = `${uuidv4()}${extname(file.originalname)}`;
                cb(null, uniqueSuffix);
            }
        })
    }))
    uploadFile(@UploadedFile() file: MulterFile) {
        return { dpUrl: `/uploads/${file.filename}` };
    }
}


