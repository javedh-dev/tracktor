import { Request, Response } from "express";
import * as pollutionCertificateService from "@services/pollutionCertificateService";

export const addPollutionCertificate = async (req: Request, res: Response) => {
  const { vehicleId } = req.params;
  const result = await pollutionCertificateService.addPollutionCertificate(
    vehicleId as string,
    req.body
  );
  res.status(201).json(result);
};

export const getPollutionCertificates = async (req: Request, res: Response) => {
  const { vehicleId } = req.params;
  const pollutionCertificates =
    await pollutionCertificateService.getPollutionCertificates(
      vehicleId as string
    );
  res.status(200).json(pollutionCertificates);
};

export const updatePollutionCertificate = async (
  req: Request,
  res: Response
) => {
  const { vehicleId, id } = req.params;
  const result = await pollutionCertificateService.updatePollutionCertificate(
    vehicleId as string,
    id as string,
    req.body
  );
  res.status(200).json(result);
};

export const deletePollutionCertificate = async (
  req: Request,
  res: Response
) => {
  const { id } = req.params;
  const result = await pollutionCertificateService.deletePollutionCertificate(
    id as string
  );
  res.status(200).json(result);
};
