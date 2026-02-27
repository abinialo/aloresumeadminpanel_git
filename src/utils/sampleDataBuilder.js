const createDefaultSampleData = () => ({
  basic: {
    firstName: null,
    lastName: null,
    email: null,
    phone: null,
    address: null,
    jobTitle: null,
    country: null,
    city: null,
    postalCode: null,
    state: null,
    profileImage: 'https://allindev.s3.ap-south-1.amazonaws.com/1772179471915-gettyimages-1437816897-612x612.jpg',
    linkedIn: null,
    github: null,
    portfolio: null,
  },
  experience: [
    {
      company: null,
      position: null,
      startDate: null,
      endDate: null,
      description: null,
      location: null,
    },
  ],
  education: [
    {
      schoolOrCollegeName: null,
      degreeOrStandard: null,
      fieldOfStudy: null,
      startDate: null,
      endDate: null,
      location: null,
      description: null,
    },
  ],
  skills: {
    technical: [],
    tools: [],
    softskills: [],
    otherskills: [],
  },
  languages: [],
  certifications: [
    {
      name: null,
      description: null,
      link: null,
    },
  ],
  project: [
    {
      title: null,
      description: null,
      link: null,
    },
  ],
  summary: null,
  customization: {
    primaryColor: '#2c3e50',
    secondaryColor: '#34495e',
    fontFamily: 'Roboto',
  },
});

const normalizeRootKey = (root) => {
  if (root === 'project') return 'project';
  if (root === 'certificate' || root === 'certificates' || root === 'certification') return 'certifications';
  return root;
};

const normalizeBindPathForTracking = (bind) => {
  if (typeof bind !== 'string') return '';
  const parts = bind
    .split('.')
    .map((part) => part?.trim())
    .filter(Boolean)
    .filter((part) => !/^[0-9]+$/.test(part));
  return parts.join('.');
};

const trackBoundPath = (boundPaths, bind) => {
  const normalized = normalizeBindPathForTracking(bind);
  if (!normalized) return;
  boundPaths.add(normalized);
};

const mergeWithDefaults = (existingSampleData) => {
  const defaults = createDefaultSampleData();
  if (!existingSampleData || typeof existingSampleData !== 'object') return defaults;

  const normalizeSkillArray = (value) => {
    if (!Array.isArray(value)) return [];
    return value
      .map((item) => {
        if (typeof item === 'string') return item.trim();
        if (item && typeof item === 'object') return String(item.name || item.label || '').trim();
        return '';
      })
      .filter(Boolean);
  };

  const mergeSkills = () => {
    const incoming = existingSampleData.skills;

    // Backward compatibility: old shape skills: [{name, level}, ...]
    if (Array.isArray(incoming)) {
      return {
        ...defaults.skills,
        technical: normalizeSkillArray(incoming),
      };
    }

    if (incoming && typeof incoming === 'object') {
      return {
        ...defaults.skills,
        technical: normalizeSkillArray(incoming.technical),
        tools: normalizeSkillArray(incoming.tools),
        softskills: normalizeSkillArray(incoming.softskills),
        otherskills: normalizeSkillArray(incoming.otherskills),
      };
    }

    return defaults.skills;
  };

  const normalizeLanguageArray = (value) => {
    if (!Array.isArray(value)) return [];
    return value
      .map((item) => {
        if (typeof item === 'string') return item.trim();
        if (item && typeof item === 'object') {
          const name = String(item.name || '').trim();
          const level = String(item.level || '').trim();
          if (name && level) return `${name} (${level})`;
          return name || level;
        }
        return '';
      })
      .filter(Boolean);
  };

  const mergeLanguages = () => {
    const incoming = existingSampleData.languages;

    // Backward compatibility: old shape languages: [{name, level}, ...] OR string[]
    if (Array.isArray(incoming)) {
      return normalizeLanguageArray(incoming);
    }

    if (incoming && typeof incoming === 'object') {
      return normalizeLanguageArray(incoming.langugaes);
    }

    return defaults.languages;
  };

  return {
    ...defaults,
    ...existingSampleData,
    basic: { ...defaults.basic, ...(existingSampleData.basic || {}) },
    customization: { ...defaults.customization, ...(existingSampleData.customization || {}) },
    experience:
      Array.isArray(existingSampleData.experience) && existingSampleData.experience.length > 0
        ? existingSampleData.experience.map((item) => ({ ...defaults.experience[0], ...item }))
        : defaults.experience,
    education:
      Array.isArray(existingSampleData.education) && existingSampleData.education.length > 0
        ? existingSampleData.education.map((item) => ({ ...defaults.education[0], ...item }))
        : defaults.education,
    skills: mergeSkills(),
    languages: mergeLanguages(),
    certifications:
      Array.isArray(existingSampleData.certifications) && existingSampleData.certifications.length > 0
        ? existingSampleData.certifications.map((item) => ({ ...defaults.certifications[0], ...item }))
        : Array.isArray(existingSampleData.certificate) && existingSampleData.certificate.length > 0
        ? existingSampleData.certificate.map((item) => ({ ...defaults.certifications[0], ...item }))
        : defaults.certifications,
    project:
      Array.isArray(existingSampleData.project) && existingSampleData.project.length > 0
        ? existingSampleData.project.map((item) => ({ ...defaults.project[0], ...item }))
        : Array.isArray(existingSampleData.project) && existingSampleData.project.length > 0
        ? existingSampleData.project.map((item) => ({ ...defaults.project[0], ...item }))
        : defaults.project,
  };
};

const normalizeListLine = (line) =>
  String(line || '')
    .replace(/\u21B5/g, '')
    .replace(/^\s*(?:[-*\u2022]|\d+[.)])\s+/, '')
    .trim();

const splitListText = (text) =>
  String(text || '')
    .split('\n')
    .map(normalizeListLine)
    .filter(Boolean);

const dedupeArrayItems = (items) => {
  const seen = new Set();
  const result = [];

  items.forEach((item) => {
    const key = JSON.stringify(item);
    if (seen.has(key)) return;
    seen.add(key);
    result.push(item);
  });

  return result;
};

const isEmptyValue = (v) => v === null || v === undefined || String(v).trim() === '';

const collapseBySignature = (items, keyFields) => {
  const grouped = new Map();

  items.forEach((item) => {
    const signatureParts = keyFields.map((k) => (isEmptyValue(item?.[k]) ? '' : String(item[k]).trim()));
    const hasAnySignature = signatureParts.some(Boolean);
    const signature = hasAnySignature ? signatureParts.join('||') : JSON.stringify(item);

    if (!grouped.has(signature)) {
      grouped.set(signature, { ...item });
      return;
    }

    const existing = grouped.get(signature);
    Object.keys(item || {}).forEach((key) => {
      if (isEmptyValue(existing[key]) && !isEmptyValue(item[key])) {
        existing[key] = item[key];
      }
    });
  });

  return Array.from(grouped.values());
};

const inferExpectedRowCount = (elements, root, primaryField) => {
  const values = elements
    .filter((el) => typeof el?.bind === 'string')
    .filter((el) => {
      const bind = el.bind;
      return (
        bind === `${root}.${primaryField}` ||
        new RegExp(`^${root}\\.\\d+\\.${primaryField}$`).test(bind)
      );
    })
    .map((el) => (typeof el?.text === 'string' ? el.text.trim() : ''))
    .filter(Boolean);

  return new Set(values).size;
};

const sortElementsByPosition = (elements = []) =>
  [...elements].sort((a, b) => {
    const ay = Number(a?.y) || 0;
    const by = Number(b?.y) || 0;
    if (ay !== by) return ay - by;
    const ax = Number(a?.x) || 0;
    const bx = Number(b?.x) || 0;
    return ax - bx;
  });

const combineRepeatBindPath = (parentBind, childBind) => {
  if (!parentBind) return childBind;
  if (!childBind) return parentBind;
  if (childBind === parentBind) return childBind;
  if (childBind.startsWith(`${parentBind}.`)) return childBind;
  return `${parentBind}.${childBind}`;
};

const flattenElementsForSampleData = (elements = [], parentBind = '') => {
  const flattened = [];
  const sorted = sortElementsByPosition(elements);

  sorted.forEach((element) => {
    const currentBind = typeof element?.bind === 'string' ? element.bind.trim() : '';
    const effectiveBind = parentBind ? combineRepeatBindPath(parentBind, currentBind) : currentBind;
    const normalizedElement = effectiveBind ? { ...element, bind: effectiveBind } : { ...element };

    if (normalizedElement?.bind) {
      flattened.push(normalizedElement);
    }

    if (Array.isArray(element?.elements) && element.elements.length > 0) {
      const nextParentBind =
        element.type === 'repeat'
          ? effectiveBind || parentBind
          : parentBind;
      flattened.push(...flattenElementsForSampleData(element.elements, nextParentBind));
    }
  });

  return flattened;
};

const setBoundValue = (sampleData, bindPath, value) => {
  if (!bindPath || typeof bindPath !== 'string') return;

  const parts = bindPath.split('.').filter(Boolean);
  if (parts.length === 0) return;

  const root = normalizeRootKey(parts[0]);

  if (root === 'summary') {
    sampleData.summary = value;
    return;
  }

  if (root === 'basic' || root === 'customization') {
    const key = parts[1];
    if (!key) return;
    if (Object.prototype.hasOwnProperty.call(sampleData[root], key)) {
      sampleData[root][key] = value;
    }
    return;
  }

  if (root === 'skills') {
    const group = parts[1];
    if (!group || !Object.prototype.hasOwnProperty.call(sampleData.skills, group)) return;

    const lines = splitListText(value);
    sampleData.skills[group] = dedupeArrayItems(lines.length > 0 ? lines : [String(value).trim()].filter(Boolean));
    return;
  }

  if (root === 'languages') {
    const group = parts[1];
    if (group && group !== 'langugaes') return;

    const lines = splitListText(value);
    sampleData.languages = dedupeArrayItems(lines.length > 0 ? lines : [String(value).trim()].filter(Boolean));
    return;
  }

  if (!['experience', 'education', 'certifications', 'project'].includes(root)) return;

  let index = 0;
  let fieldPosition = 1;
  const hasExplicitIndex = /^\d+$/.test(parts[1]);
  if (hasExplicitIndex) {
    index = parseInt(parts[1], 10);
    fieldPosition = 2;
  }

  const field = parts[fieldPosition];
  if (!field) return;

  // For array roots without an explicit index (e.g. "experience.company"),
  // advance to the next row when the same field is already populated.
  if (!hasExplicitIndex) {
    const autoIndexState = setBoundValue._autoIndexState || (setBoundValue._autoIndexState = {});
    const currentIndex = Number.isFinite(autoIndexState[root]) ? autoIndexState[root] : 0;
    index = currentIndex;
    while (sampleData[root].length <= index) {
      sampleData[root].push({ ...sampleData[root][0] });
    }

    const existingValue = sampleData[root][index]?.[field];
    const hasExistingValue =
      existingValue !== null &&
      existingValue !== undefined &&
      String(existingValue).trim() !== '';

    // Avoid creating extra rows for duplicate repeated bindings with same value.
    if (hasExistingValue && String(existingValue).trim() !== String(value).trim()) {
      index = currentIndex + 1;
      autoIndexState[root] = index;
    } else {
      autoIndexState[root] = currentIndex;
    }

    while (sampleData[root].length <= index) {
      sampleData[root].push({ ...sampleData[root][0] });
    }

    // Ignore exact duplicate write for same row+field+value.
    const currentValue = sampleData[root][index]?.[field];
    if (
      currentValue !== null &&
      currentValue !== undefined &&
      String(currentValue).trim() === String(value).trim()
    ) {
      return;
    }
  }

  while (sampleData[root].length <= index) {
    sampleData[root].push({ ...sampleData[root][0] });
  }

  if (Object.prototype.hasOwnProperty.call(sampleData[root][index], field)) {
    sampleData[root][index][field] = value;
  }
};

export const buildSampleDataFromLayout = (layout, existingSampleData = null) => {
  const sampleData = mergeWithDefaults(existingSampleData);
  const rawElements = Array.isArray(layout?.elements) ? layout.elements : [];
  const elements = flattenElementsForSampleData(rawElements);
  setBoundValue._autoIndexState = {};
  const boundPaths = new Set();

  elements.forEach((element) => {
    if (!element?.bind) return;

    const manualText =
      typeof element.text === 'string' && element.text.trim().length > 0
        ? element.text.trim()
        : null;

    if (manualText === null) return;
    setBoundValue(sampleData, element.bind, manualText);
    trackBoundPath(boundPaths, element.bind);
  });

  // Dedupe repeated rows caused by duplicate bindings in layout.
  ['experience', 'education', 'certifications', 'project'].forEach((root) => {
    if (!Array.isArray(sampleData[root])) return;
    sampleData[root] = dedupeArrayItems(sampleData[root]);
  });

  sampleData.languages = dedupeArrayItems((Array.isArray(sampleData.languages) ? sampleData.languages : []).filter(Boolean));

  if (sampleData.skills && typeof sampleData.skills === 'object') {
    ['technical', 'tools', 'softskills', 'otherskills'].forEach((key) => {
      sampleData.skills[key] = dedupeArrayItems((sampleData.skills[key] || []).filter(Boolean));
    });
  }

  // Prevent accidental over-splitting when duplicate binds create extra rows.
  sampleData.experience = collapseBySignature(sampleData.experience || [], [
    'company',
    'position',
    'startDate',
    'endDate',
    'location',
  ]);
  sampleData.education = collapseBySignature(sampleData.education || [], [
    'schoolOrCollegeName',
    'degreeOrStandard',
    'fieldOfStudy',
    'startDate',
    'endDate',
    'location',
  ]);

  const expectedExperienceRows = inferExpectedRowCount(elements, 'experience', 'position');
  if (expectedExperienceRows > 0 && sampleData.experience.length > expectedExperienceRows) {
    sampleData.experience = sampleData.experience.slice(0, expectedExperienceRows);
  }

  delete setBoundValue._autoIndexState;
  return { sampleData, boundPaths };
};

export const filterSampleDataByBoundFields = (sampleData, boundPathsInput) => {
  const boundPaths = boundPathsInput instanceof Set ? boundPathsInput : new Set(boundPathsInput || []);
  if (!sampleData || boundPaths.size === 0) return {};

  const filtered = {};

  const filterObjectFields = (obj, root) => {
    if (!obj || typeof obj !== 'object') return null;
    const result = {};
    Object.entries(obj).forEach(([key, value]) => {
      if (!boundPaths.has(`${root}.${key}`)) return;
      if (isEmptyValue(value)) return;
      result[key] = value;
    });
    return Object.keys(result).length > 0 ? result : null;
  };

  const addBasic = () => {
    const basic = filterObjectFields(sampleData.basic, 'basic');
    if (basic) filtered.basic = basic;
  };

  const addCustomization = () => {
    const customization = filterObjectFields(sampleData.customization, 'customization');
    if (customization) filtered.customization = customization;
  };

  const addSummary = () => {
    if (!boundPaths.has('summary')) return;
    if (!isEmptyValue(sampleData.summary)) {
      filtered.summary = sampleData.summary;
    }
  };

  const addSkills = () => {
    if (!sampleData.skills || typeof sampleData.skills !== 'object') return;
    const skillSections = {};
    ['technical', 'tools', 'softskills', 'otherskills'].forEach((section) => {
      if (!boundPaths.has(`skills.${section}`)) return;
      const values = (sampleData.skills[section] || []).filter((value) => !isEmptyValue(value));
      if (values.length > 0) {
        skillSections[section] = values;
      }
    });
    if (Object.keys(skillSections).length > 0) {
      filtered.skills = skillSections;
    }
  };

  const addLanguages = () => {
    const hasLanguageBind = Array.from(boundPaths).some(
      (path) => path === 'languages' || path.startsWith('languages.')
    );
    if (!hasLanguageBind) return;
    const languages = (Array.isArray(sampleData.languages) ? sampleData.languages : []).filter(
      (value) => !isEmptyValue(value)
    );
    if (languages.length > 0) {
      filtered.languages = languages;
    }
  };

  const addRepeatSection = (root) => {
    if (!Array.isArray(sampleData[root])) return;
    const entries = sampleData[root]
      .map((item) => {
        if (!item || typeof item !== 'object') return null;
        const cleaned = {};
        Object.entries(item).forEach(([key, value]) => {
          if (!isEmptyValue(value)) {
            cleaned[key] = value;
          }
        });
        return Object.keys(cleaned).length > 0 ? cleaned : null;
      })
      .filter(Boolean);
    if (entries.length > 0) {
      filtered[root] = entries;
    }
  };

  addBasic();
  addCustomization();
  addSummary();
  addSkills();
  addLanguages();
  ['experience', 'education', 'certifications', 'project'].forEach(addRepeatSection);

  return filtered;
};

export default buildSampleDataFromLayout;
