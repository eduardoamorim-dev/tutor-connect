const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const { authorize } = require("../middleware/authorize");
const { asyncHandler } = require("../middleware/errorHandler");
const { validate } = require("../middleware/validate");
const instituicaoService = require("../services/instituicaoService");
const { createInstituicaoSchema, updateInstituicaoSchema } = require("../config/schemas");

/**
 * @route   GET /instituicoes
 * @desc    List all institutions (public)
 * @access  Public
 */
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const { ativo, page = 1, limit = 20 } = req.query;
    const result = await instituicaoService.listInstituicoes({
      ativo: ativo === "true" ? true : ativo === "false" ? false : undefined,
      page: parseInt(page),
      limit: parseInt(limit),
    });
    res.json(result);
  }),
);

/**
 * @route   GET /instituicoes/:id
 * @desc    Get institution by ID (public)
 * @access  Public
 */
router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const instituicao = await instituicaoService.getInstituicaoById(req.params.id);
    res.json({ instituicao });
  }),
);

/**
 * @route   POST /instituicoes
 * @desc    Create new institution
 * @access  Private (Admin only)
 */
router.post(
  "/",
  authMiddleware,
  authorize("CREATE_INSTITUTION"),
  validate(createInstituicaoSchema),
  asyncHandler(async (req, res) => {
    const instituicao = await instituicaoService.createInstituicao(req.body);
    res.status(201).json({ instituicao });
  }),
);

/**
 * @route   PATCH /instituicoes/:id
 * @desc    Update institution
 * @access  Private (Admin only)
 */
router.patch(
  "/:id",
  authMiddleware,
  authorize("UPDATE_INSTITUTION"),
  validate(updateInstituicaoSchema),
  asyncHandler(async (req, res) => {
    const instituicao = await instituicaoService.updateInstituicao(req.params.id, req.body);
    res.json({ instituicao });
  }),
);

module.exports = router;
