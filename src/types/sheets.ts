// AUTO-GENERATED from local .xlsx (yarn generate-types) - do not edit manually
// Generated: 2026-02-23T12:47:10.352Z
// Run: yarn generate-types

/** Base type for sheet row data - all row types extend this */
export interface Row {
  [key: string]: string | number | undefined;
}

export interface VolunteerRow extends Row {
  SN?: string | number;
  'Code Number'?: string | number;
  'Staff Remarks'?: string | number;
  'Active?'?: string | number;
  'Reason for Status'?: string | number;
  'Date of Exit (If applicable)'?: string | number;
  'Reason for Exit (If applicable)'?: string | number;
  'Date of Application'?: string | number;
  'Residing Region'?: string | number;
  '1. Salutation 称呼'?: string | number;
  '2. Given Name 名字'?: string | number;
  '3. Last Name 姓氏'?: string | number;
  '4. Email 电邮'?: string | number;
  '5. Date of Birth'?: string | number;
  '6. Contact number 联络号码'?: string | number;
  '7. Gender 性别'?: string | number;
  '8. Age Range 年龄层'?: string | number;
  '9. Religion 宗教'?: string | number;
  '10. Which area of Singapore do you live? e.g. Yishun, Marine Parade, Bukit Merah etc.  你住在哪一区？例如：义顺、红山、盛港等'?: string | number;
  '11. Language Preference For Training 培训时的语言偏好'?: string | number;
  '12. Any past/current volunteering experiences? 有任何志工经验吗？'?: string | number;
  '12a) Volunteer experience Please indicate the period, organisation & what you do? e.g.  1. 2018-19, XYZ Hospital, support patients in colouring 2. 2022 - current, ABC Hospice, feed patients  义工经验 #1 请注明服务年份、机构以及服务内容：例如： 1. 2018-19，XYZ，陪伴住院病患画画 2. 2022 - 至今，ABC慈怀病院，负责帮忙喂食'?: string | number;
  '13. Have you ever attended any professional or volunteer training courses? e.g. Certificate in Counselling Psychology, Nectar Care Volunteer Training etc.   曾参加过任何专业或义工的培训课程吗？例如：辅导证书，甘露志工培训班，等等。'?: string | number;
  '13a) Please state the course name & the year of completion. e.g.  1. Nectar Care 6th Batch Volunteer Training, completed in 2016.  2. Diploma in Social Work, completed in 2018.   请填写课程名称和结业的年份。例如： 1. 甘露关怀协会，第六届志工培训班 2016结业。 2. 社工专业文凭，2018毕业'?: string | number;
  '14. Spoken Languages 口语  Choose all applicable options. 多项选择。'?: string | number;
  '15. Are you currently a family caregiver? 你目前是家属照顾者吗?'?: string | number;
  '16. Have you lost someone significant in the past two years? 在过去两年内，是否有失去亲人？'?: string | number;
  '17. Employment Status 就业情况'?: string | number;
  '18. Monday 星期一'?: string | number;
  '18. Tuesday 星期二'?: string | number;
  '18. Wednesday 星期三'?: string | number;
  '18. Thursday 星期四'?: string | number;
  '18. Friday 星期五'?: string | number;
  '18. Saturday 星期六'?: string | number;
  '18. Sunday 星期日'?: string | number;
  '19. Please choose if it applies to you. 如果适用，请选择以下的选项。'?: string | number;
  '20. Please share with your interests, hobbies, talents or professions, they are potential resources to support the work of TCN and our service users. e.g. content creation for social media, hand massage, music instruments you play, web design, nursing skills, chanting, cooking, writing blogs, gardening etc.  分享你的兴趣、爱好、才能或职业，这些能力可以成为你协助甘泉和服务对象的重要资源。例如：社交媒体创作、按摩、玩奏乐器、网页设计、护理知识，读诵经典，烹饪，写博客，做家务，等等。'?: string | number;
  '21. Please select the options that apply to you as a volunteer. 请选择适用于你的志工选项。'?: string | number;
  '21a) If you choose, "direct interaction with caregivers and patients" or both in Q20, how would you like to be involved?  如果你选择，“与家属照顾者和病患互动” 或‘两者都可以’，你希望如何参与工作？'?: string | number;
  'Name of Emergency Contact Person 紧急联络人姓名'?: string | number;
  'Contact number of Emergency Contact Person 紧急联络人电话号码'?: string | number;
  'Who is he/she to me? 紧急联络人是你的什么人？'?: string | number;
  'By providing my details, I understand that TCN may use my details for record and reference purposes. If there is no suitable match to a volunteer opportunity, I consent to TCN storing my application for a future opportunity, and to contact me when a relevant opportunity arises. I shall release and not hold or any of TCN employees, servants or agents liable in any way whatsoever for any loss, bodily injury, mishap, accident and/or loss of life or property arising directly or indirectly as a result of or in connection with my voluntary participation. To indemnify and defend against all claims, causes of actions, damages, judgements, costs and expenses including legal expenses which may arise from my presence in the activities. 通过提供我的个人资料，我明白 TCN 可能会将我的资料备档和作为参考用途。 如果没有适合我的参与活动机会，我同意 TCN 保存我的申请以备将来有相关机会时联系我。 我将解除对 TCN 及其雇员、员工或代理人的一切责任，不以任何方式对于因我自愿参与而直接或间接导致的任何损失、身体伤害、意外事故、生命或财产损失负责。 我不会对所有因我的参与活动而产生的索赔、诉因、损害赔偿、判决、费用和包括法律费用在内的开支，进行赔偿和辩护。'?: string | number;
  'MAILING LIST 通讯录'?: string | number;
  'How did you find out about us? 你是怎么认识我们？'?: string | number;
}

export interface CaseRow extends Row {
  SN?: string | number;
  'Code ( YYYYMM-xxx-Partner)'?: string | number;
  'Case is registered under'?: string | number;
  'Referral Partner'?: string | number;
  'Designation of Referring Staff'?: string | number;
  'Referring Staff Name'?: string | number;
  'Referring Staff Contact Number'?: string | number;
  'Date of first contact'?: string | number;
  FY?: string | number;
  Salutation?: string | number;
  'Given Name'?: string | number;
  'Last Name'?: string | number;
  'Primary Contact Number'?: string | number;
  'Primary Contact Type'?: string | number;
  'Secondary Contact Number'?: string | number;
  'Secondary Contact Type'?: string | number;
  Email?: string | number;
  'Date of Birth'?: string | number;
  'Stay with Patient?'?: string | number;
  Address?: string | number;
  'Unit Number'?: string | number;
  'Postal Code'?: string | number;
  'Age at Referral'?: string | number;
  Gender?: string | number;
  'Marital Status'?: string | number;
  Religion?: string | number;
  Employment?: string | number;
  'Language 1'?: string | number;
  'Language 2'?: string | number;
  'Patient Salutation'?: string | number;
  'Patient Given Name'?: string | number;
  'Patient Last Name'?: string | number;
  'Patient Relationship to Client (Who is Patient to Client?)'?: string | number;
  'Patient Contact Number'?: string | number;
  'Patient Birth Date'?: string | number;
  'Patient Age at Referral'?: string | number;
  'Patient Gender'?: string | number;
  'Patient Address'?: string | number;
  'Patient Unit Number'?: string | number;
  'Patient Postal Code'?: string | number;
  'Patient Language 1'?: string | number;
  'Patient Language 2'?: string | number;
  'Patient\'s Deceased Date (When Applicable)'?: string | number;
  'Emergency Contact Name'?: string | number;
  'Emergency Contact for Who?'?: string | number;
  'Emergency Contact Relationship (Emergency Contact is _____ to the stated personnel)'?: string | number;
  'Emergency Contact Number'?: string | number;
  'Additional Information for Case'?: string | number;
  'Care Lead'?: string | number;
  'FRT Member 1'?: string | number;
  'FRT Member 2'?: string | number;
  'FRT Member 3'?: string | number;
  'FRT Member 4'?: string | number;
  'FRT Member 5'?: string | number;
  'Skill-Based Volunteer 1'?: string | number;
  'Skill-Based Volunteer 2'?: string | number;
  'Skill-Based Volunteer 3'?: string | number;
  Remarks?: string | number;
  'Closed Date'?: string | number;
  'Reason for Closed Case'?: string | number;
}
