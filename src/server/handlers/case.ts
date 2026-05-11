import { Case } from "../../types/case";
import { CaseRepository } from "../repository/CaseRepository";

export function getCasesList(): Case[] {
  try {
    const repository = CaseRepository.getCaseRepository();
    return repository.getAllCases()
  } catch (error) {
    throw new Error(`Error getting cases: ${(error as Error).toString()}`);
  }
}
