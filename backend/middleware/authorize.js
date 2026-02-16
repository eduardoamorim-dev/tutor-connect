/**
 * Authorization middleware for role-based access control
 */

const { hasPermission, isCoordinatorOf } = require("../config/roles");
const { AppError } = require("./errorHandler");
const userRepository = require("../repositories/userRepository");

/**
 * Middleware to check if user has required permission
 * Usage: authorize("APPROVE_HOURS")
 * Note: Must be used after authMiddleware (requires req.userId to be set)
 *
 * @param {string} permission - Permission key from PERMISSIONS in roles.js
 * @returns {Function} Express middleware function
 */
const authorize = (permission) => {
  return async (req, res, next) => {
    try {
      // Get user with all fields needed for permission checks
      const user = await userRepository.findById(req.userId);

      if (!user) {
        throw new AppError("Usuário não encontrado", 404);
      }

      // Check if user's role has the required permission
      if (!hasPermission(user.role, permission)) {
        throw new AppError("Acesso negado: você não tem permissão para esta ação", 403);
      }

      // Attach user to request for later use in route handlers
      req.user = user;
      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Middleware to check if user is coordinator of a specific program
 * Usage: authorizeCoordinator()
 * Expects req.params.programId or req.body.programId or req.query.programId
 * Admins bypass this check (can access all programs)
 *
 * @returns {Function} Express middleware function
 */
const authorizeCoordinator = () => {
  return async (req, res, next) => {
    try {
      // Get user with programas_coordenados populated
      const user = await userRepository.findById(req.userId);

      if (!user) {
        throw new AppError("Usuário não encontrado", 404);
      }

      // Admin users can access all programs
      if (user.role === "admin") {
        req.user = user;
        return next();
      }

      // Get program ID from request (params, body, or query)
      const programId = req.params.programId || req.body.programId || req.query.programId;

      if (!programId) {
        throw new AppError("ID do programa não fornecido", 400);
      }

      // Check if user is coordinator of this program
      if (!isCoordinatorOf(user, programId)) {
        throw new AppError("Acesso negado: você não é coordenador deste programa", 403);
      }

      req.user = user;
      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Middleware to check if user can approve hours for a specific registro
 * This is more specific than authorizeCoordinator - it checks the programa
 * associated with the specific hour registration
 *
 * @returns {Function} Express middleware function
 */
const authorizeHourApproval = () => {
  return async (req, res, next) => {
    try {
      const user = await userRepository.findById(req.userId);

      if (!user) {
        throw new AppError("Usuário não encontrado", 404);
      }

      // Admin can approve any hours
      if (user.role === "admin") {
        req.user = user;
        return next();
      }

      // Must be coordinator role
      if (user.role !== "coordinator") {
        throw new AppError("Apenas coordenadores podem aprovar horas", 403);
      }

      // Get the registro to check its program
      const registroId = req.params.id || req.body.registroId;
      if (!registroId) {
        throw new AppError("ID do registro não fornecido", 400);
      }

      const registroHorasRepository = require("../repositories/registroHorasRepository");
      const registro = await registroHorasRepository.findById(registroId);

      if (!registro) {
        throw new AppError("Registro de horas não encontrado", 404);
      }

      // Check if user is coordinator of the program
      if (!isCoordinatorOf(user, registro.programa._id || registro.programa)) {
        throw new AppError("Acesso negado: você não é coordenador deste programa", 403);
      }

      req.user = user;
      req.registro = registro; // Attach registro to avoid re-fetching in handler
      next();
    } catch (error) {
      next(error);
    }
  };
};

module.exports = {
  authorize,
  authorizeCoordinator,
  authorizeHourApproval,
};
