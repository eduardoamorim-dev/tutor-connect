/**
 * Role-based Access Control Configuration
 * Defines roles, permissions, and helper functions for authorization
 */

const ROLES = {
  STUDENT: "student",
  TUTOR: "tutor",
  COORDINATOR: "coordinator",
  ADMIN: "admin",
};

/**
 * Permission mappings to roles
 * Each permission lists which roles can perform that action
 */
const PERMISSIONS = {
  // Session permissions
  CREATE_SESSION: ["student", "tutor", "coordinator", "admin"],
  CONFIRM_SESSION: ["tutor", "coordinator", "admin"],
  COMPLETE_SESSION: ["student", "tutor", "coordinator", "admin"],
  CANCEL_SESSION: ["student", "tutor", "coordinator", "admin"],

  // Hour tracking permissions
  VIEW_OWN_HOURS: ["tutor", "coordinator", "admin"],
  VIEW_PROGRAM_HOURS: ["coordinator", "admin"],
  APPROVE_HOURS: ["coordinator", "admin"],
  REJECT_HOURS: ["coordinator", "admin"],
  EXPORT_HOURS_REPORT: ["tutor", "coordinator", "admin"],

  // Institution/Program management
  CREATE_INSTITUTION: ["admin"],
  UPDATE_INSTITUTION: ["admin"],
  CREATE_PROGRAM: ["admin"],
  UPDATE_PROGRAM: ["coordinator", "admin"],
  ASSIGN_COORDINATOR: ["admin"],

  // User management
  UPDATE_USER_ROLE: ["admin"],
  VIEW_ALL_USERS: ["coordinator", "admin"],
  UPDATE_ACADEMIC_PROFILE: ["student", "tutor", "coordinator", "admin"], // Anyone can update own profile
};

/**
 * Check if a user role has a specific permission
 * @param {string} userRole - The role of the user
 * @param {string} permission - The permission to check (key from PERMISSIONS)
 * @returns {boolean} - True if role has permission
 */
function hasPermission(userRole, permission) {
  const allowedRoles = PERMISSIONS[permission];
  return allowedRoles && allowedRoles.includes(userRole);
}

/**
 * Check if a user is a coordinator of a specific program
 * @param {Object} user - The user object (must include programas_coordenados field)
 * @param {string|ObjectId} programId - The program ID to check
 * @returns {boolean} - True if user is coordinator of the program
 */
function isCoordinatorOf(user, programId) {
  if (user.role !== ROLES.COORDINATOR && user.role !== ROLES.ADMIN) {
    return false;
  }

  // Admins are coordinators of all programs
  if (user.role === ROLES.ADMIN) {
    return true;
  }

  // Check if program is in user's coordinated programs
  return user.programas_coordenados?.some((p) => p.toString() === programId.toString());
}

/**
 * Get all permissions for a role
 * @param {string} role - The role to get permissions for
 * @returns {Array<string>} - Array of permission keys
 */
function getRolePermissions(role) {
  const permissions = [];
  for (const [permission, roles] of Object.entries(PERMISSIONS)) {
    if (roles.includes(role)) {
      permissions.push(permission);
    }
  }
  return permissions;
}

module.exports = {
  ROLES,
  PERMISSIONS,
  hasPermission,
  isCoordinatorOf,
  getRolePermissions,
};
