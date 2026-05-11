import { CONFIG } from "../config";
import type { Case } from "../../types/case";
import { CASE_HEADER_MAP } from "../../types/case";
import type { CaseRow } from "../../types/sheets";
import { findHeaderRowIndex, getAllData, getSheet, openSpreadsheet } from "../utils/sheets";
import { readCaseRowsFromLocalCaseXlsx } from "./mock/readCaseSheetFromLocalXlsx";
import { getValueByHeaderMatch, rowToObject } from "./utils";

function caseRowToCase(rowIndex: number, row: CaseRow): Case {
  const patientAddress = getValueByHeaderMatch(row, CASE_HEADER_MAP.patientAddress);
  const location = patientAddress ? `${patientAddress}, Singapore` : "";

  const get = (key: keyof typeof CASE_HEADER_MAP): string =>
    getValueByHeaderMatch(row, CASE_HEADER_MAP[key]) || "";

  return {
    id: String(rowIndex),
    sn: get("sn") || String(rowIndex),
    code: get("code"),
    location,

    registeredUnder: get("registeredUnder"),
    referralPartner: get("referralPartner"),
    designationOfReferringStaff: get("designationOfReferringStaff"),
    referringStaffName: get("referringStaffName"),
    referringStaffContactNumber: get("referringStaffContactNumber"),

    dateOfFirstContact: get("dateOfFirstContact"),
    fy: get("fy"),

    salutation: get("salutation"),
    givenName: get("givenName"),
    lastName: get("lastName"),
    primaryContactNumber: get("primaryContactNumber"),
    primaryContactType: get("primaryContactType"),
    secondaryContactNumber: get("secondaryContactNumber"),
    secondaryContactType: get("secondaryContactType"),
    email: get("email"),
    dateOfBirth: get("dateOfBirth"),
    stayWithPatient: get("stayWithPatient"),
    address: get("address"),
    unitNumber: get("unitNumber"),
    postalCode: get("postalCode"),
    ageAtReferral: get("ageAtReferral"),
    gender: get("gender"),
    maritalStatus: get("maritalStatus"),
    religion: get("religion"),
    employment: get("employment"),
    language1: get("language1"),
    language2: get("language2"),

    patientSalutation: get("patientSalutation"),
    patientGivenName: get("patientGivenName"),
    patientLastName: get("patientLastName"),
    patientRelationshipToClient: get("patientRelationshipToClient"),
    patientContactNumber: get("patientContactNumber"),
    patientBirthDate: get("patientBirthDate"),
    patientAgeAtReferral: get("patientAgeAtReferral"),
    patientGender: get("patientGender"),
    patientAddress: get("patientAddress"),
    patientUnitNumber: get("patientUnitNumber"),
    patientPostalCode: get("patientPostalCode"),
    patientLanguage1: get("patientLanguage1"),
    patientLanguage2: get("patientLanguage2"),
    patientDeceasedDate: get("patientDeceasedDate"),

    emergencyContactName: get("emergencyContactName"),
    emergencyContactForWho: get("emergencyContactForWho"),
    emergencyContactRelationship: get("emergencyContactRelationship"),
    emergencyContactNumber: get("emergencyContactNumber"),

    additionalInformation: get("additionalInformation"),
    careLead: get("careLead"),
    frtMember1: get("frtMember1"),
    frtMember2: get("frtMember2"),
    frtMember3: get("frtMember3"),
    frtMember4: get("frtMember4"),
    frtMember5: get("frtMember5"),
    skillBasedVolunteer1: get("skillBasedVolunteer1"),
    skillBasedVolunteer2: get("skillBasedVolunteer2"),
    skillBasedVolunteer3: get("skillBasedVolunteer3"),
    remarks: get("remarks"),
    closedDate: get("closedDate"),
    reasonForClosedCase: get("reasonForClosedCase"),
  };
}

/** Populated only in the long-lived Node local API process; unused on GAS (fresh context per run). */
let localCaseRepository: CaseRepository | null = null;

/**
 * Repository for case data access.
 * Converts raw sheet data to CaseRow[] and maps to Case with normalised field names.
 */
export class CaseRepository {
  spreadsheet: GoogleAppsScript.Spreadsheet.Spreadsheet | null;

  sheet: GoogleAppsScript.Spreadsheet.Sheet | null;

  data: CaseRow[];

  /**
   * Factory method to return a repository: on GAS, always a new instance (constructor loads the sheet).
   * On local Node, reuses one instance per process so constructor (and spreadsheet/XLSX load) runs once.
 */
  static getCaseRepository(forceNew: boolean = false): CaseRepository {
    if (typeof SpreadsheetApp !== 'undefined') {
      return new CaseRepository();
    }
    if (!localCaseRepository || forceNew) {
      localCaseRepository = new CaseRepository();
    }
    return localCaseRepository;
  }

  private constructor() {
    if (typeof SpreadsheetApp !== "undefined") {
      this.spreadsheet = openSpreadsheet(CONFIG.CASE_SHEET_URL);
      this.sheet = getSheet(this.spreadsheet, CONFIG.CASE_SHEET_NAME);
      const rawData = getAllData(this.sheet) as (string | number)[][];
      const headerRowIdx = findHeaderRowIndex(rawData, ["SN"]);
      const headers = (rawData[headerRowIdx] ?? []).map((h) => String(h ?? ""));

      this.data = rawData
        .slice(headerRowIdx + 1)
        .filter((row) => row && row.some((c) => c != null && c !== ""))
        .map((row) => rowToObject<CaseRow>(headers, row));
    } else {
      this.spreadsheet = null;
      this.sheet = null;
      this.data = readCaseRowsFromLocalCaseXlsx();
    }
  }

  findByRowIndex(rowIndex: number): Case | null {
    const dataIndex = rowIndex - 1;
    if (dataIndex < 0 || dataIndex >= this.data.length) {
      return null;
    }
    const row = this.data[dataIndex];
    if (!row || getValueByHeaderMatch(row, CASE_HEADER_MAP.sn) === "") {
      return null;
    }
    return caseRowToCase(rowIndex, row);
  }

  getAllCases(): Case[] {
    return this.data
      .map((row, i) => {
        const sn = getValueByHeaderMatch(row, CASE_HEADER_MAP.sn);
        const code = getValueByHeaderMatch(row, CASE_HEADER_MAP.code);
        if (!sn && !code) return null;
        return caseRowToCase(i + 1, row);
      })
      .filter((c): c is Case => c !== null);
  }
}
