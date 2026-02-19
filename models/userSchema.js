const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const passwordPolicy = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
const userSchema = new mongoose.Schema({

    name: { type: String, required: true, trim: true },

    email: { type: String, required: true, unique: true, trim: true, lowercase: true, match: [/\S+@\S+\.\S+/, 'please fill a valid email address'] },

    phone: { type: String, required: true },
    image_user: { type: String, default: "client.png" },

    password: {
        type: String, required: true, minlength: 8,
    },

    role: { type: String, enum: ["ADMIN", "OWNER", "TENANT", "VENDOR"], default: "TENANT" },

    //admin attributes
    adminLevel: {
        type: String,
        trim: true,
        required: function () {
            return this.role === 'ADMIN';
        }
    },

    //owner attributes
    ownerCompanyName: {
        type: String,
        required: function () {
            return this.role === 'OWNER';
        },
        trim: true,
    },
    ownerBankIBAN: {
        type: String,
        trim: true,
        validate: {
            validator: function (v) {
                const clean = v.replace(/\s+/g, '');
                return /^[A-Z]{2}[0-9A-Z ]{10,}$/.test(clean);
            },
            message: 'Invalid IBAN format',
        },
    },
    ownerTotalProperties: {
        type: Number,

        min: 0,
        validate: {
            validator: Number.isInteger,
            message: 'Total properties must be an Number',
        },
        required: function () {
            return this.role === 'OWNER';
        },
    },
    //tenant attributes
    tenantBirthDate: { type: Date },
    tenantEmployment: { type: String, trim: true },
    tenantMonthlyIncome: {
        type: Number,
        min: 0,
    },
    tenantCurrentLeaseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lease',
    },
    //vendor attributes
    vendorServiceType: {
        type: String,
        required: function () {
            return this.role === 'VENDOR';
        },
        trim: true,
    },
    vendorLicenceNumber: { type: String, trim: true },
    vendorAvailability: {
        type: Boolean,
        required: function () {
            return this.role === 'VENDOR';
        },
    },

    // account control flags
    isBanned: { type: Boolean, default: false },
    isApproved: { type: Boolean, default: false },
},
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

// Virtual for Owner's Properties
userSchema.virtual('properties', {
    ref: 'Property',
    localField: '_id',
    foreignField: 'ownerId'
});

// Virtual for Tenant's Leases (History)
userSchema.virtual('leases', {
    ref: 'Lease',
    localField: '_id',
    foreignField: 'tenantId'
});

// Virtual for Vendor's Assigned Maintenance
userSchema.virtual('assignedMaintenance', {
    ref: 'Maintenance',
    localField: '_id',
    foreignField: 'vendorId'
});

// clean up non-role specific fields before saving
userSchema.pre('validate', function (next) {
    const role = this.role;

    const ADMIN_FIELDS = ['adminLevel'];
    const OWNER_FIELDS = ['ownerCompanyName', 'ownerBankIBAN', 'ownerTotalProperties'];
    const TENANT_FIELDS = ['tenantBirthDate', 'tenantEmployment', 'tenantMonthlyIncome', 'tenantCurrentLeaseId'];
    const VENDOR_FIELDS = ['vendorServiceType', 'vendorLicenceNumber', 'vendorAvailability'];

    const keep = {
        ADMIN: ADMIN_FIELDS,
        OWNER: OWNER_FIELDS,
        TENANT: TENANT_FIELDS,
        VENDOR: VENDOR_FIELDS,
    }[role] || [];//default case to empty array if role doesn't match any known roles

    const allRoleKeys = [...ADMIN_FIELDS, ...OWNER_FIELDS, ...TENANT_FIELDS, ...VENDOR_FIELDS];
    for (const key of allRoleKeys) {
        if (!keep.includes(key)) this[key] = undefined;
    }

    next();
});
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
//hide password and __v when converting to JSON
userSchema.set('toJSON', {
    virtuals: true, // ensure virtuals are included
    transform: (_, ret) => {
        delete ret.password;//removing password from the response
        delete ret.__v;//removing __v from the response
        return ret;
    },
});

userSchema.post('save', function (doc, next) {
    console.log('new User created successfully:', doc);
    next();
});

const User = mongoose.model('User', userSchema);// it links the schema structure to the MongoDB collection (usually named users).
module.exports = User;//exporting the model to use it in other parts of the application.