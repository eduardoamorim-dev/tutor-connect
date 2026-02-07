const userRepository = require("../repositories/userRepository");
const sessaoRepository = require("../repositories/sessaoRepository");
const { AppError } = require("../middleware/errorHandler");
const logger = require("../config/logger");

// Converte data (YYYY-MM-DD) e horário (HH:MM) para Date UTC
function toUTCDate(ano, mes, dia, hora, minuto) {
  return new Date(Date.UTC(ano, mes - 1, dia, hora, minuto, 0, 0));
}

const availabilityService = {
  async addSlot(userId, data, horarioInicio, horarioFim) {
    if (!data || !horarioInicio || !horarioFim) {
      throw new AppError("Todos os campos são obrigatórios", 400);
    }

    const user = await userRepository.findByIdFull(userId);

    if (!user || !user.isTutor) {
      throw new AppError("Apenas tutores podem adicionar disponibilidade", 400);
    }

    const [ano, mes, dia] = data.split("-").map(Number);
    const [horaInicio, minutoInicio] = horarioInicio.split(":").map(Number);
    const [horaFim, minutoFim] = horarioFim.split(":").map(Number);

    const dataHoraInicio = toUTCDate(ano, mes, dia, horaInicio, minutoInicio);
    const dataHoraFim = toUTCDate(ano, mes, dia, horaFim, minutoFim);
    const agora = new Date();

    if (dataHoraInicio < agora) {
      throw new AppError("Não é possível adicionar disponibilidade para data/hora que já passou", 400);
    }

    if (dataHoraFim <= dataHoraInicio) {
      throw new AppError("O horário de fim deve ser depois do horário de início", 400);
    }

    // Verificar conflito
    const conflito = user.disponibilidade.some((d) => {
      const dataExistente = new Date(d.data);
      const anoExist = dataExistente.getUTCFullYear();
      const mesExist = dataExistente.getUTCMonth() + 1;
      const diaExist = dataExistente.getUTCDate();

      const mesmoDia = anoExist === ano && mesExist === mes && diaExist === dia;
      if (!mesmoDia) return false;

      const [hIniExist, mIniExist] = d.horario_inicio.split(":").map(Number);
      const [hFimExist, mFimExist] = d.horario_fim.split(":").map(Number);

      const inicioExistMin = hIniExist * 60 + mIniExist;
      const fimExistMin = hFimExist * 60 + mFimExist;
      const inicioNovoMin = horaInicio * 60 + minutoInicio;
      const fimNovoMin = horaFim * 60 + minutoFim;

      return inicioNovoMin < fimExistMin && fimNovoMin > inicioExistMin;
    });

    if (conflito) {
      throw new AppError("Já existe uma disponibilidade neste horário", 400);
    }

    const dataParaSalvar = new Date(Date.UTC(ano, mes - 1, dia, 12, 0, 0, 0));

    user.disponibilidade.push({
      data: dataParaSalvar,
      horario_inicio: horarioInicio,
      horario_fim: horarioFim,
    });

    await user.save();

    logger.info(`Disponibilidade adicionada para usuario ${userId}`);

    return {
      message: "Disponibilidade adicionada",
      disponibilidade: user.disponibilidade,
    };
  },

  async getAvailableSlots(tutorId) {
    const tutor = await userRepository.findByIdFull(tutorId);

    if (!tutor || !tutor.isTutor) {
      throw new AppError("Tutor não encontrado", 404);
    }

    const agora = new Date();

    const disponibilidadesFuturas = tutor.disponibilidade.filter((d) => {
      const dataDisp = new Date(d.data);
      const anoDisp = dataDisp.getUTCFullYear();
      const mesDisp = dataDisp.getUTCMonth() + 1;
      const diaDisp = dataDisp.getUTCDate();

      const [horaFim, minFim] = d.horario_fim.split(":").map(Number);
      const dataHoraFim = toUTCDate(anoDisp, mesDisp, diaDisp, horaFim, minFim);

      return dataHoraFim > agora;
    });

    disponibilidadesFuturas.sort((a, b) => new Date(a.data) - new Date(b.data));

    const sessoesAgendadas = await sessaoRepository.findByTutorFuture(tutorId);

    const disponibilidadesComStatus = disponibilidadesFuturas.map((d) => {
      const dataDisp = new Date(d.data);
      const anoDisp = dataDisp.getUTCFullYear();
      const mesDisp = dataDisp.getUTCMonth() + 1;
      const diaDisp = dataDisp.getUTCDate();

      const [horaInicioDisp, minInicioDisp] = d.horario_inicio.split(":").map(Number);
      const [horaFimDisp, minFimDisp] = d.horario_fim.split(":").map(Number);

      const inicioSlot = toUTCDate(anoDisp, mesDisp, diaDisp, horaInicioDisp, minInicioDisp);
      const fimSlot = toUTCDate(anoDisp, mesDisp, diaDisp, horaFimDisp, minFimDisp);

      const jaAgendado = sessoesAgendadas.some((s) => {
        const inicioSessao = new Date(s.data_hora_inicio);
        const fimSessao = new Date(s.data_hora_fim);

        const mesmoDia =
          inicioSessao.getUTCFullYear() === anoDisp &&
          inicioSessao.getUTCMonth() + 1 === mesDisp &&
          inicioSessao.getUTCDate() === diaDisp;

        if (!mesmoDia) return false;
        return inicioSessao < fimSlot && fimSessao > inicioSlot;
      });

      return { ...d.toObject(), jaAgendado };
    });

    return disponibilidadesComStatus;
  },

  async removeSlot(userId, slotId) {
    const user = await userRepository.findByIdFull(userId);

    if (!user) {
      throw new AppError("Usuário não encontrado", 404);
    }

    const disponibilidadeIndex = user.disponibilidade.findIndex(
      (d) => d._id.toString() === slotId,
    );

    if (disponibilidadeIndex === -1) {
      throw new AppError("Disponibilidade não encontrada", 404);
    }

    const disp = user.disponibilidade[disponibilidadeIndex];
    const dataDisp = new Date(disp.data);
    const anoDisp = dataDisp.getUTCFullYear();
    const mesDisp = dataDisp.getUTCMonth() + 1;
    const diaDisp = dataDisp.getUTCDate();

    const [horaInicio, minInicio] = disp.horario_inicio.split(":").map(Number);
    const [horaFim, minFim] = disp.horario_fim.split(":").map(Number);

    const inicioSlot = toUTCDate(anoDisp, mesDisp, diaDisp, horaInicio, minInicio);
    const fimSlot = toUTCDate(anoDisp, mesDisp, diaDisp, horaFim, minFim);

    const sessaoExistente = await sessaoRepository.findConflicting(userId, inicioSlot, fimSlot);

    if (sessaoExistente) {
      throw new AppError("Não é possível remover esta disponibilidade pois há uma sessão agendada neste horário", 400);
    }

    user.disponibilidade.splice(disponibilidadeIndex, 1);
    await user.save();

    return {
      message: "Disponibilidade removida",
      disponibilidade: user.disponibilidade,
    };
  },
};

module.exports = availabilityService;
