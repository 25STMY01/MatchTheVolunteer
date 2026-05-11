import { CONFIG } from '../config';
import {
  DAY_HEADER_MAP,
  DAYS,
  VOLUNTEER_HEADER_MAP,
  type Volunteer,
} from '../../types/volunteer';
import type { VolunteerRow } from '../../types/sheets';
import { getValueByHeaderMatch, rowToObject } from './utils';
import {
  openSpreadsheet,
  getSheet,
  getAllData,
  findHeaderRowIndex,
} from '../utils/sheets';
import { readVolunteerRowsFromLocalVolunteerXlsx } from './mock/readVolunteerSheetFromLocalXlsx';

function buildAvailabilities(row: VolunteerRow): Record<string, boolean> {
  return DAYS.reduce<Record<string, boolean>>((acc, day) => {
    const val = getValueByHeaderMatch(row, DAY_HEADER_MAP[day]);
    acc[day] = val.length > 0;
    return acc;
  }, {});
}

function volunteerRowToVolunteer(row: VolunteerRow): Volunteer {
  const area = getValueByHeaderMatch(row, VOLUNTEER_HEADER_MAP.area);
  const location = area ? `${area}, Singapore` : null;

  const get = (key: keyof typeof VOLUNTEER_HEADER_MAP): string =>
    getValueByHeaderMatch(row, VOLUNTEER_HEADER_MAP[key]) || '';

  return {
    sn: get('sn'),
    code: get('code'),
    location,

    staffRemarks: get('staffRemarks'),
    active: get('active'),
    reasonForStatus: get('reasonForStatus'),
    dateOfExit: get('dateOfExit'),
    reasonForExit: get('reasonForExit'),
    dateOfApplication: get('dateOfApplication'),
    residingRegion: get('residingRegion'),

    salutation: get('salutation'),
    givenName: get('givenName'),
    lastName: get('lastName'),
    email: get('email'),
    dateOfBirth: get('dateOfBirth'),
    contactNumber: get('contactNumber'),
    gender: get('gender'),
    ageRange: get('ageRange'),
    religion: get('religion'),
    area: get('area'),

    languagePreferenceForTraining: get('languagePreferenceForTraining'),
    volunteeringExperiences: get('volunteeringExperiences'),
    volunteerExperienceDetails: get('volunteerExperienceDetails'),
    trainingCourses: get('trainingCourses'),
    trainingCourseDetails: get('trainingCourseDetails'),
    spokenLanguages: get('spokenLanguages'),
    isFamilyCaregiver: get('isFamilyCaregiver'),
    lostSomeoneRecent: get('lostSomeoneRecent'),
    employmentStatus: get('employmentStatus'),

    availabilities: buildAvailabilities(row),

    appliesToMe: get('appliesToMe'),
    interestsHobbiesTalents: get('interestsHobbiesTalents'),
    volunteerOptions: get('volunteerOptions'),
    volunteerInvolvement: get('volunteerInvolvement'),

    emergencyContactName: get('emergencyContactName'),
    emergencyContactNumber: get('emergencyContactNumber'),
    emergencyContactRelationship: get('emergencyContactRelationship'),
    consentAcknowledgement: get('consentAcknowledgement'),
    mailingList: get('mailingList'),
    howDidYouFindUs: get('howDidYouFindUs'),
  };
}

/** Populated only in the long-lived Node local API process; unused on GAS (fresh context per run). */
let localVolunteerRepository: VolunteerRepository | null = null;

/**
 * Repository for volunteer data access.
 * Converts raw sheet data to VolunteerRow[] and maps to Volunteer with normalised field names.
 */
export class VolunteerRepository {
  spreadsheet: GoogleAppsScript.Spreadsheet.Spreadsheet | null;

  sheet: GoogleAppsScript.Spreadsheet.Sheet | null;

  data: VolunteerRow[];

  /**
   * Returns a repository: on GAS, always a new instance (constructor loads the sheet).
   * On local Node, reuses one instance per process so constructor (and spreadsheet/XLSX load) runs once.
   */
  static getVolunteerRepository(forceNew: boolean = false): VolunteerRepository {
    if (typeof SpreadsheetApp !== 'undefined') {
      return new VolunteerRepository();
    }
    if (!localVolunteerRepository || forceNew) {
      localVolunteerRepository = new VolunteerRepository();
    }
    return localVolunteerRepository;
  }

  private constructor() {
    if (typeof SpreadsheetApp !== 'undefined') {
      this.spreadsheet = openSpreadsheet(CONFIG.VOLUNTEER_SHEET_URL);
      this.sheet = getSheet(this.spreadsheet, CONFIG.VOLUNTEER_SHEET_NAME);
      const rawData = getAllData(this.sheet) as (string | number)[][];
      const headerRowIdx = findHeaderRowIndex(rawData, ['Code Number']);
      const headers = (rawData[headerRowIdx] ?? []).map((h) => String(h ?? ''));

      this.data = rawData
        .slice(headerRowIdx + 1)
        .filter((row) => row && row.some((c) => c != null && c !== ''))
        .map((row) => rowToObject<VolunteerRow>(headers, row));
    } else {
      this.spreadsheet = null;
      this.sheet = null;
      this.data = readVolunteerRowsFromLocalVolunteerXlsx();
    }
  }

  findByCode(code: string): Volunteer | null {
    const trimmedCode = code.trim();
    const row = this.data.find((r) => {
      const volunteerCode = getValueByHeaderMatch(r, VOLUNTEER_HEADER_MAP.code);
      return volunteerCode.trim() === trimmedCode;
    });
    if (!row) return null;
    return volunteerRowToVolunteer(row);
  }

  getAll(): Volunteer[] {
    return this.data
      .filter((row) => getValueByHeaderMatch(row, VOLUNTEER_HEADER_MAP.code))
      .map(volunteerRowToVolunteer);
  }
}
