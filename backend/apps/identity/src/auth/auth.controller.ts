import { Controller } from "@nestjs/common";
// import { AuthService } from "./auth.service";
// import { UsersService } from "../users/users.service";
import { MessagePattern } from "@nestjs/microservices";

@Controller()
export class AuthController {
    
    @MessagePattern({ cmd: 'auth.test' })
    async test() {
        return 'test';
    }
}