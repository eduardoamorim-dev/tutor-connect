const PDFDocument = require("pdfkit");
const registroHorasRepository = require("../repositories/registroHorasRepository");
const userRepository = require("../repositories/userRepository");
const programaRepository = require("../repositories/programaRepository");
const { AppError } = require("../middleware/errorHandler");

const pdfService = {
  /**
   * Generate PDF report of hours for a tutor in a program
   *
   * @param {string} tutorId - The tutor user ID
   * @param {string} programId - The program ID
   * @returns {Buffer} PDF file as buffer
   */
  async generateHoursReport(tutorId, programId) {
    // Get tutor, program, and registros
    const tutor = await userRepository.findById(tutorId);
    const programa = await programaRepository.findByIdPopulated(programId);

    if (!tutor) {
      throw new AppError("Tutor não encontrado", 404);
    }

    if (!programa) {
      throw new AppError("Programa não encontrado", 404);
    }

    // Get all approved hours
    const registros = await registroHorasRepository.findByTutorAndProgram(tutorId, programId, {
      status: "aprovado",
    });

    if (registros.length === 0) {
      throw new AppError("Nenhuma hora aprovada encontrada para gerar relatório", 400);
    }

    const totalHoras = registros.reduce((sum, r) => sum + r.horas_registradas, 0);

    // Create PDF document
    const doc = new PDFDocument({ size: "A4", margin: 50 });
    const buffers = [];

    doc.on("data", buffers.push.bind(buffers));

    // Generate PDF content
    await new Promise((resolve, reject) => {
      doc.on("end", resolve);
      doc.on("error", reject);

      // Header
      doc.fontSize(20).font("Helvetica-Bold").text("Declaração de Horas-Aula", { align: "center" });
      doc.moveDown(1.5);

      // Institution info
      doc
        .fontSize(14)
        .font("Helvetica")
        .text(programa.instituicao.nome, { align: "center" })
        .fontSize(12)
        .text(programa.nome, { align: "center" });
      doc.moveDown(2);

      // Tutor info section
      doc.fontSize(14).font("Helvetica-Bold").text("Dados do Docente");
      doc.moveDown(0.5);

      doc
        .fontSize(11)
        .font("Helvetica")
        .text(`Nome: ${tutor.nome}`)
        .text(`Email: ${tutor.email}`)
        .text(`Nível Acadêmico: ${this._formatNivelAcademico(tutor.nivel_academico)}`);

      if (tutor.lattes_url) {
        doc.text(`Currículo Lattes: ${tutor.lattes_url}`);
      }

      if (tutor.orcid) {
        doc.text(`ORCID: ${tutor.orcid}`);
      }

      doc.moveDown(2);

      // Summary section
      doc.fontSize(14).font("Helvetica-Bold").text("Resumo de Horas Cumpridas");
      doc.moveDown(0.5);

      doc
        .fontSize(11)
        .font("Helvetica")
        .text(`Total de Horas Aprovadas: ${totalHoras.toFixed(2)}h`, {
          continued: false,
        });

      if (programa.horas_aula_obrigatorias) {
        doc.text(`Horas Obrigatórias: ${programa.horas_aula_obrigatorias.toFixed(2)}h`);
      }

      const dataInicio = this._formatDate(registros[registros.length - 1].data_sessao);
      const dataFim = this._formatDate(registros[0].data_sessao);
      doc.text(`Período: ${dataInicio} a ${dataFim}`);

      doc.moveDown(2);

      // Table of hours
      doc.fontSize(12).font("Helvetica-Bold").text("Detalhamento por Sessão");
      doc.moveDown(1);

      // Table header
      const tableTop = doc.y;
      const colWidths = [80, 200, 80, 80];
      const colX = [50, 130, 330, 410];

      doc
        .fontSize(9)
        .font("Helvetica-Bold")
        .text("Data", colX[0], tableTop, { width: colWidths[0] })
        .text("Disciplina", colX[1], tableTop, { width: colWidths[1] })
        .text("Horas", colX[2], tableTop, { width: colWidths[2] })
        .text("Status", colX[3], tableTop, { width: colWidths[3] });

      // Draw header underline
      doc
        .moveTo(50, doc.y + 5)
        .lineTo(510, doc.y + 5)
        .stroke();

      doc.moveDown(0.5);

      // Table rows
      doc.font("Helvetica");
      registros.forEach((registro) => {
        // Add new page if needed
        if (doc.y > 720) {
          doc.addPage();
        }

        const y = doc.y;
        doc
          .fontSize(8)
          .text(this._formatDate(registro.data_sessao), colX[0], y, {
            width: colWidths[0],
          })
          .text(this._truncate(registro.disciplina, 30), colX[1], y, {
            width: colWidths[1],
          })
          .text(`${registro.horas_registradas.toFixed(2)}h`, colX[2], y, {
            width: colWidths[2],
          })
          .text("Aprovado", colX[3], y, { width: colWidths[3] });

        doc.moveDown(0.7);
      });

      // Footer
      doc.moveDown(3);
      doc
        .fontSize(9)
        .font("Helvetica")
        .text(`Documento gerado em ${this._formatDate(new Date())} pelo sistema Tutor Connect`, {
          align: "center",
        });

      doc.moveDown(1);
      doc
        .fontSize(8)
        .text(
          "Este documento certifica as horas-aula realizadas e aprovadas pelo coordenador do programa.",
          { align: "center" },
        );

      // End document
      doc.end();
    });

    return Buffer.concat(buffers);
  },

  /**
   * Format date to Brazilian format (dd/MM/yyyy)
   */
  _formatDate(date) {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("pt-BR");
  },

  /**
   * Format academic level to readable Portuguese
   */
  _formatNivelAcademico(nivel) {
    const map = {
      graduacao: "Graduação",
      mestrado: "Mestrado",
      doutorado: "Doutorado",
      "pos-doutorado": "Pós-Doutorado",
    };
    return map[nivel] || nivel;
  },

  /**
   * Truncate string to max length
   */
  _truncate(str, maxLength) {
    if (!str) return "";
    if (str.length <= maxLength) return str;
    return str.substring(0, maxLength - 3) + "...";
  },
};

module.exports = pdfService;
