function requireRole(...allowedRoles) {
    return (req, res, next) => {
      if (!allowedRoles.includes(req.user.rol)) {
        return res.status(403).json({ message: 'No tienes permiso para esta acción' });
      }
      next();
    };
  }
  
  module.exports = requireRole;
  