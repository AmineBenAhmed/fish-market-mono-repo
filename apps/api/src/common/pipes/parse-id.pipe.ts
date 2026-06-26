import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class ParseIdPipe implements PipeTransform<string, string> {
  transform(value: string): string {
    if (!value || value.trim().length === 0) {
      throw new BadRequestException('ID must not be empty');
    }

    return value.trim();
  }
}
