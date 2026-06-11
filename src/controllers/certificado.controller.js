const Certificado = require('../models/Certificado');
const AppError = require('../utils/AppError');
const { uploadBuffer } = require('../services/storage.service');


exports.uploadCertificado = async (req, res, next) => {
  try {
    const { alunoId } = req.params;

    if (!req.file) {
      return next(new AppError('Arquivo não enviado', 400));
    }

    const upload = await uploadBuffer(req.file, {
      folderParts: ['certificados', alunoId]
    });

    const certificado = await Certificado.create({
      aluno: alunoId,
      nomeArquivo: req.file.originalname,
      caminho: upload.url,
      tipoArquivo: req.file.mimetype,
      tamanhoBytes: upload.bytes || req.file.size,
      storageProvider: upload.provider,
      storageKey: upload.storageKey,
      resourceType: upload.resourceType,
      enviadoPor: req.user.id
    });

    res.status(201).json({
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