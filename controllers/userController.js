const userService = require("../services/userService");
const authService = require("../services/authService");

// Create Admin
module.exports.createAdmin = async (req, res) => {
    try {
        const { name, email, password, phone, adminLevel } = req.body;
        const newUser = await userService.createUser({ name, email, password, phone, role: 'ADMIN', adminLevel });
        res.status(201).json({ newUser, message: 'Admin created successfully' });
    } catch (error) {
        res.status(error.status || 500).json({ message: error.message || "Server Error", error });
    }
};

// Create Owner
module.exports.createOwnerWithImg = async (req, res) => {
    try {
        const { name, email, password, phone, companyName, bankIBAN, totalProperties } = req.body;
        const userData = {
            name, email, password, phone, role: 'OWNER',
            ownerCompanyName: companyName,
            ownerBankIBAN: bankIBAN,
            ownerTotalProperties: Number(totalProperties ?? 0),
        };
        if (req.file) userData.image_user = req.file.filename;

        const newUser = await userService.createUser(userData);
        res.status(201).json({ newUser, message: 'Owner created successfully' });
    } catch (error) {
        res.status(error.status || 500).json({ message: error.message || "Server Error", error });
    }
};

// Create Tenant
module.exports.createTenantWithImg = async (req, res) => {
    try {
        const { name, email, password, phone, birthDate, employment, monthlyIncome } = req.body;
        const userData = {
            name, email, password, phone, role: 'TENANT',
            tenantBirthDate: birthDate,
            tenantEmployment: employment,
            tenantMonthlyIncome: monthlyIncome,
        };
        if (req.file) userData.image_user = req.file.filename;

        const newUser = await userService.createUser(userData);
        res.status(201).json({ newUser, message: 'Tenant created successfully' });
    } catch (error) {
        res.status(error.status || 500).json({ message: error.message || "Server Error", error });
    }
};

// Create Vendor
module.exports.createVendorWithImg = async (req, res) => {
    try {
        const { name, email, password, phone, vendorServiceType, vendorLicenceNumber, vendorAvailability } = req.body;
        const userData = {
            name, email, password, phone, role: 'VENDOR',
            vendorServiceType, vendorLicenceNumber,
            vendorAvailability: vendorAvailability ?? true,
        };
        if (req.file) userData.image_user = req.file.filename;

        const newUser = await userService.createUser(userData);
        res.status(201).json({ newUser, message: 'Vendor created successfully' });
    } catch (error) {
        res.status(error.status || 500).json({ message: error.message || "Server Error", error });
    }
};

//Get All Users
module.exports.getAllUsers = async (req, res) => {
    try {
        const users = await userService.getAllUsers();
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error });
    }
};

// Get User By id
module.exports.getUserById = async (req, res) => {
    try {
        const user = await userService.getUserById(req.params.id);
        res.json(user);
    } catch (error) {
        res.status(error.status || 500).json({ message: error.message || "Server Error", error });
    }
};

// Get User By role
module.exports.getUsersByRole = async (req, res) => {
    try {
        const users = await userService.getUsersByRole(req.params.role);
        res.json(users);
    } catch (error) {
        res.status(error.status || 500).json({ message: error.message || "Server Error", error });
    }
};

// Update User By id
module.exports.updateUserById = async (req, res) => {
    try {
        const { name, phone, image_user } = req.body;
        const users = await userService.updateUserById(req.params.id, { name, phone, image_user });
        res.json({ message: "User updated successfully", users });
    } catch (error) {
        res.status(error.status || 500).json({ message: error.message || "Server Error", error });
    }
};

// Delete User By id
module.exports.deleteUserById = async (req, res) => {
    try {
        const deleted = await userService.deleteUserById(req.params.id);
        res.json({ message: "User deleted successfully", deleted });
    } catch (error) {
        res.status(error.status || 500).json({ message: error.message || "Server Error", error });
    }
};

//login User
module.exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const result = await authService.login(email, password);
        res.json({ message: 'Login successful', ...result });
    } catch (error) {
        res.status(error.status || 500).json({ message: error.message || "Server Error", error });
    }
};

//search Users by name
module.exports.search = async (req, res) => {
    try {
        const name = req.query.name || req.body?.name || "";
        const users = await userService.searchUsersByName(name);
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: "Server Error", error });
    }
};
