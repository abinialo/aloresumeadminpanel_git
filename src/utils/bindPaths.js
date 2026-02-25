/**
 * Available bind paths for resume data
 */
export const bindPaths = [
    // =========================
    // Basic Info
    // =========================
    { path: 'basic.firstName', label: 'First Name', category: 'Basic' },
    { path: 'basic.lastName', label: 'Last Name', category: 'Basic' },
    { path: 'basic.email', label: 'Email', category: 'Basic' },
    { path: 'basic.phone', label: 'Phone', category: 'Basic' },
    { path: 'basic.address', label: 'Address', category: 'Basic' },
    { path: 'basic.city', label: 'City', category: 'Basic' },
    { path: 'basic.state', label: 'State', category: 'Basic' },
    { path: 'basic.country', label: 'Country', category: 'Basic' },
    { path: 'basic.postalCode', label: 'Postal Code', category: 'Basic' },
    { path: 'basic.jobTitle', label: 'Job Title', category: 'Basic' },
    { path: 'basic.linkedIn', label: 'LinkedIn', category: 'Basic' },
    { path: 'basic.github', label: 'GitHub', category: 'Basic' },
    { path: 'basic.portfolio', label: 'Portfolio', category: 'Basic' },
    { path: 'basic.profileImage', label: 'Profile Image', category: 'Basic' },

    // =========================
    // Summary
    // =========================
    { path: 'summary', label: 'Summary', category: 'Summary' },

    // =========================
    // Experience (Array)
    // =========================
    { path: 'experience', label: 'Experience List', category: 'Experience', isArray: true },
    { path: 'experience.company', label: 'Company (in list)', category: 'Experience' },
    { path: 'experience.position', label: 'Position (in list)', category: 'Experience' },
    { path: 'experience.location', label: 'Location (in list)', category: 'Experience' },
    { path: 'experience.startDate', label: 'Start Date (in list)', category: 'Experience' },
    { path: 'experience.endDate', label: 'End Date (in list)', category: 'Experience' },
    { path: 'experience.description', label: 'Description (in list)', category: 'Experience' },

    // =========================
    // Education (Array)
    // =========================
    { path: 'education', label: 'Education List', category: 'Education', isArray: true },
    { path: 'education.schoolOrCollegeName', label: 'School / College (in list)', category: 'Education' },
    { path: 'education.degreeOrStandard', label: 'Degree / Standard (in list)', category: 'Education' },
    { path: 'education.fieldOfStudy', label: 'Field of Study (in list)', category: 'Education' },
    { path: 'education.location', label: 'Location (in list)', category: 'Education' },
    { path: 'education.startDate', label: 'Start Date (in list)', category: 'Education' },
    { path: 'education.endDate', label: 'End Date (in list)', category: 'Education' },
    { path: 'education.description', label: 'Description (in list)', category: 'Education' },

    // =========================
    // Skills (Grouped Arrays)
    // =========================
    { path: 'skills.technical', label: 'Technical Skills', category: 'Skills', isArray: true },
    { path: 'skills.tools', label: 'Tools Skills', category: 'Skills', isArray: true },
    { path: 'skills.softskills', label: 'Soft Skills', category: 'Skills', isArray: true },
    { path: 'skills.otherskills', label: 'Other Skills', category: 'Skills', isArray: true },

    // Languages (Array)
    { path: 'languages', label: 'Languages List', category: 'Languages', isArray: true },
    // =========================

    // Certifications (Array)
    // =========================
    { path: 'certifications', label: 'Certifications List', category: 'Certifications', isArray: true },
    { path: 'certifications.name', label: 'Certification Name (in list)', category: 'Certifications' },
    { path: 'certifications.description', label: 'Certification Description (in list)', category: 'Certifications' },
    { path: 'certifications.link', label: 'Certification Link (in list)', category: 'Certifications' },

    // Projects (Array)
    // =========================
    { path: 'projects', label: 'Projects List', category: 'Projects', isArray: true },
    { path: 'projects.title', label: 'Project Title (in list)', category: 'Projects' },
    { path: 'projects.description', label: 'Project Description (in list)', category: 'Projects' },
    { path: 'projects.link', label: 'Project Link (in list)', category: 'Projects' },

    // =========================
    // Customization
    // =========================
    { path: 'customization.primaryColor', label: 'Primary Color', category: 'Customization' },
    { path: 'customization.secondaryColor', label: 'Secondary Color', category: 'Customization' },
    { path: 'customization.fontFamily', label: 'Font Family', category: 'Customization' },
];


export const getBindPathsByCategory = () => {
    const categories = {};
    bindPaths.forEach(item => {
        if (!categories[item.category]) {
            categories[item.category] = [];
        }
        categories[item.category].push(item);
    });
    return categories;
};

export default bindPaths;
