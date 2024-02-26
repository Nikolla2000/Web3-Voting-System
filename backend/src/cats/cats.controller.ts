import { Body, Controller, Delete, Get, Header, HostParam, HttpCode, HttpStatus, Param, Post, Put, Redirect, Req, Res } from "@nestjs/common";
import { Response } from "express";
import { CatsService } from "./cats.service";
import { Cat } from "./interfaces/cat.interface";
import { CreateCatDto, UpdateCatDto } from "./dto/create-cat.dto";

@Controller('cats')
export class CatsController{
    constructor(private catsService: CatsService) {}

    // @Get()
    // // @Redirect('https://nestjs.com', 301)
    // findAll(@Req() request: Request): string {
    //     return 'This action returns all cats';
    // }

    @Get()
    async findAll(): Promise<Cat[]> {
        return this.catsService.findAll();
    }

    @Post()
    async create(@Body() createCatDto: CreateCatDto) {
        this.catsService.create(createCatDto);
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
