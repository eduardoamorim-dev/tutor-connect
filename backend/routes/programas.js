const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const { authorize } = require("../middleware/authorize");
const { asyncHandler } = require("../middleware/errorHandler");
const { validate } = require("../middleware/validate");
const programaService = require("../services/programaService");
const {
  createProgramaSchema,
  updateProgramaSchema,
  assignCoordinatorSchema,
} = require("../config/schemas");

/**
 * @route   GET /programas
 * @desc    List all programs (public)
 * @access  Public
 */
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const { instituicaoId, nivel, ativo, page = 1, limit = 20 } = req.query;
    const result = await programaService.listProgramas({
      instituicaoId,
      nivel,
      ativo: ativo === "true" ? true : ativo === "false" ? false : undefined,
      page: parseInt(page),
      limit: parseInt(limit),
    });
    res.json(result);
  }),
);

/**
 * @route   GET /programas/coordenador/meus-programas
 * @desc    Get programs coordinated by current user
 * @access  Private (Coordinator or Admin)
 */
router.get(
  "/coordenador/meus-programas",
  authMiddleware,
  asyncHandler(async (req, res) => {
    const programas = await programaService.getProgramasByCoordinator(req.userId);
    res.json({ programas });
  }),
);

/**
 * @route   GET /programas/:id
 * @desc    Get program by ID (public)
 * @access  Public
 */
router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const programa = await programaService.getProgramaById(req.params.id);
    res.json({ programa });
  }),
);

/**
 * @route   POST /programas
 * @desc    Create new program
 * @access  Private (Admin only)
 */
router.post(
  "/",
  authMiddleware,
  authorize("CREATE_PROGRAM"),
  validate(createProgramaSchema),
  asyncHandler(async (req, res) => {
    const programa = await programaService.createPrograma(req.body);
    res.status(201).json({ programa });
  }),
);

/**
 * @route   PATCH /programas/:id
 * @desc    Update program
 * @access  Private (Coordinator or Admin)
 */
router.patch(
  "/:id",
  authMiddleware,
  authorize("UPDATE_PROGRAM"),
  validate(updateProgramaSchema),
  asyncHandler(async (req, res) => {
    const programa = await programaService.updatePrograma(req.params.id, req.body);
    res.json({ programa });
  }),
);

/**
 * @route   POST /programas/:id/coordenador
 * @desc    Assign coordinator to program
 * @access  Private (Admin only)
 */
router.post(
  "/:id/coordenador",
  authMiddleware,
  authorize("ASSIGN_COORDINATOR"),
  validate(assignCoordinatorSchema),
  asyncHandler(async (req, res) => {
    const programa = await programaService.assignCoordinator(req.params.id, req.body.userId);
    res.json({ programa });
  }),
);

module.exports = router;
