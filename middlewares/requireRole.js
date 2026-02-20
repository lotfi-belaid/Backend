module.exports = (...allowedRoles) => {
  return (req, res, next) => {
    const role = req.user?.role;
    if (!role || !allowedRoles.includes(role)) {
      return res.status(403).json({
        success: false,
        error: {
          code: "FORBIDDEN",
          message: "You are not allowed to access this resource",
          details: null,
        },
      });
    }
    next();
  };
};
