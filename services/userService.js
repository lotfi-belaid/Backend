const User = require('../models/userSchema');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../config');
const AppError = require('../utils/AppError');
const { ROLES, PASSWORD_REGEX, PASSWORD_MESSAGE } = require('../utils/constants');

class UserService {
    async findById(id) {
        return User.findById(id);
    }

    async findByEmail(email) {
        return User.findOne({ email });
    }

    async findAll() {
        return User.find();
    }

    async findByRole(role) {
        return User.find({ role });
    }

    async searchByName(name) {
        return User.find({ name: { $regex: name, $options: 'i' } });
    }

    async createUser(userData) {
        if (!PASSWORD_REGEX.test(userData.password)) {
            throw new AppError(PASSWORD_MESSAGE, 400);
        }

        const existing = await this.findByEmail(userData.email);
        if (existing) {
            throw new AppError('Email already registered', 400);
        }

        const user = new User(userData);
        await user.save();
        return user;
    }

    async updateUser(id, updateData) {
        const user = await User.findByIdAndUpdate(id, updateData, { new: true });
        if (!user) {
            throw new AppError('User not found', 404);
        }
        return user;
    }

    async deleteUser(id) {
        const user = await User.findByIdAndDelete(id);
        if (!user) {
            throw new AppError('User not found', 404);
        }
        return user;
    }

    async login(email, password) {
        const user = await this.findByEmail(email);
        if (!user) {
            throw new AppError('Invalid email', 400);
        }

        if (user.isBanned) {
            throw new AppError('Your account has been banned. Please contact support.', 403);
        }

        if (!user.isApproved) {
            throw new AppError('Your account is awaiting approval by the admin.', 403);
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            throw new AppError('Invalid password', 400);
        }

        const payload = { id: user._id, role: user.role };
        const token = jwt.sign(payload, config.jwtSecret, { expiresIn: config.jwtExpiresIn });

        return {
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        };
    }

    async banUser(id) {
        const user = await this.findById(id);
        if (!user) {
            throw new AppError('User not found', 404);
        }
        user.isBanned = true;
        await user.save();
        return user;
    }

    async approveUser(id) {
        const user = await User.findByIdAndUpdate(
            id,
            { isApproved: true },
            { new: true, runValidators: false }
        );
        if (!user) {
            throw new AppError('User not found', 404);
        }
        return user;
    }

    validateOwner(user) {
        if (!user || user.role !== ROLES.OWNER) {
            throw new AppError('Only owners can perform this action', 403);
        }
        if (user.isBanned) {
            throw new AppError('Your account is banned', 403);
        }
        if (!user.isApproved) {
            throw new AppError('Your account is not approved yet', 403);
        }
    }

    validateTenant(user) {
        if (!user || user.role !== ROLES.TENANT) {
            throw new AppError('Only tenants can perform this action', 403);
        }
        if (user.isBanned) {
            throw new AppError('Your account is banned', 403);
        }
        if (!user.isApproved) {
            throw new AppError('Your account is not approved yet', 403);
        }
    }

    validateAdmin(user) {
        if (!user || user.role !== ROLES.ADMIN) {
            throw new AppError('Only admins can perform this action', 403);
        }
    }

    validateVendor(user) {
        if (!user || user.role !== ROLES.VENDOR) {
            throw new AppError('Only vendors can perform this action', 403);
        }
        if (user.isBanned) {
            throw new AppError('Your account is banned', 403);
        }
        if (!user.isApproved) {
            throw new AppError('Your account is not approved yet', 403);
        }
    }
}

module.exports = new UserService();
