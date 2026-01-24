module.exports = {
    ROLES: {
        ADMIN: 'ADMIN',
        OWNER: 'OWNER',
        TENANT: 'TENANT',
        VENDOR: 'VENDOR'
    },
    UNIT_STATUS: {
        AVAILABLE: 'AVAILABLE',
        OCCUPIED: 'OCCUPIED'
    },
    LEASE_STATUS: {
        ACTIVE: 'ACTIVE',
        TERMINATED: 'TERMINATED'
    },
    TERMINATION_STATUS: {
        NONE: 'NONE',
        REQUESTED: 'REQUESTED',
        APPROVED: 'APPROVED',
        REJECTED: 'REJECTED'
    },
    INVOICE_STATUS: {
        UNPAID: 'UNPAID',
        PAID: 'PAID'
    },
    MAINTENANCE_STATUS: {
        OPEN: 'OPEN',
        IN_PROGRESS: 'IN_PROGRESS',
        DONE: 'DONE'
    },
    PASSWORD_REGEX: /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/,
    PASSWORD_MESSAGE: 'Password must contain at least 8 characters, including uppercase, lowercase, number, and special character'
};
