const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const { authorize, authorizeHourApproval } = require("../middleware/authorize");
const { asyncHandler, AppError } = require("../middleware/errorHandler");
const { validate } = require("../middleware/validate");
const hoursTrackingService = require("../services/hoursTrackingService");
const registroHorasRepository = require("../repositories/registroHorasRepository");
const pdfService = require("../services/pdfService");
const { approveHoursSchema, bulkApproveHoursSchema } = require("../config/schemas");

/**
 * @route   GET /horas/resumo
 * @desc    Get hour summary for authenticated tutor
 * @access  Private (Tutor, Coordinator, Admin)
 */
router.get(
  "/resumo",
  authMiddleware,
  authorize("VIEW_OWN_HOURS"),
  asyncHandler(async (req, res) => {
    const { programId } = req.query;

    if (!programId) {
      throw new AppError("programId é obrigatório", 400);
    }

    const summary = await hoursTrackingService.getTutorHoursSummary(req.userId, programId);
    res.json(summary);
  }),
);

/**
 * @route   GET /horas/meus-registros
 * @desc    Get all hour registrations for authenticated tutor
 * @access  Private (Tutor, Coordinator, Admin)
 */
router.get(
  "/meus-registros",
  authMiddleware,
  authorize("VIEW_OWN_HOURS"),
  asyncHandler(async (req, res) => {
    const { programId, status, page = 1, limit = 20 } = req.query;

    const result = await registroHorasRepository.findByTutorWithFilters(req.userId, {
      programId,
      status,
      page: parseInt(page),
      limit: parseInt(limit),
    });
    res.json(result);
  }),
);

/**
 * @route   GET /horas/programa/:programId
 * @desc    Get all hour registrations for a program (coordinator only)
 * @access  Private (Coordinator, Admin)
 */
router.get(
  "/programa/:programId",
  authMiddleware,
  authorize("VIEW_PROGRAM_HOURS"),
  asyncHandler(async (req, res) => {
    const { status, page = 1, limit = 50 } = req.query;

    const result = await registroHorasRepository.findByProgramWithFilters(req.params.programId, {
      status,
      page: parseInt(page),
      limit: parseInt(limit),
    });
    res.json(result);
  }),
);

/**
 * @route   GET /horas/pendentes
 * @desc    Get pending hours for coordinator to review
 * @access  Private (Coordinator, Admin)
 */
router.get(
  "/pendentes",
  authMiddleware,
  authorize("VIEW_PROGRAM_HOURS"),
  asyncHandler(async (req, res) => {
    const { page = 1, limit = 50 } = req.query;

    const result = await hoursTrackingService.getPendingHoursForCoordinator(req.userId, {
      page: parseInt(page),
      limit: parseInt(limit),
    });
    res.json(result);
  }),
);

/**
 * @route   POST /horas/:id/aprovar
 * @desc    Approve or reject hour registration
 * @access  Private (Coordinator, Admin)
 */
router.post(
  "/:id/aprovar",
  authMiddleware,
  authorizeHourApproval(),
  validate(approveHoursSchema),
  asyncHandler(async (req, res) => {
    const { aprovado, observacao } = req.body;

    const registro = await hoursTrackingService.approveHours(
      req.params.id,
      req.userId,
      aprovado,
      observacao,
    );
    res.json({ registro });
  }),
);

/**
 * @route   POST /horas/aprovar-lote
 * @desc    Bulk approve multiple hour registrations
 * @access  Private (Coordinator, Admin)
 */
router.post(
  "/aprovar-lote",
  authMiddleware,
  authorize("APPROVE_HOURS"),
  validate(bulkApproveHoursSchema),
  asyncHandler(async (req, res) => {
    const { registroIds } = req.body;

    const results = await hoursTrackingService.bulkApproveHours(registroIds, req.userId);
    res.json({ results });
  }),
);

/**
 * @route   GET /horas/exportar-pdf
 * @desc    Export hour report as PDF
 * @access  Private (Tutor, Coordinator, Admin)
 */
router.get(
  "/exportar-pdf",
  authMiddleware,
  authorize("EXPORT_HOURS_REPORT"),
  asyncHandler(async (req, res) => {
    const { programId } = req.query;

    if (!programId) {
      throw new AppError("programId é obrigatório", 400);
    }

    const pdfBuffer = await pdfService.generateHoursReport(req.userId, programId);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=relatorio-horas-${Date.now()}.pdf`);
    res.send(pdfBuffer);
  }),
);

/**
 * @route   GET /horas/:id
 * @desc    Get single hour registration details
 * @access  Private (Owner, Coordinator, Admin)
 */
router.get(
  "/:id",
  authMiddleware,
  authorize("VIEW_OWN_HOURS"),
  asyncHandler(async (req, res) => {
    const registro = await registroHorasRepository.findById(req.params.id);

    if (!registro) {
      throw new AppError("Registro de horas não encontrado", 404);
    }

    // Check if user is owner, coordinator, or admin
    if (
      registro.tutor._id.toString() !== req.userId &&
      req.user.role !== "coordinator" &&
      req.user.role !== "admin"
    ) {
      throw new AppError("Acesso negado", 403);
    }

    res.json({ registro });
  }),
);

module.exports = router;
