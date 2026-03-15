import { Controller, Get, Query } from '@nestjs/common';
import { SectionsService } from './sections.service';
import { GetSectionsDto } from './dto/get-sections.dto';

@Controller('api/sections')
export class SectionsController {
  constructor(private readonly sectionsService: SectionsService) {}

  @Get()
  async listSections(@Query() query: GetSectionsDto) {
    return this.sectionsService.listSections(query.semesterId);
  }
}
