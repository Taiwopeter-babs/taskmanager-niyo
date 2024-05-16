import Task from '../task/task.entity';
import { UserDto } from '../user/dto/user.dto';

export interface ICorsConfig {
  methods: string | string[];
  origin: string | string[];
}

export interface IPagination {
  pageNumber: number;
  pageSize: number;
}

export interface ITaskQuery extends IPagination {
  taskStatus: 'completed' | 'pending' | null;
}

export interface ITokenPayload {
  email: string;
  sub: number; // userId
}

export type PagedItemDto = {
  hasPrevious: boolean;
  hasNext: boolean;
  totalItems: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;
};

export type PagedUserDto = {
  users: UserDto[];
} & PagedItemDto;

export type PagedTaskDto = {
  tasks: Task[];
} & PagedItemDto;
