const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const userSchema = new mongoose.Schema({

    name: { type: String, required: true, trim: true },

    email: { type: String, required: true, unique: true, trim: true, lowercase: true, match: [/\S+@\S+\.\S+/, 'please fill a valid email address'] },

    phone: { type: String, required: true },

    password: {
        type: String, required: true, minlength: 8, match: [/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
            'Password must contain at least 8 characters, including uppercase, lowercase, number, and special character']
    },

    role: { type: String, enum: ["ADMIN", "OWNER", "TENANT", "VENDOR"], default: "TENANT" },
},
    { timestamps: true }
);
//hash the password before saving the user
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    }
    catch (error) {
        next(error);
    }
})

userSchema.post('save', function (doc, next) {
    console.log('new User created successfully:', doc);
    next();
});

const User = mongoose.model('User', userSchema);// it links the schema structure to the MongoDB collection (usually named users).
module.exports = User;//exporting the model to use it in other parts of the application.