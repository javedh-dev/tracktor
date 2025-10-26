import { Request, Response } from "express";
import * as pollutionCertificateService from "@services/pollutionCertificateService";

export const addPucc = async (req: Request, res: Response) => {
  const { vehicleId } = req.params;
  const result = await pollutionCertificateService.addPollutionCertificate(
    vehicleId as string,
    req.body,
  );
  res.status(201).json(result);
};

// Alias for backward compatibility
export const addPollutionCertificate = addPucc;

export const getPuccs = async (req: Request, res: Response) => {
  const { vehicleId } = req.params;
  const pollutionCertificates =
    await pollutionCertificateService.getPollutionCertificates(
      vehicleId as string,
    );
  res.status(200).json(pollutionCertificates);
};

// Alias for backward compatibility
export const getPollutionCertificates = getPuccs;

export const getPuccById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const pollutionCertificate =
    await pollutionCertificateService.getPollutionCertificateById(id as string);
  res.status(200).json(pollutionCertificate);
};

export const updatePucc = async (req: Request, res: Response) => {
  const { vehicleId, id } = req.params;
  const result = await pollutionCertificateService.updatePollutionCertificate(
    vehicleId as string,
    id as string,
    req.body,
  );
  res.status(200).json(result);
};

// Alias for backward compatibility
export const updatePollutionCertificate = updatePucc;

export const deletePucc = async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await pollutionCertificateService.deletePollutionCertificate(
    id as string,
  );
  res.status(200).json(result);
};

// Alias for backward compatibility
export const deletePollutionCertificate = deletePucc;
