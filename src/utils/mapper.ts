import User from '../user/user.entity';
import { UserDto } from '../user/dto/user.dto';

/**
 * Maps entity from and to the Dto
 */
export default class Mapper {
  public static toUserDto(entity: User, includeTasks = false): UserDto {
    const dtoObj = { ...entity } as UserDto;

    delete dtoObj.password;

    if (!includeTasks) {
      delete dtoObj.tasks;
    }

    return dtoObj;
  }
}
