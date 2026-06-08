const Certificado = require('../models/Certificado');
const Aluno = require('../models/Aluno');
const AppError = require('../utils/AppError');
const { enviarEmail } = require('../services/email.service');


exports.uploadCertificado = async (req, res, next) => {
  try {
    const { alunoId } = req.params;

    if (!req.file) {
      return next(new AppError('Arquivo não enviado', 400));
    }

    const certificado = await Certificado.create({
      aluno: alunoId,
      nomeArquivo: req.file.originalname,
      caminho: `/uploads/${req.file.filename}`,
      enviadoPor: req.user.id
    });

    
    const aluno = await Aluno.findById(alunoId);

    if (aluno?.email) {
      await enviarEmail({
        to: aluno.email,
        subject: 'Certificado enviado com sucesso',
        text: `Olá ${aluno.nome},
        
              Seu certificado foi enviado com sucesso.

              Status: EM ANÁLISE

              Você será notificado quando houver atualização.
        `
      });
    }

    return res.status(201).json({
      message: 'Certificado enviado com sucesso',
      certificado
    });

  } catch (error) {
    next(error);
  }
};


exports.listarPorAluno = async (req, res, next) => {
  try {
    const { alunoId } = req.params;

    const certificados = await Certificado.find({ aluno: alunoId });

    res.status(200).json(certificados);
  } catch (error) {
    next(error);
  }
};


exports.deletarCertificado = async (req, res, next) => {
  try {
    const { id } = req.params;

    const certificado = await Certificado.findByIdAndDelete(id);

    if (!certificado) {
      return next(new AppError('Certificado não encontrado', 404));
    }

    res.status(200).json({
      message: 'Certificado deletado com sucesso'
    });
  } catch (error) {
    next(error);
  }
};

exports.aprovarCertificado = async (req, res, next) => {
  try {
    const { id } = req.params;

    const certificado = await Certificado.findByIdAndUpdate(
      id,
      { status: 'APROVADO' },
      { new: true }
    ).populate('aluno');

    if (!certificado) {
      return next(new AppError('Certificado não encontrado', 404));
    }

    const aluno = certificado.aluno;

    if (aluno?.email) {
      await enviarEmail({
        to: aluno.email,
        subject: 'Certificado aprovado',
        text: `Olá ${aluno.nome},

Seu certificado foi APROVADO com sucesso.

Parabéns! Sua atividade foi validada.`
      });
    }

    return res.status(200).json({
      message: 'Certificado aprovado com sucesso',
      certificado
    });

  } catch (error) {
    next(error);
  }
};

exports.reprovarCertificado = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { motivo } = req.body;

    const certificado = await Certificado.findByIdAndUpdate(
      id,
      { status: 'REPROVADO', motivo },
      { new: true }
    ).populate('aluno');

    if (!certificado) {
      return next(new AppError('Certificado não encontrado', 404));
    }

    const aluno = certificado.aluno;

    if (aluno?.email) {
      await enviarEmail({
        to: aluno.email,
        subject: 'Certificado reprovado',
        text: `Olá ${aluno.nome},

Seu certificado foi REPROVADO.

Motivo: ${motivo}

Procure o coordenador para mais informações.`
      });
    }

    return res.status(200).json({
      message: 'Certificado reprovado com sucesso',
      certificado
    });

  } catch (error) {
    next(error);
  }
};