// formConfig.js
export const vendorFormFields = [
  { id: 'vendor_name', label: 'Vendor Name', type: 'text' },
  { id: 'vendor_type', label: 'Vendor Type', type: 'text' },
  { id: 'vendor_tier', label: 'Vendor Tier', type: 'select', options: ['Tier 1', 'Tier 2', 'Tier 3'] },

  { id: 'pan', label: 'PAN', type: 'text' },
  { id: 'gstin', label: 'GSTIN', type: 'text' },
  { id: 'primary_contact_name', label: 'Name', type: 'text' },
  { id: 'primary_contact_phone', label: 'Phone', type: 'tel' },
  { id: 'primary_contact_email', label: 'Email', type: 'email' },
  { id: 'vendor_status', label: 'Vendor Status', type: 'radio', options: ['Active', 'Inactive'] },
  { id: 'document_category', label: 'Document Category', type: 'select', options: ['PO', 'Invoice', 'NDA', 'MSA'] },
  { id: "comments", label: "Comments", type: "textarea" },
];

export const engagementFormFields = [
  { id: 'engaged_vendor', label: 'Engaged Vendor', type: 'autocomplete', options: [] }, // Options will be fetched dynamically
  { id: 'engagement_name', label: 'Engagement Name', type: 'text' },
  { id: 'engagement_type', label: 'Engagement Type', type: 'text' },
  { id: 'engaged_department', label: 'Engaged Department', type: 'select', options: ['Sales', 'Marketing', 'HR', 'IT'] },
  { id: 'start_date', label: 'Start Date', type: 'date' },
  { id: 'end_date', label: 'End Date', type: 'date' },
  { id: 'engagement_status', label: 'Engagement Status', type: 'radio', options: ['Active', 'Inactive'] },
  { id: 'contact_name', label: 'Contact Name', type: 'text' },
  { id: 'contact_email', label: 'Contact Email', type: 'email' },
  { id: 'contact_phone', label: 'Contact Phone', type: 'tel' },
  { id: 'document_category', label: 'Document Category', type: 'select', options: ['PO', 'Invoice', 'NDA', 'MSA'] },
];