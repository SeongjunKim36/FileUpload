import { Entity, Column } from 'typeorm';
import { AbstractEntity } from '../../../common/abstract.entity';

@Entity('users')
export class UserEntity extends AbstractEntity {
    @Column()
    name!: string;

    @Column({ default: 0 })
    usedStorage!: number;  // 사용중인 저장소 용량 (bytes)

    @Column({ default: 1024 * 1024 * 100 }) // 기본 100MB
    storageLimit!: number;  // 최대 저장소 용량 (bytes)
}