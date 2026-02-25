/**
 * P3-01 — Maps each HR quiz question (exact text from QA.csv) to a policy topic key.
 *
 * topicMap  — consumed by QNA.js and Stats.js to enrich navigation state sent to /chat
 * topicLabels — consumed by P3-02 for personalised assistant card headings
 */

export const topicMap = {
  'What is the core vision of Solarvest?':
    'company_culture',
  'Which value is NOT part of Solarvest core values?':
    'company_culture',
  'How long is the probation period?':
    'probation',
  'What are the normal working hours?':
    'working_hours',
  'When must annual leave be applied?':
    'annual_leave',
  'What is the maximum medical leave (>5 years service)?':
    'medical_leave',
  'How many days of maternity leave are given?':
    'maternity_leave',
  'How many days of paternity leave are provided?':
    'paternity_leave',
  'Who approves overtime?':
    'overtime',
  'What is the OT eligibility salary cap?':
    'overtime',
  'What happens if OT is submitted late?':
    'overtime',
  'Who is eligible for outpatient benefits?':
    'outpatient_benefits',
  'What document is required to be submitted upon applying for Medical Leave?':
    'medical_leave',
  'What is the mileage rate for first 500km?':
    'claims_expenses',
  'Which is NOT covered under outpatient?':
    'outpatient_benefits',
  'Maximum compassionate leave per demise?':
    'compassionate_leave',
  'When must sick leave be reported?':
    'medical_leave',
  'What is the main purpose of the handbook?':
    'company_culture',
  'How many days of hospitalization leave are allowed?':
    'medical_leave',
  'Where to locate the guide & template for signature?':
    'hr_systems',
  'Who is incharge for Payroll?':
    'payroll',
  'What date will the salary be paid for MY?':
    'payroll',
  'What is allowed for intern to claim?':
    'claims_expenses',
  'Where can they find the Employee Handbook?':
    'hr_systems',
  'When will their ASP medical card be activated?':
    'benefits_insurance',
  'How to do monthly claims?':
    'claims_expenses',
  'What is the cut-off date for submitting approved expenses claims, and when will the reimbursement be processed?':
    'claims_expenses',
  'Will Annual Leave be calculated on a prorated basis from the joining date or the confirmation date?':
    'annual_leave',
  'While outpatient medical benefits can be extended to family members, does the same apply to insurance coverage?':
    'benefits_insurance',
  'In the event of a last-minute task requiring air travel that exceeds the flight claim capping limit, will the excess amount still be reimbursable?':
    'claims_expenses',
  'Where can we access all HR forms, such as the immediate family outpatient medical benefits form and the overtime claim form?':
    'hr_systems',
  'Am I eligible to claim the Wellness Allowance while still under probation?':
    'claims_expenses',
  'What is Solarvest Finder for?':
    'hr_systems',
  'If you are a local employee, which option should you select for the question "Are you a tax resident?" in BrioHR?':
    'payroll',
};

export const topicLabels = {
  company_culture:     'Company Culture & Values',
  probation:           'Probation Period',
  working_hours:       'Working Hours',
  annual_leave:        'Annual Leave',
  medical_leave:       'Medical Leave',
  maternity_leave:     'Maternity Leave',
  paternity_leave:     'Paternity Leave',
  overtime:            'Overtime',
  outpatient_benefits: 'Outpatient Benefits',
  claims_expenses:     'Claims & Expenses',
  compassionate_leave: 'Compassionate Leave',
  hr_systems:          'HR Systems & Tools',
  payroll:             'Payroll',
  benefits_insurance:  'Benefits & Insurance',
};
