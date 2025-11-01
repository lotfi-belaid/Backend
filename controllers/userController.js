const userModel = require('../models/userSchema')

//create new user
module.exports.createUser = async (req, res) => {
    try {
        const { name, email, password, phone, role } = req.body;
        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email already registered " })
        }
        const newUser = new userModel({ name, email, password, phone, role });
        await newUser.save();
        res.status(201).json({ newUser, message: "User created successfully" });

    }
    catch (error) {
        res.status(500).json({ message: "Server Error", error });
    }
}
//get all users
module.exports.getAllUsers = async (req, res) => {
    try {
        const users = await userModel.find();
        res.json(users);
    }
    catch (error) {
        res.status(500).json({ message: "Server Error", error });
    }
};
//get user by id
module.exports.getUserById = async (req, res) => {
    try {
        const user = await userModel.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json(user);
    }
    catch (error) {
        res.status(500).json({ message: "Server Error", error });

    }
};
//update by user id 
module.exports.updateUserById = async (req, res) => {
    try {
        const updated = await userModel.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!updated) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json({ message: "User updated successfully", updated });

    }
    catch (error) {
        res.status(500).json({ message: "Server Error", error });
    }
}
//delete user by id 
module.exports.deleteUserById = async (req, res) => {
    try {
        const deleted = await userModel.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ message: "User not found" });
        res.json({ message: "User deleted successfully", deleted });
    }
    catch (error) {
        res.status(500).json({ message: "Server Error", error });
    }
}
//login user 
module.exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await userModel.findOne({ email });
        if (!user) return res.status(400).json({ message: "Invalid email" });
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid password" });
        res.json({ message: "Login successful", user });

    }
    catch (error) {
        res.status(500).json({ message: "Server Error", error });
    }
}

