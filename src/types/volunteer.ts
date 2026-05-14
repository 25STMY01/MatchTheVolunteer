/**
 * Volunteer data model with normalised camelCase field names.
 * Mapping from sheet headers (VolunteerRow) is done in the repository layer.
 * Day columns (Monday–Sunday) are converted to availabilities map.
 */

export type { Availabilities, AvailabilitiesFilter, DAYS } from './availabilities';
import type { Availabilities } from './availabilities';
import { DAYS } from './availabilities';

/** Maps day name to sheet header search terms (for flexible column matching) */
export const DAY_HEADER_MAP: Record<(typeof DAYS)[number], string[]> = {
  Monday: ['Monday', '星期一'],
  Tuesday: ['Tuesday', '星期二'],
  Wednesday: ['Wednesday', '星期三'],
  Thursday: ['Thursday', '星期四'],
  Friday: ['Friday', '星期五'],
  Saturday: ['Saturday', '星期六'],
  Sunday: ['Sunday', '星期日'],
};

export interface Volunteer {
  sn: string;
  code: string;
  /** area + ", Singapore" for Maps API */
  location: string | null;

  staffRemarks: string;
  active: string;
  reasonForStatus: string;
  dateOfExit: string;
  reasonForExit: string;
  dateOfApplication: string;
  residingRegion: string;

  salutation: string;
  givenName: string;
  lastName: string;
  email: string;
  dateOfBirth: string;
  contactNumber: string;
  gender: string;
  ageRange: string;
  religion: string;
  area: string;

  languagePreferenceForTraining: string;
  volunteeringExperiences: string;
  volunteerExperienceDetails: string;
  trainingCourses: string;
  trainingCourseDetails: string;
  spokenLanguages: string;
  isFamilyCaregiver: string;
  lostSomeoneRecent: string;
  employmentStatus: string;

  availabilities: Availabilities;

  appliesToMe: string;
  interestsHobbiesTalents: string;
  volunteerOptions: string;
  volunteerInvolvement: string;

  emergencyContactName: string;
  emergencyContactNumber: string;
  emergencyContactRelationship: string;
  consentAcknowledgement: string;
  mailingList: string;
  howDidYouFindUs: string;
}

/** Maps normalised field names to sheet header search terms (for flexible column matching) */
export const VOLUNTEER_HEADER_MAP: Record<keyof Omit<Volunteer, 'availabilities' | 'location'>, string[]> = {
  sn: ['SN'],
  code: ['Code Number'],
  staffRemarks: ['Staff Remarks'],
  active: ['Active'],
  reasonForStatus: ['Reason for Status'],
  dateOfExit: ['Date of Exit', 'If applicable'],
  reasonForExit: ['Reason for Exit', 'If applicable'],
  dateOfApplication: ['Date of Application'],
  residingRegion: ['Residing Region'],
  salutation: ['Salutation', '称呼'],
  givenName: ['Given Name', '名字'],
  lastName: ['Last Name', '姓氏'],
  email: ['Email', '电邮'],
  dateOfBirth: ['Date of Birth'],
  contactNumber: ['Contact number', '联络号码'],
  gender: ['Gender', '性别'],
  ageRange: ['Age Range', '年龄层'],
  religion: ['Religion', '宗教'],
  area: ['Which area of Singapore', '你住在哪一区', '10. Which area'],
  languagePreferenceForTraining: ['Language Preference For Training', '培训时的语言偏好'],
  volunteeringExperiences: ['Any past/current volunteering', '志工经验'],
  volunteerExperienceDetails: ['12a)', 'Volunteer experience', '义工经验'],
  trainingCourses: ['professional or volunteer training', '培训课程'],
  trainingCourseDetails: ['13a)', 'course name', '结业的年份'],
  spokenLanguages: ['Spoken Languages', '口语'],
  isFamilyCaregiver: ['family caregiver', '家属照顾者'],
  lostSomeoneRecent: ['lost someone significant', '失去亲人'],
  employmentStatus: ['Employment Status', '就业情况'],
  appliesToMe: ['19.', 'Please choose if it applies'],
  interestsHobbiesTalents: ['20.', 'interests', 'hobbies', 'talents'],
  volunteerOptions: ['21.', 'options that apply to you as a volunteer'],
  volunteerInvolvement: ['21a)', 'direct interaction', 'how would you like to be involved'],
  emergencyContactName: ['Name of Emergency Contact Person', '紧急联络人姓名'],
  emergencyContactNumber: ['Contact number of Emergency Contact Person', '紧急联络人电话号码'],
  emergencyContactRelationship: ['Who is he/she to me', '紧急联络人是你的什么人'],
  consentAcknowledgement: ['By providing my details', 'I understand that TCN'],
  mailingList: ['MAILING LIST', '通讯录'],
  howDidYouFindUs: ['How did you find out about us', '你是怎么认识我们'],
};

export interface VolunteerWithDistance {
  volunteer: Volunteer;
  distanceKm: number;
}

export type ClosestVolunteersResponse = VolunteerWithDistance[];
