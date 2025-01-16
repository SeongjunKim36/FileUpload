import { Column, Entity } from 'typeorm';

import { AbstractEntity } from '../../../common/abstract.entity';
import { FileDto } from '../dtos/file.dto';

@Entity({ name: 'files' })
export class FileEntity extends AbstractEntity {
  @Column()
  originalName!: string;

  @Column()
  mimeType!: string;

  @Column()
  size!: number;

  @Column()
  path!: string;

  @Column()
  storageType!: string;

  @Column()
  uploadDate!: Date;

  @Column({ nullable: true })
  metadata?: string;

  toDto(): FileDto {
    return new FileDto(this);
  }
}
