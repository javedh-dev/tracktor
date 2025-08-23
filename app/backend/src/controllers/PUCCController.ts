import { Request, Response } from "express";
import * as pollutionCertificateService from "@services/pollutionCertificateService.js";
import { PollutionCertificateError } from "@exceptions/PollutionCertificateError.js";
import { Status } from "@exceptions/ServiceError.js";

export const addPollutionCertificate = async (req: Request, res: Response) => {
  const { vehicleId } = req.params;
  const { certificateNumber, issueDate, expiryDate, testingCenter } = req.body;

  if (!vehicleId) {
    throw new PollutionCertificateError(
      "Vehicle ID is required.",
      Status.BAD_REQUEST,
    );
  }
  if (!certificateNumber || !issueDate || !expiryDate || !testingCenter) {
    throw new PollutionCertificateError(
      "Certificate Number, Issue Date, Expiry Date, and Testing Center are required.",
      Status.BAD_REQUEST,
    );
  }

  const result = await pollutionCertificateService.addPollutionCertificate(
    vehicleId,
    req.body,
  );
  res.status(201).json(result);
};

export const getPollutionCertificates = async (req: Request, res: Response) => {
  const { vehicleId } = req.params;
  if (!vehicleId) {
    throw new PollutionCertificateError(
      "Vehicle ID is required.",
      Status.BAD_REQUEST,
    );
  }
  const pollutionCertificates =
    await pollutionCertificateService.getPollutionCertificates(vehicleId);
  res.status(200).json(pollutionCertificates);
};

export const updatePollutionCertificate = async (
  req: Request,
  res: Response,
) => {
  const { vehicleId, id } = req.params;
  const { certificateNumber, issueDate, expiryDate, testingCenter, notes } =
    req.body;

  if (!vehicleId || !id) {
    throw new PollutionCertificateError(
      "Vehicle ID and certificate ID are required.",
      Status.BAD_REQUEST,
    );
  }
  if (!certificateNumber || !issueDate || !expiryDate || !testingCenter) {
    throw new PollutionCertificateError(
      "Certificate Number, Issue Date, Expiry Date, and Testing Center are required.",
      Status.BAD_REQUEST,
    );
  }
  const result = await pollutionCertificateService.updatePollutionCertificate(
    vehicleId,
    id,
    req.body,
  );
  res.status(200).json(result);
};

export const deletePollutionCertificate = async (
  req: Request,
  res: Response,
) => {
  const { vehicleId } = req.params;
  if (!vehicleId) {
    throw new PollutionCertificateError(
      "Vehicle ID is required.",
      Status.BAD_REQUEST,
    );
  }
  const result =
    await pollutionCertificateService.deletePollutionCertificate(vehicleId);
  res.status(200).json(result);
};
