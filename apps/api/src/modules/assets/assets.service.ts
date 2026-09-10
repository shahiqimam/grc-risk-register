import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { RiskAsset } from '../risks/risk-asset.entity';
import { Asset } from './asset.entity';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';

@Injectable()
export class AssetsService {
  constructor(
    @InjectRepository(Asset) private readonly assetsRepository: Repository<Asset>,
    @InjectRepository(RiskAsset) private readonly riskAssetsRepository: Repository<RiskAsset>
  ) {}

  create(dto: CreateAssetDto) {
    return this.assetsRepository.save(this.assetsRepository.create(dto));
  }

  findAll(search?: string) {
    return this.assetsRepository.find({
      where: search ? [{ name: ILike(`%${search}%`) }, { owner: ILike(`%${search}%`) }] : undefined,
      order: { name: 'ASC' }
    });
  }

  async findOne(id: string) {
    const asset = await this.assetsRepository.findOne({ where: { id } });
    if (!asset) {
      throw new NotFoundException('Asset not found');
    }
    return asset;
  }

  async update(id: string, dto: UpdateAssetDto) {
    const asset = await this.findOne(id);
    Object.assign(asset, dto);
    return this.assetsRepository.save(asset);
  }

  async remove(id: string) {
    const asset = await this.findOne(id);
    const links = await this.riskAssetsRepository.count({ where: { asset: { id } } });
    if (links > 0) {
      throw new ConflictException('Asset is linked to one or more risks');
    }
    await this.assetsRepository.remove(asset);
    return { deleted: true };
  }
}
