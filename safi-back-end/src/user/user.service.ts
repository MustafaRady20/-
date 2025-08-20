import {
  Injectable,
  ConflictException,
  NotFoundException,
  UnauthorizedException,
  HttpException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as crypto from 'crypto';

import { CreateUserDto } from './dto/create-user.dto';
import { User, UserDocument } from 'src/user/schema/user.schema';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const { name, password, role } = createUserDto;

    const existing = await this.userModel.findOne({ name });
    if (existing) {
      throw new ConflictException('User already exists');
    }

    const hashedPassword = crypto
      .createHash('sha256')
      .update(password)
      .digest('hex');

    const createdUser = new this.userModel({
      name,
      password: hashedPassword,
      role: role ?? 'user',
    });

    return createdUser.save();
  }

  async validateUser(name: string, password: string): Promise<any> {
    const user = await this.userModel.findOne({ name });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const hashedPassword = crypto
      .createHash('sha256')
      .update(password)
      .digest('hex');

    if (user.password !== hashedPassword) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // return user without password
    return { _id: user._id, name: user.name, role: user.role };
  }

  async login(name: string, password: string) {
    const user = await this.validateUser(name, password);

    const payload = { sub: user._id, name: user.name, role: user.role };
    const accessToken = this.jwtService.sign(payload);

    return { accessToken, user };
  }

  async findAll(): Promise<User[]> {
    return this.userModel.find().select('-password').exec();
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userModel.findById(id).select('-password').exec();
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async update(id: string, newuser: { name?: string; role?: string }) {
    if (!id) {
      throw new BadRequestException('User id is required');
    }

    const user = await this.userModel.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updatedUser = await this.userModel.findByIdAndUpdate(id, newuser, {
      new: true,
      runValidators: true,
    });

    return updatedUser;
  }

  async delete(id: string): Promise<void> {
    const result = await this.userModel.findByIdAndDelete(id).exec();
    if (!result) throw new NotFoundException('User not found');
  }
}
