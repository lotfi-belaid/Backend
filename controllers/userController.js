const userModel = require('../models/userSchema');
const Unit = require('../models/unitSchema');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const passwordPolicy=/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
/* Create Users by role Tenant, Owner, Vendor, Admin */

// Create Admin
module.exports.createAdmin = async (req, res) => {
    try {
        const { name, email, password, phone, adminLevel } = req.body;
        if (!passwordPolicy.test(password))
            return res.status(400).json({ message: 'Password must contain at least 8 characters, including uppercase, lowercase, number, and special character' });

        const existing = await userModel.findOne({ email });
        if (existing) return res.status(400).json({ message: 'Email already registered' });

        const newUser = new userModel({ name, email, phone, password, role: 'ADMIN', adminLevel });
        await newUser.save();

        res.status(201).json({ newUser, message: 'Admin created successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};
// Create Owner
module.exports.createOwnerWithImg = async (req, res) => {
    try {
        const {
            name,
            email,
            password,
            phone,
            companyName,
            bankIBAN,
            totalProperties,
        } = req.body;
        if (!passwordPolicy.test(password))
            return res.status(400).json({ message: 'Password must contain at least 8 characters, including uppercase, lowercase, number, and special character' });

        const userData = {
            name,
            email,
            password,
            phone,
            role: 'OWNER',
            ownerCompanyName: companyName,
            ownerBankIBAN: bankIBAN,
            ownerTotalProperties: Number(totalProperties ?? 0),
        };

        if (req.file) {
            userData.image_User = req.file.filename;
        }

        const newUser = new userModel(userData);
        await newUser.save();
        res.status(201).json({ newUser, message: 'Owner created successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
// Create Tenant
module.exports.createTenantWithImg = async (req, res) => {
    try {
        const {
            name,
            email,
            password,
            phone,
            birthDate,
            employment,
            monthlyIncome,
        } = req.body;
        if (!passwordPolicy.test(password))
            return res.status(400).json({ message: 'Password must contain at least 8 characters, including uppercase, lowercase, number, and special character' });

        const userData = {
            name,
            email,
            password,
            phone,
            role: 'TENANT',
            tenantBirthDate: birthDate,
            tenantEmployment: employment,
            tenantMonthlyIncome: monthlyIncome,
        };

        if (req.file) {
            userData.image_User = req.file.filename;
        }

        const newUser = new userModel(userData);
        await newUser.save();
        res.status(201).json({ newUser, message: 'Tenant created successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

// Create Vendor
module.exports.createVendorWithImg = async (req, res) => {
    try {
        const {
            name,
            email,
            password,
            phone,
            vendorServiceType,
            vendorLicenceNumber,
            vendorAvailability,
        } = req.body;
        if (!passwordPolicy.test(password))
            return res.status(400).json({ message: 'Password must contain at least 8 characters, including uppercase, lowercase, number, and special character' });

        const userData = {
            name,
            email,
            password,
            phone,
            role: 'VENDOR',
            vendorServiceType,
            vendorLicenceNumber,
            vendorAvailability: vendorAvailability ?? true,
        };

        if (req.file) {
            userData.image_User = req.file.filename;
        }

        const newUser = new userModel(userData);
        await newUser.save();
        res.status(201).json({ newUser, message: 'Vendor created successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
//Get All Users
module.exports.getAllUsers = async (req, res) => {
    try {
        const users = await userModel.find();
        res.json(users);
    }
    catch (error) {
        res.status(500).json({ message: "Server Error", error });
    }
};
// Get User By id
module.exports.getUserById = async (req, res) => {
    try {
        const {id}=req.params;
        const user = await userModel.findById(id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json(user);
    }
    catch (error) {
        res.status(500).json({ message: "Server Error", error });

    }
};
// Get User By role
module.exports.getUsersByRole = async (req, res) => {
    try {
        const { role } = req.params;

        if (!role)
            return res.status(400).json({ message: 'Missing role information. Please choose a user role (e.g., TENANT, OWNER, ADMIN, or VENDOR)' });

        const users = await userModel.find({ role });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};
// Update User By id
module.exports.updateUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, phone,image_user } = req.body;
        const users = await userModel.findByIdAndUpdate(id, { name, phone,image_user })// to return the updated document;
        if (!users) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json({ message: "User updated successfully", users });

    }
    catch (error) {
        res.status(500).json({ message: "Server Error", error });
    }
}
// Delete User By id
module.exports.deleteUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await userModel.findByIdAndDelete(id);
        if (!deleted) return res.status(404).json({ message: "User not found" });
        res.json({ message: "User deleted successfully", deleted });
    }
    catch (error) {
        res.status(500).json({ message: "Server Error", error });
    }
}
//login User
module.exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await userModel.findOne({ email });
        if (!user) return res.status(400).json({ message: "Invalid email" });
        // Check if banned
        if (user.isBanned) {
            return res.status(403).json({ message: 'Your account has been banned. Please contact support.' });
        }

        // Check if not yet approved
        if (!user.isApproved) {
            return res.status(403).json({ message: 'Your account is awaiting approval by the admin.' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid password" });
        const payload={
            id:user._id,
            role:user.role,
        }
        const token=jwt.sign(payload,process.env.SECRET_JWT,{expiresIn:'7h'});
        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    }
    catch (error) {
        res.status(500).json({ message: "Server Error", error });
    }
};
//search Users by name
module.exports.search = async (req, res) => {
    try {
        const { name } = req.body;
        const users = await userModel.find({ name: { $regex: name, $options: 'i' } });
        res.status(200).json(users);
    }
    catch (error) {
        res.status(500).json({ message: "Server Error", error });
    }
};


