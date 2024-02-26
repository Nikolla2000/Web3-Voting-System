import { Body, Controller, Delete, Get, Header, HostParam, HttpCode, Param, Post, Put, Redirect, Req } from "@nestjs/common";

export class CreateCatDto {
    name: string;
    age: number;
    breed: string;
}

export class UpdateCatDto {
    name: string;
    age: number;
    breed: string;
}

@Controller('cats')
export class CatsController{

    // @Get()
    // // @Redirect('https://nestjs.com', 301)
    // findAll(@Req() request: Request): string {
    //     return 'This action returns all cats';
    // }

    @Get()
    async findAll(): Promise<any[]> {
        return [];
    }

    @Post()
    async create(@Body() createCatDto: CreateCatDto) {
        return 'This action adds a new cat';
    }

    @Get(':id')
    findOne(@Param() parameters: any): string {
        console.log(parameters)
        return `This action returns the ${parameters.id} cat`;
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() updateCatDto: UpdateCatDto) {
      return `This action updates a #${id} cat`;
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return `This action deletes the ${id} cat`
    }

}

@Controller({ host: ':account.example.com' })
export class AccountController {
  @Get()
  getInfo(@HostParam('account') account: string) {
    return account;
  }
}
