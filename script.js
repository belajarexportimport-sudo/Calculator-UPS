// Cost Configuration - Versioned
const COSTS_DEFAULT = {
    AHS: 243460,
    LPS: 1058200,
    OMX: 4121800,
    BROKERAGE_IMPORT: 118647, // Updated to user specific value
    SURGE: {
        TO_EUR: 16280,
        FROM_EUR: 7252,
        FROM_AMERICAS: 6512,
        TO_AMERICAS_ISMEA: 16280,
        ASIA: 1480,
        ISRAEL: 9620
    },
    OPTIONAL: {
        EXTENDED_AREA_MIN: 419580,
        EXTENDED_AREA_KG: 7992,
        REMOTE_AREA_MIN: 468420,
        REMOTE_AREA_KG: 9176,
        PEB: 180960,
        RESIDENTIAL: 56684, // Saver/Expedited
        RESIDENTIAL_WWEF: 1879600, // Per AWB
        ADULT_SIGNATURE: 71040,
        DELIVERY_CONFIRMATION: 37740,
        ALTERNATE_BROKER: 408660,
        DUTY_TAX_FORWARD: 290080,
        IPF: 37000,
        PAPER_INVOICE: 370000
    }
};

const COSTS_2025 = {
    AHS: 280016,
    LPS: 1058200, // No change mentioned, keep default? User only listed specific changes. Assuming unchanged items stay same.
    OMX: 4121800, // Assumption: Unchanged
    BROKERAGE_IMPORT: 118647, // Updated to user specific value
    SURGE: { ...COSTS_DEFAULT.SURGE }, // Assumption: Unchanged
    OPTIONAL: {
        EXTENDED_AREA_MIN: 429792,
        EXTENDED_AREA_KG: 8288,
        REMOTE_AREA_MIN: 479964,
        REMOTE_AREA_KG: 9472,
        PEB: 190189,
        RESIDENTIAL: 58312, // Saver/Expedited
        RESIDENTIAL_WWEF: 1879600, // WWEF Specific
        ADULT_SIGNATURE: 71040,
        DELIVERY_CONFIRMATION: 37740,
        ALTERNATE_BROKER: 429502,
        DUTY_TAX_FORWARD: 310060,
        IPF: 37000,
        PAPER_INVOICE: 370000
    }
};

// Helper to get applicable costs based on date
function getCosts() {
    const dateInput = document.getElementById('shipmentDate');
    const dateStr = dateInput ? dateInput.value : '';

    // Default to OLD rates if no date selected
    if (!dateStr) return COSTS_DEFAULT;

    const selectedDate = new Date(dateStr);
    const cutoffDate = new Date('2025-12-21');

    if (selectedDate >= cutoffDate) {
        return COSTS_2025;
    }
    return COSTS_DEFAULT;
}

const CHINA_SOUTHERN_RANGES = [
    { start: 350000, end: 369999 }, // Fujian
    { start: 510000, end: 529999 }, // Guangdong
    { start: 571600, end: 571800 }, // Hainan
    { start: 410600, end: 421527 }, // Hunan
    { start: 674100, end: 678400 }, // Yunnan
    { start: 332325, end: 343000 }, // Jiangxi (Approx based on user input 343000 - 332325)
    { start: 400010, end: 400032 }, // Chongqing
    // Guangxi
    { start: 541000, end: 542400 },
    { start: 530000, end: 532700 },
    { start: 545000, end: 545600 },
    { start: 543000, end: 546700 },
    { start: 536000, end: 536100 },
    { start: 535000, end: 535400 },
    { start: 537100, end: 537300 },
    { start: 537000, end: 537800 },
    { start: 533000, end: 533900 },
    { start: 542800, end: 546800 },
    { start: 547000, end: 547600 },
    { start: 546100, end: 546500 }
];

// Major Chinese City Mapping (Prefix -> City Name)
const CN_CITY_MAPPING = {
    "100": "Beijing", "101": "Beijing", "102": "Beijing",
    "200": "Shanghai", "201": "Shanghai",
    "510": "Guangzhou", "511": "Guangzhou",
    "518": "Shenzhen",
    "300": "Tianjin",
    "400": "Chongqing", "401": "Chongqing", "402": "Chongqing",
    "310": "Hangzhou", "311": "Hangzhou", // Zhejiang
    "210": "Nanjing", "211": "Nanjing", // Jiangsu
    "610": "Chengdu", // Sichuan
    "350": "Fuzhou", // Fujian
    "361": "Xiamen", // Fujian
    "430": "Wuhan", // Hubei
    "710": "Xi'an", // Shaanxi
    "530": "Nanning", // Guangxi
    "650": "Kunming", // Yunnan
    "250": "Jinan", // Shandong
    "266": "Qingdao", // Shandong
    "110": "Shenyang", // Liaoning
    "116": "Dalian", // Liaoning
    "150": "Harbin", // Heilongjiang
};

function isChinaSouthern(postalCode) {
    if (!postalCode) return false;
    const digits = postalCode.replace(/\D/g, '');
    if (digits.length < 6) return false;
    const code = parseInt(digits.substring(0, 6));
    return CHINA_SOUTHERN_RANGES.some(range => code >= range.start && code <= range.end);
}





// Global Service Memory
let lastUserService = 'saver';

// Global Shipment Model (Transit Time & Routing) - EMBEDDED TO AVOID CORS/FETCH ISSUES
const TRANSIT_MODEL = {
    "export": {
        "AU": {
            "UPS saver": {
                "Monday": {
                    "transit": 3.5,
                    "route": "ID - SG - AU, ID - SG - CN - VN - AU"
                }
            }
        },
        "CA": {
            "UPS saver": {
                "Tuesday": {
                    "transit": 7.0,
                    "route": "ID - SG - CN - US - CA"
                }
            }
        },
        "CN": {
            "SF SF": {
                "Friday": {
                    "transit": 3.2,
                    "route": "ID - HK - CN"
                },
                "Monday": {
                    "transit": 3.3,
                    "route": "ID - HK - YI - HK"
                },
                "Saturday": {
                    "transit": 2.0,
                    "route": "ID - YI - CN"
                },
                "Thursday": {
                    "transit": 2.5,
                    "route": "ID - HK, ID - HK - CN"
                },
                "Tuesday": {
                    "transit": 2.0,
                    "route": "ID - CN, ID - HK, ID - HK - YI - CN, ID - YI - CN"
                }
            },
            "UPS saver": {
                "Friday": {
                    "transit": 3.0,
                    "route": "ID - SG, ID - SG - CN, ID - SG - CN - KR - CN"
                },
                "Monday": {
                    "transit": 2.2,
                    "route": "ID - SG - CN"
                },
                "Tuesday": {
                    "transit": 3.0,
                    "route": NaN
                }
            },
            "ups SF": {
                "Thursday": {
                    "transit": 4.0,
                    "route": NaN
                }
            }
        },
        "FR": {
            "UPS saver": {
                "Friday": {
                    "transit": 5.0,
                    "route": "ID - SG - VN - KR - DE - FR"
                },
                "Thursday": {
                    "transit": 4.0,
                    "route": "ID - SG - VN - KR - DE - FR"
                },
                "Tuesday": {
                    "transit": 5.0,
                    "route": "ID - SG - CN - TH - IN - DE"
                }
            }
        },
        "GB": {
            "UPS saver": {
                "Monday": {
                    "transit": 3.0,
                    "route": "ID - SG - CN - TH - IN - DE - GB"
                }
            }
        },
        "HK": {
            "UPS saver": {
                "Monday": {
                    "transit": 2.5,
                    "route": "ID - SG - CN - HK - AE"
                },
                "Wednesday": {
                    "transit": 3.5,
                    "route": "ID - SG - CN - HK"
                }
            }
        },
        "LB": {
            "UPS saver": {
                "Friday": {
                    "transit": 5.0,
                    "route": "ID - SG - CN - AE"
                }
            }
        },
        "MY": {
            "UPS saver": {
                "Thursday": {
                    "transit": 3.0,
                    "route": "ID - SG - CN"
                }
            }
        },
        "PL": {
            "UPS saver": {
                "Monday": {
                    "transit": 3.0,
                    "route": "ID - SG - CN - TH - IN - DE - PL"
                }
            }
        },
        "TW": {
            "SF saver": {
                "Wednesday": {
                    "transit": 6.0,
                    "route": NaN
                }
            }
        },
        "US": {
            "UPS saver": {
                "Friday": {
                    "transit": 2.0,
                    "route": "ID - SG - VN - KR - US"
                }
            }
        }
    },
    "import": {
        "AU": {
            "UPS saver": {
                "Monday": {
                    "transit": 3.0,
                    "route": "AU - SG - ID"
                }
            }
        },
        "BE": {
            "ups saver": {
                "Tuesday": {
                    "transit": 6.0,
                    "route": "BE - DE - CN - SG - ID"
                }
            }
        },
        "CN": {
            "UPS saver": {
                "Friday": {
                    "transit": 3.0,
                    "route": "CN - SG - ID"
                },
                "Monday": {
                    "transit": 2.0,
                    "route": "CN - SG - ID"
                },
                "Tuesday": {
                    "transit": 3.0,
                    "route": "CN - SG"
                }
            }
        },
        "DE": {
            "UPS saver": {
                "Wednesday": {
                    "transit": 4.0,
                    "route": "DE - CN - SG - ID"
                }
            }
        },
        "ES": {
            "UPS saver": {
                "Friday": {
                    "transit": 6.0,
                    "route": "ES - DE - CN - SG - ID"
                },
                "Monday": {
                    "transit": 3.0,
                    "route": "ES - DE - CN - SG - ID"
                }
            }
        },
        "HK": {
            "UPS saver": {
                "Wednesday": {
                    "transit": 2.0,
                    "route": "HK - CN - SG - ID"
                }
            }
        },
        "IT": {
            "UPS saver": {
                "Wednesday": {
                    "transit": 6.0,
                    "route": "IT - DE - CN - SG - ID"
                }
            }
        },
        "MY": {
            "UPS saver": {
                "Monday": {
                    "transit": 3.0,
                    "route": "MY - CN - SG - ID"
                }
            }
        },
        "SG": {
            "UPS saver": {
                "Friday": {
                    "transit": 1.0,
                    "route": "SG - ID"
                }
            }
        },
        "US": {
            "UPS saver": {
                "Friday": {
                    "transit": 4.0,
                    "route": "US - AE - CN - SG - ID"
                },
                "Tuesday": {
                    "transit": 5.0,
                    "route": "US - KR - CN - SG - ID"
                },
                "Wednesday": {
                    "transit": 4.0,
                    "route": "US - KR - CN - SG - ID"
                }
            },
            "ups saver": {
                "Wednesday": {
                    "transit": 8.0,
                    "route": NaN
                }
            }
        }
    }
};

/*
async function loadTransitModel() {
    // Removed external fetch to fix local CORS issues
}
*/

// Country-Service Zone Mapping (null = service not available)
const COUNTRY_SERVICE_ZONES = {
    "afghanistan": { saverExport: 9, expeditedExport: 9, saverImport: 9, expeditedImport: null, wwefExport: null, wwefImport: null },
    "aland island": { saverExport: 7, expeditedExport: 7, saverImport: 7, expeditedImport: 7, wwefExport: null, wwefImport: null },
    "albania": { saverExport: 9, expeditedExport: 9, saverImport: 9, expeditedImport: null, wwefExport: null, wwefImport: null },
    "algeria": { saverExport: 9, expeditedExport: 9, saverImport: 8, expeditedImport: null, wwefExport: null, wwefImport: null },
    "american samoa": { saverExport: 9, expeditedExport: 9, saverImport: 9, expeditedImport: null, wwefExport: null, wwefImport: null },
    "andorra": { saverExport: 6, expeditedExport: 6, saverImport: null, expeditedImport: null, wwefExport: null, wwefImport: null },
    "angola": { saverExport: 9, expeditedExport: 9, saverImport: 9, expeditedImport: null, wwefExport: null, wwefImport: null },
    "anguilla": { saverExport: 9, expeditedExport: 9, saverImport: 9, expeditedImport: null, wwefExport: null, wwefImport: null },
    "antigua and barbuda": { saverExport: 9, expeditedExport: 9, saverImport: 9, expeditedImport: null, wwefExport: null, wwefImport: null },
    "argentina": { saverExport: 8, expeditedExport: 8, saverImport: 9, expeditedImport: 9, wwefExport: 8, wwefImport: 9 },
    "armenia": { saverExport: 9, expeditedExport: 9, saverImport: 9, expeditedImport: null, wwefExport: null, wwefImport: null },
    "aruba": { saverExport: 9, expeditedExport: 9, saverImport: 9, expeditedImport: null, wwefExport: null, wwefImport: null },
    "australia": { saverExport: 3, expeditedExport: 3, saverImport: 2, expeditedImport: 2, wwefExport: 3, wwefImport: 2 },
    "austria": { saverExport: 7, expeditedExport: 7, saverImport: 7, expeditedImport: 7, wwefExport: 7, wwefImport: 7 },
    "azerbaijan": { saverExport: 9, expeditedExport: 9, saverImport: 8, expeditedImport: null, wwefExport: null, wwefImport: null },
    "azores": { saverExport: 7, expeditedExport: 7, saverImport: 7, expeditedImport: null, wwefExport: null, wwefImport: null },
    "bahamas": { saverExport: 9, expeditedExport: 9, saverImport: 9, expeditedImport: null, wwefExport: null, wwefImport: null },
    "bahrain": { saverExport: 9, expeditedExport: 9, saverImport: 9, expeditedImport: 9, wwefExport: 9, wwefImport: 9 },
    "bangladesh": { saverExport: 4, expeditedExport: 4, saverImport: 4, expeditedImport: null, wwefExport: 4, wwefImport: 4 },
    "barbados": { saverExport: 9, expeditedExport: 9, saverImport: 9, expeditedImport: null, wwefExport: null, wwefImport: null },
    "belarus": { saverExport: 9, expeditedExport: 9, saverImport: 8, expeditedImport: null, wwefExport: null, wwefImport: null },
    "belgium": { saverExport: 6, expeditedExport: 6, saverImport: 6, expeditedImport: 6, wwefExport: 6, wwefImport: 6 },
    "belize": { saverExport: 9, expeditedExport: 9, saverImport: null, expeditedImport: null, wwefExport: null, wwefImport: null },
    "benin": { saverExport: 9, expeditedExport: 9, saverImport: 9, expeditedImport: null, wwefExport: null, wwefImport: null },
    "bermuda": { saverExport: 9, expeditedExport: 9, saverImport: 9, expeditedImport: null, wwefExport: null, wwefImport: null },
    "bolivia": { saverExport: 8, expeditedExport: 8, saverImport: 9, expeditedImport: null, wwefExport: null, wwefImport: null },
    "bonaire": { saverExport: 9, expeditedExport: 9, saverImport: 9, expeditedImport: null, wwefExport: null, wwefImport: null },
    "bosnia and herzegovina": { saverExport: 9, expeditedExport: 9, saverImport: 8, expeditedImport: null, wwefExport: null, wwefImport: null },
    "botswana": { saverExport: 9, expeditedExport: 9, saverImport: 9, expeditedImport: null, wwefExport: null, wwefImport: null },
    "brazil": { saverExport: 8, expeditedExport: 8, saverImport: 7, expeditedImport: 7, wwefExport: 8, wwefImport: 7 },
    "british virgin islands": { saverExport: 9, expeditedExport: 9, saverImport: 9, expeditedImport: null, wwefExport: null, wwefImport: null },
    "brunei": { saverExport: 2, expeditedExport: 2, saverImport: 2, expeditedImport: 2, wwefExport: null, wwefImport: null },
    "bulgaria": { saverExport: 9, expeditedExport: 9, saverImport: 7, expeditedImport: 7, wwefExport: null, wwefImport: 7 },
    "burkina faso": { saverExport: 9, expeditedExport: 9, saverImport: 9, expeditedImport: null, wwefExport: null, wwefImport: null },
    "burundi": { saverExport: 9, expeditedExport: 9, saverImport: 9, expeditedImport: null, wwefExport: null, wwefImport: null },
    "cambodia": { saverExport: 4, expeditedExport: 4, saverImport: 4, expeditedImport: null, wwefExport: null, wwefImport: null },
    "cameroon": { saverExport: 9, expeditedExport: 9, saverImport: 8, expeditedImport: null, wwefExport: null, wwefImport: null },
    "canada": { saverExport: 5, expeditedExport: 5, saverImport: 5, expeditedImport: 5, wwefExport: 5, wwefImport: 5 },
    "canary islands": { saverExport: 6, expeditedExport: 6, saverImport: 7, expeditedImport: null, wwefExport: null, wwefImport: null },
    "cape verde": { saverExport: 9, expeditedExport: 9, saverImport: 9, expeditedImport: null, wwefExport: null, wwefImport: null },
    "cayman islands": { saverExport: 9, expeditedExport: 9, saverImport: 9, expeditedImport: null, wwefExport: null, wwefImport: null },
    "central african republic": { saverExport: 9, expeditedExport: 9, saverImport: null, expeditedImport: null, wwefExport: null, wwefImport: null },
    "chad": { saverExport: 9, expeditedExport: 9, saverImport: 9, expeditedImport: null, wwefExport: null, wwefImport: null },
    "chile": { saverExport: 8, expeditedExport: 8, saverImport: 9, expeditedImport: 9, wwefExport: 8, wwefImport: 9 },
    "china": { saverExport: 3, expeditedExport: 3, saverImport: 3, expeditedImport: 3, wwefExport: 3, wwefImport: 3 },
    "southern china": { saverExport: 10, expeditedExport: 10, saverImport: 10, expeditedImport: 10, wwefExport: 10, wwefImport: 10 },
    "cn southern": { saverExport: 10, expeditedExport: 10, saverImport: 10, expeditedImport: 10, wwefExport: 10, wwefImport: 10 },
    "colombia": { saverExport: 8, expeditedExport: 8, saverImport: 9, expeditedImport: 9, wwefExport: 8, wwefImport: 9 },
    "comoros": { saverExport: 9, expeditedExport: 9, saverImport: 9, expeditedImport: null, wwefExport: null, wwefImport: null },
    "congo": { saverExport: 9, expeditedExport: 9, saverImport: 9, expeditedImport: null, wwefExport: null, wwefImport: null },
    "costa rica": { saverExport: 8, expeditedExport: 8, saverImport: 9, expeditedImport: 9, wwefExport: 8, wwefImport: 9 },
    "cote d'ivoire": { saverExport: 9, expeditedExport: 9, saverImport: 9, expeditedImport: null, wwefExport: null, wwefImport: null },
    "ivory coast": { saverExport: 9, expeditedExport: 9, saverImport: 9, expeditedImport: null, wwefExport: null, wwefImport: null },
    "croatia": { saverExport: 9, expeditedExport: 9, saverImport: 8, expeditedImport: 8, wwefExport: null, wwefImport: null },
    "curacao": { saverExport: 9, expeditedExport: 9, saverImport: 9, expeditedImport: null, wwefExport: null, wwefImport: null },
    "cyprus": { saverExport: 9, expeditedExport: 9, saverImport: 9, expeditedImport: null, wwefExport: null, wwefImport: null },
    "czech republic": { saverExport: 8, expeditedExport: 8, saverImport: 7, expeditedImport: 7, wwefExport: 8, wwefImport: 7 },
    "denmark": { saverExport: 7, expeditedExport: 7, saverImport: 7, expeditedImport: 7, wwefExport: 7, wwefImport: 7 },
    "djibouti": { saverExport: 9, expeditedExport: 9, saverImport: 9, expeditedImport: null, wwefExport: null, wwefImport: null },
    "dominica": { saverExport: 9, expeditedExport: 9, saverImport: 9, expeditedImport: null, wwefExport: null, wwefImport: null },
    "dominican republic": { saverExport: 9, expeditedExport: 9, saverImport: 9, expeditedImport: 9, wwefExport: 9, wwefImport: 9 },
    "ecuador": { saverExport: 8, expeditedExport: 8, saverImport: 9, expeditedImport: 9, wwefExport: 8, wwefImport: 9 },
    "egypt": { saverExport: 9, expeditedExport: 9, saverImport: 9, expeditedImport: 9, wwefExport: 9, wwefImport: 9 },
    "el salvador": { saverExport: 8, expeditedExport: 8, saverImport: 9, expeditedImport: 9, wwefExport: 8, wwefImport: 9 },
    "england": { saverExport: 5, expeditedExport: 5, saverImport: 6, expeditedImport: 6, wwefExport: null, wwefImport: null },
    "eritrea": { saverExport: 9, expeditedExport: 9, saverImport: 9, expeditedImport: null, wwefExport: null, wwefImport: null },
    "estonia": { saverExport: 9, expeditedExport: 9, saverImport: 9, expeditedImport: 9, wwefExport: null, wwefImport: null },
    "ethiopia": { saverExport: 9, expeditedExport: 9, saverImport: 8, expeditedImport: null, wwefExport: null, wwefImport: null },
    "faroe islands": { saverExport: 9, expeditedExport: 9, saverImport: null, expeditedImport: null, wwefExport: null, wwefImport: null },
    "finland": { saverExport: 7, expeditedExport: 7, saverImport: 7, expeditedImport: 7, wwefExport: 7, wwefImport: 7 },
    "france": { saverExport: 6, expeditedExport: 6, saverImport: 6, expeditedImport: 6, wwefExport: 6, wwefImport: 6 },
    "french guiana": { saverExport: 9, expeditedExport: 9, saverImport: null, expeditedImport: null, wwefExport: null, wwefImport: null },
    "gabon": { saverExport: 9, expeditedExport: 9, saverImport: 9, expeditedImport: null, wwefExport: null, wwefImport: null },
    "gambia": { saverExport: 9, expeditedExport: 9, saverImport: 9, expeditedImport: null, wwefExport: null, wwefImport: null },
    "georgia": { saverExport: 9, expeditedExport: 9, saverImport: 9, expeditedImport: null, wwefExport: null, wwefImport: null },
    "germany": { saverExport: 6, expeditedExport: 6, saverImport: 6, expeditedImport: 6, wwefExport: 6, wwefImport: 6 },
    "ghana": { saverExport: 9, expeditedExport: 9, saverImport: 8, expeditedImport: null, wwefExport: null, wwefImport: null },
    "gibraltar": { saverExport: 9, expeditedExport: 9, saverImport: 8, expeditedImport: null, wwefExport: null, wwefImport: null },
    "greece": { saverExport: 7, expeditedExport: 7, saverImport: 7, expeditedImport: 7, wwefExport: 7, wwefImport: 7 },
    "greenland": { saverExport: 9, expeditedExport: 9, saverImport: null, expeditedImport: null, wwefExport: null, wwefImport: null },
    "grenada": { saverExport: 9, expeditedExport: 9, saverImport: 9, expeditedImport: null, wwefExport: null, wwefImport: null },
    "guadeloupe": { saverExport: 9, expeditedExport: 9, saverImport: 9, expeditedImport: null, wwefExport: null, wwefImport: null },
    "guam": { saverExport: 9, expeditedExport: 9, saverImport: 4, expeditedImport: null, wwefExport: null, wwefImport: null },
    "guatemala": { saverExport: 9, expeditedExport: 9, saverImport: 8, expeditedImport: 8, wwefExport: 9, wwefImport: 8 },
    "guernsey": { saverExport: 7, expeditedExport: 7, saverImport: 8, expeditedImport: 8, wwefExport: null, wwefImport: null },
    "guinea": { saverExport: 9, expeditedExport: 9, saverImport: 9, expeditedImport: null, wwefExport: null, wwefImport: null },
    "guinea-bissau": { saverExport: 9, expeditedExport: 9, saverImport: 9, expeditedImport: null, wwefExport: null, wwefImport: null },
    "guyana": { saverExport: 9, expeditedExport: 9, saverImport: 9, expeditedImport: null, wwefExport: null, wwefImport: null },
    "haiti": { saverExport: 9, expeditedExport: 9, saverImport: 9, expeditedImport: 9, wwefExport: null, wwefImport: null },
    "honduras": { saverExport: 8, expeditedExport: 8, saverImport: 9, expeditedImport: 9, wwefExport: 8, wwefImport: 9 },
    "hong kong": { saverExport: 2, expeditedExport: 2, saverImport: 3, expeditedImport: null, wwefExport: null, wwefImport: null },
    "hungary": { saverExport: 8, expeditedExport: 8, saverImport: 7, expeditedImport: 7, wwefExport: 8, wwefImport: 7 },
    "iceland": { saverExport: 8, expeditedExport: 8, saverImport: 8, expeditedImport: null, wwefExport: null, wwefImport: null },
    "india": { saverExport: 4, expeditedExport: 4, saverImport: 3, expeditedImport: null, wwefExport: 4, wwefImport: 3 },
    "iraq": { saverExport: 9, expeditedExport: 9, saverImport: 9, expeditedImport: null, wwefExport: null, wwefImport: null },
    "ireland": { saverExport: 7, expeditedExport: 7, saverImport: 7, expeditedImport: 7, wwefExport: 7, wwefImport: 7 },
    "israel": { saverExport: 9, expeditedExport: 9, saverImport: 8, expeditedImport: 8, wwefExport: 9, wwefImport: 8 },
    "italy": { saverExport: 6, expeditedExport: 6, saverImport: 6, expeditedImport: 6, wwefExport: 6, wwefImport: 6 },
    "jamaica": { saverExport: 9, expeditedExport: 9, saverImport: 9, expeditedImport: null, wwefExport: null, wwefImport: null },
    "japan": { saverExport: 3, expeditedExport: 3, saverImport: 3, expeditedImport: 3, wwefExport: 3, wwefImport: 3 },
    "jersey": { saverExport: 7, expeditedExport: 7, saverImport: 8, expeditedImport: 8, wwefExport: null, wwefImport: null },
    "jordan": { saverExport: 9, expeditedExport: 9, saverImport: 8, expeditedImport: null, wwefExport: null, wwefImport: null },
    "kazakhstan": { saverExport: 9, expeditedExport: 9, saverImport: 9, expeditedImport: 9, wwefExport: null, wwefImport: null },
    "kenya": { saverExport: 9, expeditedExport: 9, saverImport: 8, expeditedImport: 8, wwefExport: 9, wwefImport: 8 },
    "korea": { saverExport: 3, expeditedExport: 3, saverImport: 2, expeditedImport: 2, wwefExport: 3, wwefImport: 2 },
    "south korea": { saverExport: 3, expeditedExport: 3, saverImport: 2, expeditedImport: 2, wwefExport: 3, wwefImport: 2 },
    "kosovo": { saverExport: 9, expeditedExport: 9, saverImport: 9, expeditedImport: null, wwefExport: null, wwefImport: null },
    "kuwait": { saverExport: 9, expeditedExport: 9, saverImport: 8, expeditedImport: 8, wwefExport: 9, wwefImport: 8 },
    "kyrgyzstan": { saverExport: 9, expeditedExport: 9, saverImport: 9, expeditedImport: null, wwefExport: null, wwefImport: null },
    "laos": { saverExport: 4, expeditedExport: 4, saverImport: 4, expeditedImport: null, wwefExport: null, wwefImport: null },
    "latvia": { saverExport: 9, expeditedExport: 9, saverImport: 8, expeditedImport: 8, wwefExport: null, wwefImport: 8 },
    "lebanon": { saverExport: 9, expeditedExport: 9, saverImport: 9, expeditedImport: null, wwefExport: 9, wwefImport: 9 },
    "lesotho": { saverExport: 9, expeditedExport: 9, saverImport: 9, expeditedImport: null, wwefExport: null, wwefImport: null },
    "liberia": { saverExport: 9, expeditedExport: 9, saverImport: 9, expeditedImport: null, wwefExport: null, wwefImport: null },
    "liechtenstein": { saverExport: 7, expeditedExport: 7, saverImport: 7, expeditedImport: 7, wwefExport: 7, wwefImport: 7 },
    "lithuania": { saverExport: 9, expeditedExport: 9, saverImport: 8, expeditedImport: 8, wwefExport: null, wwefImport: 8 },
    "luxembourg": { saverExport: 6, expeditedExport: 6, saverImport: 6, expeditedImport: 6, wwefExport: 6, wwefImport: 6 },
    "macau": { saverExport: 3, expeditedExport: 3, saverImport: 3, expeditedImport: null, wwefExport: null, wwefImport: null },
    "madagascar": { saverExport: 9, expeditedExport: 9, saverImport: 9, expeditedImport: null, wwefExport: null, wwefImport: null },
    "madeira": { saverExport: 7, expeditedExport: 7, saverImport: 7, expeditedImport: null, wwefExport: null, wwefImport: null },
    "malawi": { saverExport: 9, expeditedExport: 9, saverImport: 9, expeditedImport: null, wwefExport: null, wwefImport: null },
    "malaysia": { saverExport: 2, expeditedExport: 2, saverImport: 3, expeditedImport: null, wwefExport: 2, wwefImport: 3 },
    "maldives": { saverExport: 9, expeditedExport: 9, saverImport: 9, expeditedImport: 9, wwefExport: null, wwefImport: null },
    "mali": { saverExport: 9, expeditedExport: 9, saverImport: 9, expeditedImport: null, wwefExport: null, wwefImport: null },
    "malta": { saverExport: 9, expeditedExport: 9, saverImport: 9, expeditedImport: null, wwefExport: 9, wwefImport: 9 },
    "martinique": { saverExport: 9, expeditedExport: 9, saverImport: 9, expeditedImport: null, wwefExport: null, wwefImport: null },
    "mauritania": { saverExport: 9, expeditedExport: 9, saverImport: 9, expeditedImport: null, wwefExport: null, wwefImport: null },
    "mauritius": { saverExport: 9, expeditedExport: 9, saverImport: 9, expeditedImport: null, wwefExport: 9, wwefImport: 9 },
    "mayotte": { saverExport: 9, expeditedExport: 9, saverImport: 9, expeditedImport: null, wwefExport: null, wwefImport: null },
    "mexico": { saverExport: 5, expeditedExport: 5, saverImport: 5, expeditedImport: 5, wwefExport: 5, wwefImport: 5 },
    "moldova": { saverExport: 9, expeditedExport: 9, saverImport: 8, expeditedImport: null, wwefExport: null, wwefImport: null },
    "monaco": { saverExport: 6, expeditedExport: 6, saverImport: 6, expeditedImport: 6, wwefExport: 6, wwefImport: 6 },
    "mongolia": { saverExport: 9, expeditedExport: 9, saverImport: 9, expeditedImport: null, wwefExport: null, wwefImport: null },
    "montenegro": { saverExport: 9, expeditedExport: 9, saverImport: 9, expeditedImport: null, wwefExport: null, wwefImport: null },
    "montserrat": { saverExport: 9, expeditedExport: 9, saverImport: 9, expeditedImport: null, wwefExport: null, wwefImport: null },
    "morocco": { saverExport: 9, expeditedExport: 9, saverImport: 9, expeditedImport: 9, wwefExport: 9, wwefImport: 9 },
    "mozambique": { saverExport: 9, expeditedExport: 9, saverImport: 9, expeditedImport: null, wwefExport: null, wwefImport: null },
    "myanmar": { saverExport: 4, expeditedExport: 4, saverImport: 4, expeditedImport: 4, wwefExport: null, wwefImport: null },
    "namibia": { saverExport: 9, expeditedExport: 9, saverImport: 9, expeditedImport: null, wwefExport: null, wwefImport: null },
    "nepal": { saverExport: 9, expeditedExport: 9, saverImport: 9, expeditedImport: null, wwefExport: null, wwefImport: null },
    "netherlands": { saverExport: 6, expeditedExport: 6, saverImport: 6, expeditedImport: 6, wwefExport: 6, wwefImport: 6 },
    "holland": { saverExport: 6, expeditedExport: 6, saverImport: 6, expeditedImport: 6, wwefExport: 6, wwefImport: 6 },
    "new caledonia": { saverExport: 9, expeditedExport: 9, saverImport: 9, expeditedImport: null, wwefExport: null, wwefImport: null },
    "new zealand": { saverExport: 3, expeditedExport: 3, saverImport: 2, expeditedImport: 2, wwefExport: 3, wwefImport: 2 },
    "nicaragua": { saverExport: 8, expeditedExport: 8, saverImport: 9, expeditedImport: 9, wwefExport: 8, wwefImport: 9 },
    "niger": { saverExport: 9, expeditedExport: 9, saverImport: 9, expeditedImport: null, wwefExport: null, wwefImport: null },
    "nigeria": { saverExport: 9, expeditedExport: 9, saverImport: 9, expeditedImport: 9, wwefExport: 9, wwefImport: 9 },
    "norfolk island": { saverExport: 3, expeditedExport: 3, saverImport: null, expeditedImport: null, wwefExport: null, wwefImport: null },
    "north macedonia": { saverExport: 9, expeditedExport: 9, saverImport: 8, expeditedImport: null, wwefExport: null, wwefImport: null },
    "northern ireland": { saverExport: 5, expeditedExport: 5, saverImport: 6, expeditedImport: 6, wwefExport: null, wwefImport: null },
    "northern mariana islands": { saverExport: 9, expeditedExport: 9, saverImport: 9, expeditedImport: null, wwefExport: null, wwefImport: null },
    "norway": { saverExport: 7, expeditedExport: 7, saverImport: 7, expeditedImport: 7, wwefExport: 7, wwefImport: 7 },
    "oman": { saverExport: 9, expeditedExport: 9, saverImport: 9, expeditedImport: 9, wwefExport: 9, wwefImport: 9 },
    "pakistan": { saverExport: 9, expeditedExport: 9, saverImport: 4, expeditedImport: 4, wwefExport: 9, wwefImport: 4 },
    "panama": { saverExport: 8, expeditedExport: 8, saverImport: 9, expeditedImport: 9, wwefExport: 8, wwefImport: 9 },
    "paraguay": { saverExport: 9, expeditedExport: 9, saverImport: 9, expeditedImport: null, wwefExport: null, wwefImport: null },
    "peru": { saverExport: 8, expeditedExport: 8, saverImport: 9, expeditedImport: 9, wwefExport: null, wwefImport: null },
    "philippines": { saverExport: 2, expeditedExport: 2, saverImport: 2, expeditedImport: 2, wwefExport: 2, wwefImport: 2 },
    "poland": { saverExport: 7, expeditedExport: 7, saverImport: 7, expeditedImport: 7, wwefExport: 7, wwefImport: 7 },
    "portugal": { saverExport: 7, expeditedExport: 7, saverImport: 7, expeditedImport: 7, wwefExport: 7, wwefImport: 7 },
    "puerto rico": { saverExport: 5, expeditedExport: 5, saverImport: 5, expeditedImport: 5, wwefExport: 5, wwefImport: 5 },
    "qatar": { saverExport: 9, expeditedExport: 9, saverImport: 8, expeditedImport: 8, wwefExport: 9, wwefImport: 8 },
    "reunion": { saverExport: 9, expeditedExport: 9, saverImport: 8, expeditedImport: null, wwefExport: 9, wwefImport: 8 },
    "romania": { saverExport: 9, expeditedExport: 9, saverImport: 7, expeditedImport: 7, wwefExport: null, wwefImport: 7 },
    "russia": { saverExport: 9, expeditedExport: 9, saverImport: 8, expeditedImport: 8, wwefExport: null, wwefImport: 8 },
    "rwanda": { saverExport: 9, expeditedExport: 9, saverImport: 9, expeditedImport: null, wwefExport: null, wwefImport: null },
    "samoa": { saverExport: 9, expeditedExport: 9, saverImport: 9, expeditedImport: null, wwefExport: null, wwefImport: null },
    "san marino": { saverExport: 6, expeditedExport: 6, saverImport: 6, expeditedImport: 6, wwefExport: 6, wwefImport: null },
    "saudi arabia": { saverExport: 9, expeditedExport: 9, saverImport: 9, expeditedImport: 9, wwefExport: 9, wwefImport: 9 },
    "scotland": { saverExport: 5, expeditedExport: 5, saverImport: 6, expeditedImport: 6, wwefExport: null, wwefImport: null },
    "senegal": { saverExport: 9, expeditedExport: 9, saverImport: 9, expeditedImport: null, wwefExport: null, wwefImport: null },
    "serbia": { saverExport: 9, expeditedExport: 9, saverImport: 9, expeditedImport: null, wwefExport: null, wwefImport: 9 },
    "seychelles": { saverExport: 9, expeditedExport: 9, saverImport: 9, expeditedImport: null, wwefExport: null, wwefImport: null },
    "sierra leone": { saverExport: 9, expeditedExport: 9, saverImport: 9, expeditedImport: null, wwefExport: null, wwefImport: null },
    "singapore": { saverExport: 1, expeditedExport: 1, saverImport: 1, expeditedImport: 1, wwefExport: 1, wwefImport: 1 },
    "slovakia": { saverExport: 8, expeditedExport: 8, saverImport: 7, expeditedImport: 7, wwefExport: 8, wwefImport: 7 },
    "slovenia": { saverExport: 9, expeditedExport: 9, saverImport: 8, expeditedImport: 8, wwefExport: 9, wwefImport: 8 },
    "south africa": { saverExport: 9, expeditedExport: 9, saverImport: 9, expeditedImport: 9, wwefExport: 9, wwefImport: 9 },
    "spain": { saverExport: 6, expeditedExport: 6, saverImport: 7, expeditedImport: 7, wwefExport: 6, wwefImport: 7 },
    "sri lanka": { saverExport: 4, expeditedExport: 4, saverImport: 4, expeditedImport: 4, wwefExport: 4, wwefImport: 4 },
    "st. barthelemy": { saverExport: 9, expeditedExport: 9, saverImport: 9, expeditedImport: null, wwefExport: null, wwefImport: null },
    "st. kitts": { saverExport: 9, expeditedExport: 9, saverImport: 9, expeditedImport: 9, wwefExport: null, wwefImport: null },
    "st. lucia": { saverExport: 9, expeditedExport: 9, saverImport: 9, expeditedImport: 9, wwefExport: null, wwefImport: null },
    "st. maarten": { saverExport: 9, expeditedExport: 9, saverImport: 9, expeditedImport: null, wwefExport: null, wwefImport: null },
    "st. vincent": { saverExport: 9, expeditedExport: 9, saverImport: 9, expeditedImport: null, wwefExport: null, wwefImport: null },
    "suriname": { saverExport: 9, expeditedExport: 9, saverImport: 9, expeditedImport: null, wwefExport: null, wwefImport: null },
    "swaziland": { saverExport: 9, expeditedExport: 9, saverImport: 9, expeditedImport: null, wwefExport: null, wwefImport: null },
    "sweden": { saverExport: 7, expeditedExport: 7, saverImport: 7, expeditedImport: 7, wwefExport: 7, wwefImport: 7 },
    "switzerland": { saverExport: 7, expeditedExport: 7, saverImport: 7, expeditedImport: 7, wwefExport: 7, wwefImport: 7 },
    "taiwan": { saverExport: 3, expeditedExport: 3, saverImport: 2, expeditedImport: 2, wwefExport: 3, wwefImport: 2 },
    "tanzania": { saverExport: 9, expeditedExport: 9, saverImport: 8, expeditedImport: null, wwefExport: null, wwefImport: null },
    "thailand": { saverExport: 2, expeditedExport: 2, saverImport: 3, expeditedImport: null, wwefExport: 2, wwefImport: 3 },
    "togo": { saverExport: 9, expeditedExport: 9, saverImport: 9, expeditedImport: null, wwefExport: null, wwefImport: null },
    "trinidad and tobago": { saverExport: 9, expeditedExport: 9, saverImport: 9, expeditedImport: null, wwefExport: null, wwefImport: null },
    "trinidad & tobago": { saverExport: 9, expeditedExport: 9, saverImport: 9, expeditedImport: null, wwefExport: null, wwefImport: null },
    "tunisia": { saverExport: 9, expeditedExport: 9, saverImport: null, expeditedImport: null, wwefExport: 9, wwefImport: 9 },
    "turkey": { saverExport: 8, expeditedExport: 8, saverImport: 8, expeditedImport: 8, wwefExport: 8, wwefImport: 8 },
    "turkmenistan": { saverExport: 9, expeditedExport: null, saverImport: 9, expeditedImport: null, wwefExport: null, wwefImport: null },
    "turks and caicos": { saverExport: 9, expeditedExport: 9, saverImport: 9, expeditedImport: null, wwefExport: null, wwefImport: null },
    "uganda": { saverExport: 9, expeditedExport: 9, saverImport: 8, expeditedImport: null, wwefExport: null, wwefImport: null },
    "ukraine": { saverExport: 9, expeditedExport: 9, saverImport: 9, expeditedImport: null, wwefExport: null, wwefImport: null },
    "united arab emirates": { saverExport: 7, expeditedExport: 7, saverImport: 8, expeditedImport: 8, wwefExport: 7, wwefImport: 8 },
    "uae": { saverExport: 7, expeditedExport: 7, saverImport: 8, expeditedImport: 8, wwefExport: 7, wwefImport: 8 },
    "united kingdom": { saverExport: 5, expeditedExport: 5, saverImport: 6, expeditedImport: 6, wwefExport: 5, wwefImport: 6 },
    "uk": { saverExport: 5, expeditedExport: 5, saverImport: 6, expeditedImport: 6, wwefExport: 5, wwefImport: 6 },
    "united states": { saverExport: 5, expeditedExport: 5, saverImport: 5, expeditedImport: 5, wwefExport: 5, wwefImport: 5 },
    "usa": { saverExport: 5, expeditedExport: 5, saverImport: 5, expeditedImport: 5, wwefExport: 5, wwefImport: 5 },
    "us": { saverExport: 5, expeditedExport: 5, saverImport: 5, expeditedImport: 5, wwefExport: 5, wwefImport: 5 },
    "uruguay": { saverExport: 9, expeditedExport: 9, saverImport: 9, expeditedImport: null, wwefExport: null, wwefImport: null },
    "uzbekistan": { saverExport: 9, expeditedExport: 9, saverImport: 9, expeditedImport: null, wwefExport: null, wwefImport: null },
    "vatican city": { saverExport: 6, expeditedExport: 6, saverImport: 6, expeditedImport: 6, wwefExport: 6, wwefImport: 6 },
    "venezuela": { saverExport: 8, expeditedExport: 8, saverImport: 9, expeditedImport: 9, wwefExport: null, wwefImport: null },
    "vietnam": { saverExport: 2, expeditedExport: 2, saverImport: 2, expeditedImport: 2, wwefExport: 2, wwefImport: 2 },
    "wales": { saverExport: 5, expeditedExport: 5, saverImport: 6, expeditedImport: 6, wwefExport: null, wwefImport: null },
    "yemen": { saverExport: 9, expeditedExport: 9, saverImport: 9, expeditedImport: null, wwefExport: null, wwefImport: null },
    "zambia": { saverExport: 9, expeditedExport: 9, saverImport: 8, expeditedImport: null, wwefExport: null, wwefImport: null },
    "zimbabwe": { saverExport: 9, expeditedExport: 9, saverImport: 8, expeditedImport: null, wwefExport: null, wwefImport: null }
};

// WWEF Dimensional and Weight Limits per Country
const WWEF_LIMITS = {
    "argentina": { length: 318, width: 224, height: 206, weight: 2000 },
    "australia": { length: 125, width: 125, height: 160, weight: 1500 },
    "austria": { length: 300, width: 155, height: 178, weight: 2000 },
    "bahrain": { length: 300, width: 160, height: 160, weight: 1500 },
    "bangladesh": { length: 100, width: 100, height: 100, weight: 1000 },
    "belgium": { length: 180, width: 120, height: 180, weight: 2000 },
    "brazil": { length: 302, width: 203, height: 178, weight: 2000 },
    "bulgaria": { length: 120, width: 100, height: 120, weight: 384 },
    "canada": { length: 302, width: 203, height: 178, weight: 2000 },
    "chile": { length: 300, width: 220, height: 155, weight: 2000 },
    "china": { length: 300, width: 160, height: 160, weight: 2000 },
    "southern china": { length: 300, width: 160, height: 160, weight: 2000 },
    "cn southern": { length: 300, width: 160, height: 160, weight: 2000 },
    "colombia": { length: 318, width: 224, height: 206, weight: 2000 },
    "costa rica": { length: 302, width: 203, height: 178, weight: 2000 },
    "czech republic": { length: 254, width: 183, height: 152, weight: 1000 },
    "denmark": { length: 302, width: 180, height: 178, weight: 1500 },
    "dominican republic": { length: 302, width: 203, height: 178, weight: 2000 },
    "ecuador": { length: 302, width: 203, height: 178, weight: 2000 },
    "egypt": { length: 120, width: 100, height: 120, weight: 200 },
    "el salvador": { length: 302, width: 203, height: 178, weight: 2000 },
    "finland": { length: 302, width: 200, height: 178, weight: 1500 },
    "france": { length: 254, width: 183, height: 152, weight: 1500 },
    "germany": { length: 179, width: 179, height: 170, weight: 2000 },
    "greece": { length: 254, width: 183, height: 152, weight: 2000 },
    "guatemala": { length: 302, width: 203, height: 178, weight: 2000 },
    "honduras": { length: 302, width: 203, height: 178, weight: 2000 },
    "hong kong": { length: 150, width: 142, height: 165, weight: 1000 },
    "hungary": { length: 302, width: 203, height: 155, weight: 1500 },
    "india": { length: 120, width: 120, height: 120, weight: 1500 },
    "indonesia": { length: 290, width: 120, height: 160, weight: 600 },
    "ireland": { length: 310, width: 179, height: 170, weight: 2000 },
    "israel": { length: 254, width: 183, height: 152, weight: 2000 },
    "italy": { length: 305, width: 210, height: 180, weight: 1000 },
    "japan": { length: 302, width: 179, height: 170, weight: 900 },
    "kenya": { length: 200, width: 130, height: 140, weight: 450 },
    "kuwait": { length: 300, width: 160, height: 150, weight: 2000 },
    "latvia": { length: 120, width: 100, height: 150, weight: 384 },
    "lebanon": { length: 250, width: 160, height: 160, weight: 1000 },
    "liechtenstein": { length: 300, width: 200, height: 180, weight: 1000 },
    "lithuania": { length: 120, width: 100, height: 150, weight: 384 },
    "luxembourg": { length: 180, width: 120, height: 180, weight: 2000 },
    "malaysia": { length: 220, width: 180, height: 178, weight: 1500 },
    "malta": { length: 120, width: 100, height: 140, weight: 2000 },
    "mauritius": { length: 200, width: 130, height: 140, weight: 450 },
    "mexico": { length: 302, width: 203, height: 178, weight: 2000 },
    "monaco": { length: 254, width: 183, height: 152, weight: 1500 },
    "morocco": { length: 200, width: 120, height: 125, weight: 150 },
    "nigeria": { length: 120, width: 100, height: 100, weight: 750 },
    "netherlands": { length: 180, width: 120, height: 180, weight: 2000 },
    "new zealand": { length: 120, width: 100, height: 140, weight: 750 },
    "nicaragua": { length: 302, width: 203, height: 178, weight: 2000 },
    "norway": { length: 302, width: 180, height: 175, weight: 1500 },
    "oman": { length: 300, width: 150, height: 150, weight: 300 },
    "pakistan": { length: 120, width: 80, height: 100, weight: 1500 },
    "panama": { length: 302, width: 203, height: 178, weight: 2000 },
    "philippines": { length: 318, width: 150, height: 165, weight: 1500 },
    "poland": { length: 160, width: 120, height: 200, weight: 1000 },
    "portugal": { length: 302, width: 203, height: 178, weight: 1200 },
    "puerto rico": { length: 302, width: 203, height: 178, weight: 2000 },
    "qatar": { length: 300, width: 160, height: 150, weight: 1500 },
    "reunion": { length: 120, width: 80, height: 160, weight: 700 },
    "romania": { length: 120, width: 100, height: 120, weight: 384 },
    "russia": { length: 120, width: 80, height: 180, weight: 1500 },
    "san marino": { length: 305, width: 210, height: 180, weight: 1000 },
    "saudi arabia": { length: 300, width: 190, height: 150, weight: 1000 },
    "serbia": { length: 120, width: 100, height: 120, weight: 384 },
    "singapore": { length: 290, width: 120, height: 160, weight: 600 },
    "slovakia": { length: 300, width: 155, height: 178, weight: 2000 },
    "slovenia": { length: 120, width: 100, height: 120, weight: 384 },
    "south africa": { length: 300, width: 240, height: 156, weight: 300 },
    "south korea": { length: 300, width: 175, height: 175, weight: 1500 },
    "spain": { length: 254, width: 183, height: 152, weight: 1200 },
    "sri lanka": { length: 250, width: 120, height: 150, weight: 1000 },
    "sweden": { length: 302, width: 180, height: 178, weight: 1500 },
    "switzerland": { length: 300, width: 200, height: 180, weight: 1000 },
    "taiwan": { length: 302, width: 203, height: 178, weight: 2000 },
    "thailand": { length: 302, width: 203, height: 178, weight: 2000 },
    "tunisia": { length: 120, width: 100, height: 140, weight: 2000 },
    "turkey": { length: 120, width: 80, height: 160, weight: 1500 },
    "united arab emirates": { length: 270, width: 140, height: 160, weight: 1000 },
    "uae": { length: 270, width: 140, height: 160, weight: 1000 },
    "united kingdom": { length: 310, width: 179, height: 170, weight: 2000 },
    "uk": { length: 310, width: 179, height: 170, weight: 2000 },
    "united states": { length: 302, width: 203, height: 178, weight: 2000 },
    "usa": { length: 302, width: 203, height: 178, weight: 2000 },
    "us": { length: 302, width: 203, height: 178, weight: 2000 },
    "vatican city": { length: 305, width: 210, height: 180, weight: 1000 },
    "vietnam": { length: 250, width: 120, height: 150, weight: 1000 }
};



const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);
};

// Dropdown Toggle Logic
function toggleDropdown() {
    const content = document.getElementById('dropdown-options');
    content.classList.toggle('hidden');
}

// Close dropdown when clicking outside
document.addEventListener('click', function (e) {
    const dropdown = document.getElementById('optional-dropdown');
    const content = document.getElementById('dropdown-options');
    if (dropdown && !dropdown.contains(e.target)) {
        content.classList.add('hidden');
    }
});



// V29: Service Recommendation Logic
function updateServiceRecommendation() {
    const rows = document.querySelectorAll('#package-rows tr');
    let recommendWWEF = false;
    let heavyPackages = []; // Track which packages are heavy/large and why

    rows.forEach((row, index) => {
        const length = parseFloat(row.querySelector('.pkg-length').value) || 0;
        const width = parseFloat(row.querySelector('.pkg-width').value) || 0;
        const height = parseFloat(row.querySelector('.pkg-height').value) || 0;
        const weight = parseFloat(row.querySelector('.pkg-weight').value) || 0;
        const qty = parseFloat(row.querySelector('.pkg-qty').value) || 1;

        if (qty > 0 && (length > 0 || weight > 0)) {
            const girth = (2 * width) + (2 * height);
            const lengthPlusGirth = length + girth;

            let reasons = [];
            let warnings = [];

            // WWEF Requirement Thresholds (Force WWEF)
            // WWEF Requirement Thresholds (Force WWEF)
            if (weight >= 71) {
                reasons.push(`Berat Actual >= 71 kg (${weight} kg)`);
            }
            if (lengthPlusGirth >= 400) {
                reasons.push(`Length + Girth >= 400 cm (${lengthPlusGirth.toFixed(2)} cm)`);
            }
            // NEW: General Limit > 274 cm forces WWEF
            // REVISION: If > 274cm BUT L+G < 400cm -> Allow Saver/Expedited with Surcharge (LPS+OMX)
            if (length > 274) {
                if (lengthPlusGirth < 400) {
                    warnings.push(`Panjang > 274 cm (${length} cm). Dikenakan Surcharge LPS + OMX (IDR 5.180.000)`);
                } else {
                    reasons.push(`Panjang > 274 cm (${length} cm)`);
                }
            }

            // WARNINGS (Near Limit) - 270 to 274 cm
            if (length >= 270 && length <= 274) {
                warnings.push(`Panjang ${length} cm mendekati batas maks (274 cm). Jika melebihi, akan terkena charge LPS (large package) + OMX (Over Maximum) 5.180.000`);
            }

            if (reasons.length > 0) {
                recommendWWEF = true;
                heavyPackages.push({
                    collieNumber: index + 1,
                    reasons: reasons
                });
            }

            // Store warnings globally or process them? 
            // We need a place to show these non-blocking warnings.
            // Let's attach to the row or a global warning array if not already converting to WWEF.
            if (warnings.length > 0 && reasons.length === 0) {
                // Only show warning if NOT already forced to WWEF
                heavyPackages.push({
                    collieNumber: index + 1,
                    isWarning: true,
                    reasons: warnings
                });
            }
        }
    });

    const serviceSelect = document.getElementById('serviceType');
    const saverOption = serviceSelect.querySelector('option[value="saver"]');
    const expeditedOption = serviceSelect.querySelector('option[value="expedited"]');
    const heavyWarning = document.getElementById('heavy-warning');
    const heavyWarningDetails = document.getElementById('heavy-warning-details');

    // Separate Errors vs Warnings
    const errorPkgs = heavyPackages.filter(p => !p.isWarning);
    const warningPkgs = heavyPackages.filter(p => p.isWarning);

    if (recommendWWEF) {
        // ... (Existing Logic for Forced WWEF) ...
        // Check if WWEF is available for the selected country
        const trafficType = document.querySelector('input[name="shipmentType"]:checked').value;
        const destinationInput = document.getElementById('destinationCountry');
        const originInput = document.getElementById('originCountry');
        const countryName = (trafficType === 'export' ? destinationInput : originInput).value.trim().toLowerCase();

        let wwefAvailable = true;
        if (countryName && COUNTRY_SERVICE_ZONES[countryName]) {
            const countryData = COUNTRY_SERVICE_ZONES[countryName];
            const wwefZone = (trafficType === 'export') ? countryData.wwefExport : countryData.wwefImport;
            wwefAvailable = (wwefZone !== null);
        }

        // Show heavy warning box
        heavyWarning.style.display = 'block';
        heavyWarning.className = 'warning-box'; // Ensure standard warning style
        heavyWarning.style.backgroundColor = '#fff3cd'; // Yellowish default

        // Build detailed warning message
        let detailsHTML = '<div style="color:#d35400; font-weight:bold; margin-bottom:5px;">⚠️ SHIPMENT DIALIHKAN KE WWEF</div>';
        detailsHTML += '<ul style="margin: 10px 0; padding-left: 20px;">';
        errorPkgs.forEach(pkg => {
            detailsHTML += `<li><strong>Collie #${pkg.collieNumber}:</strong> ${pkg.reasons.join(' dan ')}</li>`;
        });
        detailsHTML += '</ul>';

        if (heavyWarningDetails) {
            heavyWarningDetails.innerHTML = detailsHTML;
        }

        // Calculate and display OMX + LPS surcharge
        const currentCosts = getCosts();
        const omxLpsTotal = currentCosts.OMX + currentCosts.LPS;
        const omxLpsSurcharge = document.getElementById('omx-lps-surcharge');
        if (omxLpsSurcharge) {
            omxLpsSurcharge.textContent = formatCurrency(omxLpsTotal);
        }

        // Check WWEF availability
        if (!wwefAvailable) {
            // WWEF not available for this country - show blocking overlay or warning
            // If we strictly block, the user can't proceed. 
            // Better to show the overlay telling them it's unavailable, but maybe allow Saver with huge surcharges?
            // Current Logic: Show overlay, re-enable Saver/Expedited so they CAN calculate (with surcharges).

            const wwefOption = serviceSelect.querySelector('option[value="wwef"]');
            const wwefOverlay = document.getElementById('wwef-unavailable-overlay');

            wwefOption.disabled = true;

            // Show blocking overlay on dimension table
            if (wwefOverlay) {
                wwefOverlay.style.display = 'block';
            }

            // Allow Saver/Expedited because WWEF is impossible
            saverOption.disabled = false;
            expeditedOption.disabled = false;
        } else {
            // WWEF available - enforce WWEF selection and hide overlay
            const wwefOverlay = document.getElementById('wwef-unavailable-overlay');
            if (wwefOverlay) {
                wwefOverlay.style.display = 'none';
            }

            // Force switch to WWEF if not already
            if (serviceSelect.value !== 'wwef') {
                serviceSelect.value = 'wwef';
                // Trigger change event to update UI/rates (trusted=false)
                serviceSelect.dispatchEvent(new Event('change'));
            }

            saverOption.disabled = true;
            expeditedOption.disabled = true;
        }
    } else {
        // Condition Cleared (Not Forced WWEF) available
        // Always re-enable options first so they are valid candidates for Revert or Manual Selection
        saverOption.disabled = false;
        expeditedOption.disabled = false;

        // Check actual country availability (will re-disable if zone is null)
        updateServiceAvailability();

        // Check for Warnings (270-274cm or LPS+OMX) 
        if (warningPkgs.length > 0) {
            heavyWarning.style.display = 'block';
            heavyWarning.style.backgroundColor = '#e8f4f8'; // Light Blue/Info for warning

            let detailsHTML = '<div style="color:#2980b9; font-weight:bold; margin-bottom:5px;">ℹ️ INFO DIMENSI</div>';
            detailsHTML += '<ul style="margin: 10px 0; padding-left: 20px;">';
            warningPkgs.forEach(pkg => {
                detailsHTML += `<li><strong>Collie #${pkg.collieNumber}:</strong> ${pkg.reasons.join('; ')}</li>`;
            });
            detailsHTML += '</ul>';

            if (heavyWarningDetails) {
                heavyWarningDetails.innerHTML = detailsHTML;
            }

        } else {
            // No warnings, No Errors -> Hide everything
            heavyWarning.style.display = 'none';

            // Only re-enable if the country actually supports them (checked by updateServiceAvailability)
            // We simply remove the "forced disabled" attribute here, let updateServiceAvailability handle validity
            saverOption.disabled = false;
            expeditedOption.disabled = false;

            // Re-run availability check to ensure we don't enable unavailable services
            updateServiceAvailability();
        }

        const wwefOverlay = document.getElementById('wwef-unavailable-overlay');
        if (wwefOverlay) {
            wwefOverlay.style.display = 'none';
        }

        // Auto-Revert to Last User Selection if currently on WWEF and conditions are cleared
        // V40: Smart Revert Logic
        if (serviceSelect.value === 'wwef' && !recommendWWEF) {
            // Check if the preference is actually valid/enabled currently
            const preferredOption = serviceSelect.querySelector(`option[value="${lastUserService}"]`);

            if (preferredOption && !preferredOption.disabled) {
                console.log(`Service Recommendation: Conditions cleared -> Auto-reverting to User Preference (${lastUserService})`);
                serviceSelect.value = lastUserService;
                serviceSelect.dispatchEvent(new Event('change'));
            } else {
                // Fallback if preference is disabled (e.g. user liked Saver but switching country made it unavailable)
                // Try the other one
                const otherService = lastUserService === 'saver' ? 'expedited' : 'saver';
                const otherOption = serviceSelect.querySelector(`option[value="${otherService}"]`);
                if (otherOption && !otherOption.disabled) {
                    console.log(`Service Recommendation: Preference (${lastUserService}) unavailable -> Reverting to fallback (${otherService})`);
                    serviceSelect.value = otherService;
                    serviceSelect.dispatchEvent(new Event('change'));
                }
            }
        }
    }
}


// Service Availability Based on Country Zone
function updateServiceAvailability() {
    const trafficType = document.querySelector('input[name="shipmentType"]:checked').value;
    const destinationInput = document.getElementById('destinationCountry');
    const originInput = document.getElementById('originCountry');
    const zoneDisplay = document.getElementById('zoneDisplay');
    const serviceSelect = document.getElementById('serviceType');
    const noServiceWarning = document.getElementById('no-service-warning');

    // Individual service unavailability notifications
    const saverUnavailable = document.getElementById('saver-unavailable');
    const expeditedUnavailable = document.getElementById('expedited-unavailable');
    const wwefUnavailable = document.getElementById('wwef-unavailable');

    // Get the relevant country based on traffic type
    const countryName = (trafficType === 'export' ? destinationInput : originInput).value.trim().toLowerCase();

    // Reset if no country entered
    if (!countryName) {
        zoneDisplay.value = '-';
        noServiceWarning.style.display = 'none';
        saverUnavailable.style.display = 'none';
        expeditedUnavailable.style.display = 'none';
        wwefUnavailable.style.display = 'none';
        // Re-enable all services
        Array.from(serviceSelect.options).forEach(opt => opt.disabled = false);
        return;
    }

    // Look up country in mapping
    let effectiveCountryName = countryName;

    // Check for China Southern Logic
    if (countryName === 'china') {
        const postalCodeInput = trafficType === 'export' ? document.getElementById('destinationPostCode') : document.getElementById('originPostCode');
        const postalCode = postalCodeInput ? postalCodeInput.value : '';
        if (isChinaSouthern(postalCode)) {
            effectiveCountryName = 'cn southern';
            console.log("Zone Check: Detected China Southern Postal Code -> Switching to 'cn southern'");
        }
    }

    const countryData = COUNTRY_SERVICE_ZONES[effectiveCountryName];

    if (!countryData) {
        zoneDisplay.value = 'Not Found';
        noServiceWarning.style.display = 'none';
        saverUnavailable.style.display = 'none';
        expeditedUnavailable.style.display = 'none';
        wwefUnavailable.style.display = 'none';
        return;
    }

    // Determine which zones to use based on traffic type
    let saverZone, expeditedZone, wwefZone;
    if (trafficType === 'export') {
        saverZone = countryData.saverExport;
        expeditedZone = countryData.expeditedExport;
        wwefZone = countryData.wwefExport;
    } else {
        saverZone = countryData.saverImport;
        expeditedZone = countryData.expeditedImport;
        wwefZone = countryData.wwefImport;
    }

    // Get current service value before disabling
    const currentService = serviceSelect.value;

    // Enable/disable services based on zones
    const saverOption = serviceSelect.querySelector('option[value="saver"]');
    const expeditedOption = serviceSelect.querySelector('option[value="expedited"]');
    const wwefOption = serviceSelect.querySelector('option[value="wwef"]');

    saverOption.disabled = (saverZone === null);
    expeditedOption.disabled = (expeditedZone === null);
    wwefOption.disabled = (wwefZone === null);

    // Show/hide individual service unavailability notifications
    saverUnavailable.style.display = (saverZone === null) ? 'block' : 'none';
    expeditedUnavailable.style.display = (expeditedZone === null) ? 'block' : 'none';
    wwefUnavailable.style.display = (wwefZone === null) ? 'block' : 'none';

    // Check if all services are unavailable
    if (saverZone === null && expeditedZone === null && wwefZone === null) {
        zoneDisplay.value = 'No Service';
        noServiceWarning.style.display = 'block';
        return;
    }

    noServiceWarning.style.display = 'none';

    // Display zone number (use the first available zone)
    let displayZone = saverZone || expeditedZone || wwefZone;
    zoneDisplay.value = `Zone ${displayZone}`;

    // If current service is now disabled, switch to first available
    if (serviceSelect.options[serviceSelect.selectedIndex].disabled) {
        if (!saverOption.disabled) {
            serviceSelect.value = 'saver';
        } else if (!expeditedOption.disabled) {
            serviceSelect.value = 'expedited';
        } else if (!wwefOption.disabled) {
            serviceSelect.value = 'wwef';
        }
    }

    autoUpdateBasicRate();
}


// Check WWEF Dimensional and Weight Limits
function checkWWEFLimits() {
    const trafficType = document.querySelector('input[name="shipmentType"]:checked').value;
    const destinationInput = document.getElementById('destinationCountry');
    const originInput = document.getElementById('originCountry');
    const wwefLimitOverlay = document.getElementById('wwef-limit-overlay');
    const wwefLimitDetails = document.getElementById('wwef-limit-details');

    // Get both countries
    const destinationCountry = destinationInput.value.trim().toLowerCase();
    const originCountry = originInput.value.trim().toLowerCase();

    // Reset overlay
    if (wwefLimitOverlay) {
        wwefLimitOverlay.style.display = 'none';
    }

    // Only check if both countries are entered
    if (!destinationCountry || !originCountry) {
        return;
    }

    // NEW LOGIC: Only apply Country Specific Limits if service is WWEF
    const serviceType = document.getElementById('serviceType').value;
    if (serviceType !== 'wwef') {
        return;
    }

    // Get limits for both countries (Indonesia is always one of them)
    const indonesiaLimits = WWEF_LIMITS['indonesia'];
    const otherCountryLimits = WWEF_LIMITS[trafficType === 'export' ? destinationCountry : originCountry];

    if (!indonesiaLimits || !otherCountryLimits) {
        return; // Country not found in limits data
    }

    // Calculate minimum limits (take the smaller value from both countries)
    // Safety: If limit is 0 or undefined, treat as Infinity (no limit) to prevent false blocking
    const effectiveLimits = {
        length: Math.min(indonesiaLimits.length || 9999, otherCountryLimits.length || 9999),
        width: Math.min(indonesiaLimits.width || 9999, otherCountryLimits.width || 9999),
        height: Math.min(indonesiaLimits.height || 9999, otherCountryLimits.height || 9999),
        weight: Math.min(indonesiaLimits.weight || 9999, otherCountryLimits.weight || 9999)
    };

    console.log(`DEBUG: WWEF Check for ${destinationCountry}. Effective Limits: L=${effectiveLimits.length}, W=${effectiveLimits.width}, H=${effectiveLimits.height}, Wt=${effectiveLimits.weight}`);

    // Check all packages against limits
    const rows = document.querySelectorAll('#package-rows tr');
    let violations = [];

    rows.forEach((row, index) => {
        const length = parseFloat(row.querySelector('.pkg-length').value) || 0;
        const width = parseFloat(row.querySelector('.pkg-width').value) || 0;
        const height = parseFloat(row.querySelector('.pkg-height').value) || 0;
        const weight = parseFloat(row.querySelector('.pkg-weight').value) || 0;
        const qty = parseFloat(row.querySelector('.pkg-qty').value) || 1;

        if (qty > 0 && (length > 0 || weight > 0)) {
            let packageViolations = [];

            if (length > effectiveLimits.length) {
                packageViolations.push(`Panjang: ${length} cm (Max: ${effectiveLimits.length} cm)`);
            }
            if (width > effectiveLimits.width) {
                packageViolations.push(`Lebar: ${width} cm (Max: ${effectiveLimits.width} cm)`);
            }
            if (height > effectiveLimits.height) {
                packageViolations.push(`Tinggi: ${height} cm (Max: ${effectiveLimits.height} cm)`);
            }
            if (weight > effectiveLimits.weight) {
                packageViolations.push(`Berat: ${weight} kg (Max: ${effectiveLimits.weight} kg)`);
            }

            if (packageViolations.length > 0) {
                violations.push({
                    collieNumber: index + 1,
                    violations: packageViolations
                });
            }
        }
    });

    // Show overlay if there are violations
    if (violations.length > 0 && wwefLimitOverlay && wwefLimitDetails) {
        let detailsHTML = '<div style="margin-bottom: 10px;"><strong>Limitasi yang dilanggar:</strong></div>';
        violations.forEach(v => {
            detailsHTML += `<div style="margin-bottom: 8px;"><strong>Collie #${v.collieNumber}:</strong></div>`;
            detailsHTML += '<ul style="margin: 5px 0 10px 20px; padding: 0;">';
            v.violations.forEach(violation => {
                detailsHTML += `<li>${violation}</li>`;
            });
            detailsHTML += '</ul>';
        });

        wwefLimitDetails.innerHTML = detailsHTML;
        wwefLimitOverlay.style.display = 'block';
    }
}


// Check Threshold Warnings (approaching surcharge limits)
function checkThresholdWarnings() {
    // alert("DEBUG: checkThresholdWarnings ENTERED"); 
    const thresholdWarning = document.getElementById('lps-warning-box');
    const thresholdWarningDetails = document.getElementById('lps-warning-details');

    if (!thresholdWarning || !thresholdWarningDetails) {
        console.error("DEBUG: Warning container not found!");
        alert("DEBUG FATAL: 'lps-warning-box' NOT FOUND in HTML. HTML version mismatch?");
        return;
    }

    const rows = document.querySelectorAll('#package-rows tr');

    let warnings = [];

    // Helper to handle commas
    const safeFloat = (val) => {
        if (typeof val === 'string') return parseFloat(val.replace(',', '.')) || 0;
        return parseFloat(val) || 0;
    };

    rows.forEach((row, index) => {
        const length = safeFloat(row.querySelector('.pkg-length').value);
        const width = safeFloat(row.querySelector('.pkg-width').value);
        const height = safeFloat(row.querySelector('.pkg-height').value);
        const weight = safeFloat(row.querySelector('.pkg-weight').value);
        const qty = safeFloat(row.querySelector('.pkg-qty').value) || 1;
        const pkgType = row.querySelector('.pkg-type').value;

        if (qty > 0 && (length > 0 || weight > 0)) {
            const girth = (2 * width) + (2 * height);
            const lengthPlusGirth = length + girth;

            let packageWarnings = [];
            let isLpsOrOmx = false;

            // 1. LPS / OMX Warnings (High Priority)
            if (lengthPlusGirth >= 380) {
                packageWarnings.push(`Kombinasi Dimensi (L+Girth = ${lengthPlusGirth.toFixed(1)} cm) mencapai/melebihi batas WWEF (400 cm). Girth Anda: ${girth.toFixed(1)} cm. Akan wajib WWEF atau terkena OMX+LPS.`);
                isLpsOrOmx = true;
            }
            if (weight >= 65) {
                packageWarnings.push(`Berat ${weight} kg mendekati/melebihi batas WWEF (71 kg). Akan wajib WWEF atau terkena OMX+LPS sebesar ${formatCurrency(omxLpsTotal)}.`);
                isLpsOrOmx = true;
            }

            if (lengthPlusGirth >= 290 && lengthPlusGirth <= 300) {
                packageWarnings.push(`Mendekati batas Large Package Surcharge: Length + Girth = ${lengthPlusGirth.toFixed(2)} cm (Batas 300 cm).`);
            }
            else if (lengthPlusGirth > 300 && lengthPlusGirth < 400) {
                packageWarnings.push(`Terkena Large Package Surcharge: Length + Girth > 300 cm (dan terkena minimum weight 40 kg).`);
                isLpsOrOmx = true;
            }

            // 2. AHS Warnings (Only if NOT LPS/OMX)
            // AHS applies if: Weight > 25, Length > 122, Width > 76, or Non-Box
            if (!isLpsOrOmx) {
                let ahsTriggered = [];
                if (weight > 25 && weight < 71) ahsTriggered.push(`Berat > 25 kg (${weight} kg)`);
                if (length > 122) ahsTriggered.push(`Panjang > 122 cm (${length} cm)`);
                if (width > 76) ahsTriggered.push(`Lebar > 76 cm (${width} cm)`);
                if (pkgType !== 'box') ahsTriggered.push(`Kemasan Non-Box (${pkgType})`);

                if (ahsTriggered.length > 0) {
                    packageWarnings.push(`Terkena Additional Handling Surcharge: ${ahsTriggered.join(', ')}.`);
                } else {
                    // Only show "Approaching" if NOT triggered
                    let ahsApproaching = [];
                    if (length >= 115 && length <= 122) ahsApproaching.push(`Panjang ${length} cm (max 122 cm)`);
                    if (width >= 70 && width <= 76) ahsApproaching.push(`Lebar ${width} cm (max 76 cm)`);
                    if (weight >= 21 && weight <= 25) ahsApproaching.push(`Berat ${weight} kg (max 25 kg)`);

                    if (ahsApproaching.length > 0) {
                        packageWarnings.push(`Mendekati batas Additional Handling Surcharge ${formatCurrency(getCosts().AHS)}: ${ahsApproaching.join(', ')}.`);
                    }
                }
            }


            if (packageWarnings.length > 0) {
                warnings.push({
                    collieNumber: index + 1,
                    warnings: packageWarnings
                });
            }
        }
    });

    // Display warnings
    if (warnings.length > 0) {
        // console.log("DEBUG: Warnings found:", warnings);
        let detailsHTML = '';
        warnings.forEach(w => {
            detailsHTML += `<div style="margin-bottom: 10px;"><strong>Collie #${w.collieNumber}:</strong></div>`;
            detailsHTML += '<ul style="margin: 5px 0 10px 15px; padding: 0; list-style: disc;">';
            w.warnings.forEach(warning => {
                detailsHTML += `<li style="margin-bottom: 5px;">${warning}</li>`;
            });
            detailsHTML += '</ul>';
        });

        thresholdWarningDetails.innerHTML = detailsHTML;
        thresholdWarning.style.display = 'block';
        thresholdWarning.style.visibility = 'visible';

        // CONFIRMATION ALERT: Rules out silent failure
        console.log("DEBUG: Showing warning box via script.");
        // alert("DEBUG SUCCESS: Logic passed! Showing warning box.");
    } else {
        thresholdWarning.style.display = 'none';
    }
}


// Lookup Rate from Table
function lookupRate(trafficType, serviceType, zone, weight) {
    if (!RATES[trafficType] || !RATES[trafficType][serviceType]) return null;

    const zoneRates = RATES[trafficType][serviceType][zone];
    if (!zoneRates) return null;

    // Filter and sort keys, keeping track of original key
    // Map: numericKey -> originalKey
    const keyMap = new Map();
    const weights = [];

    Object.keys(zoneRates).forEach(k => {
        if (k !== 'min') {
            const val = parseFloat(k);
            if (!isNaN(val)) {
                weights.push(val);
                keyMap.set(val, k);
            }
        }
    });
    weights.sort((a, b) => a - b);
    console.log(`DEBUG: lookupRate weight=${weight} weights=`, weights, "KeyMap Size=", keyMap.size);


    // Simplified Logic: All Keys are Upper Bounds (parsed from range ends or flat steps)
    // "21-44" parses to 44.
    // "0.5" parses to 0.5.
    // "300+" parses to 300.

    // Find first key where weight <= key
    for (const w of weights) {
        if (weight <= w) {
            const key = keyMap.get(w);
            // console.log(`DEBUG: lookupRate Found Match weight=${weight} key=${key} rate=${zoneRates[key]}`);
            return zoneRates[key];
        }
    }

    // V41: Fix for "Plus" categories (e.g. 300+)
    // If weight exceeds all keys, use the largest key.
    if (weights.length > 0) {
        const maxKey = weights[weights.length - 1];
        if (weight > maxKey) {
            const key = keyMap.get(maxKey);
            console.log(`DEBUG: lookupRate Exceeds Max (${maxKey}). Using Max Key. Rate=${zoneRates[key]}`);
            return zoneRates[key];
        }
    }

    return null;
}

// Auto-Update Basic Rate Field
function autoUpdateBasicRate() {
    // 1. Get Traffic Type
    const trafficType = document.querySelector('input[name="shipmentType"]:checked').value;

    // 2. Get Country
    const destinationInput = document.getElementById('destinationCountry');
    const originInput = document.getElementById('originCountry');
    const countryName = (trafficType === 'export' ? destinationInput : originInput).value.trim().toLowerCase();

    // 3. Get Service Type
    const serviceType = document.getElementById('serviceType').value;

    // 4. Get Total Weight
    const totalWeightSpan = document.getElementById('res-total-weight');
    const totalWeight = parseFloat(totalWeightSpan.textContent) || 0;

    if (!countryName || totalWeight === 0) return;



    // Determine effective country and zone for lookup
    let effectiveCountryName = countryName;
    if (countryName === 'china') {
        const postalCodeInput = trafficType === 'export' ? document.getElementById('destinationPostCode') : document.getElementById('originPostCode');
        const postalCode = postalCodeInput ? postalCodeInput.value : '';
        if (isChinaSouthern(postalCode)) {
            effectiveCountryName = 'cn southern';
        }
    }

    // 5. Get Zone from Effective Country
    let zone = null;
    if (COUNTRY_SERVICE_ZONES[effectiveCountryName]) {
        const data = COUNTRY_SERVICE_ZONES[effectiveCountryName];
        if (trafficType === 'export') {
            if (serviceType === 'saver') zone = data.saverExport;
            else if (serviceType === 'expedited') zone = data.expeditedExport;
            else if (serviceType === 'wwef') zone = data.wwefExport || data.saverExport;
        } else {
            if (serviceType === 'saver') zone = data.saverImport;
            else if (serviceType === 'expedited') zone = data.expeditedImport;
            else if (serviceType === 'wwef') zone = data.wwefImport || data.saverImport;
        }
    }

    if (zone === null) {
        console.log("AutoUpdate: Zone not found or null for", countryName);
        const basicRateInput = document.getElementById('basicRate');
        if (basicRateInput) basicRateInput.value = '';
        return;
    }

    // 6. Determine Rate Table Key
    const contentTypeEl = document.getElementById('contentType');
    const isDocument = contentTypeEl && contentTypeEl.value === 'document';

    let lookupService = serviceType;
    let lookupWeight = totalWeight;

    if (isDocument && totalWeight <= 5.0) {
        if (serviceType === 'saver' || serviceType === 'expedited') {
            lookupService = 'envelope';
        }
    } else if (serviceType === 'wwef') {
        lookupWeight = Math.max(totalWeight, 71);
    }

    console.log(`AutoUpdate: Looking up ${trafficType} > ${lookupService} > Zone ${zone} > Weight ${lookupWeight} (Actual: ${totalWeight})`);

    // 7. Lookup Rate
    const rate = lookupRate(trafficType, lookupService, zone, lookupWeight);
    console.log("AutoUpdate: Rate found =", rate);

    // 8. Update Field if rate found
    if (rate !== null) {
        const basicRateInput = document.getElementById('basicRate');
        if (basicRateInput) {
            basicRateInput.value = rate;
            // Trigger input event to update calculations if needed
            basicRateInput.dispatchEvent(new Event('input'));
        }
    }
}

// Row Auto-Calculation Logic (Girth & Chargeable Weight)
function attachRowListeners() {
    const rows = document.querySelectorAll('#package-rows tr');
    rows.forEach(row => {
        const lengthInput = row.querySelector('.pkg-length');
        const widthInput = row.querySelector('.pkg-width');
        const heightInput = row.querySelector('.pkg-height');
        const weightInput = row.querySelector('.pkg-weight');
        const girthInput = row.querySelector('.pkg-girth');
        const cWeightInput = row.querySelector('.pkg-cweight');
        const qtyInput = row.querySelector('.pkg-qty'); // V33: Select Qty Input

        const updateRowCalculations = () => {
            // Helper for safe parsing
            const safeFloat = (val) => {
                if (typeof val === 'string') return parseFloat(val.replace(',', '.')) || 0;
                return parseFloat(val) || 0;
            };

            let l = safeFloat(lengthInput.value);
            let w = safeFloat(widthInput.value);
            let h = safeFloat(heightInput.value);
            const weight = safeFloat(weightInput.value);

            // V34: Dimension Rounding Rule (Effective Jan 11, 2026)
            let shouldRound = false;
            const dateInput = document.getElementById('shipmentDate');
            if (dateInput && dateInput.value) {
                const selectedDate = new Date(dateInput.value);
                const roundingCutoff = new Date('2026-01-11');
                if (selectedDate >= roundingCutoff) {
                    shouldRound = true;
                    l = Math.ceil(l);
                    w = Math.ceil(w);
                    h = Math.ceil(h);
                }
            }

            // Girth
            const girth = (2 * w) + (2 * h);
            girthInput.value = girth > 0 ? girth : '';

            // Chargeable Weight (Volumetric vs Actual)
            const volWeight = (l * w * h) / 5000;
            let cWeight = Math.max(weight, volWeight);

            // V35: Weight Rounding Rule (Up to nearest 0.5kg) - Effective same date
            if (shouldRound && cWeight > 0) {
                cWeight = Math.ceil(cWeight * 2) / 2;
            }

            cWeightInput.value = cWeight > 0 ? cWeight.toFixed(2) : '';

            // V23: Auto-Switch Mode based on Total Weight
            updateTotalWeightAndMode();
            // V29: Service Recommendation Logic
            updateServiceRecommendation();
            // Check WWEF Limits
            checkWWEFLimits();
            // Check Threshold Warnings
            checkThresholdWarnings();
        };

        lengthInput.addEventListener('input', updateRowCalculations);
        widthInput.addEventListener('input', updateRowCalculations);
        heightInput.addEventListener('input', updateRowCalculations);
        weightInput.addEventListener('input', updateRowCalculations);
        if (qtyInput) qtyInput.addEventListener('input', updateRowCalculations); // V33: Add Listener

    });
}

// V23: Auto-Switch Rate Mode Logic
function updateTotalWeightAndMode() {
    const rows = document.querySelectorAll('#package-rows tr');
    let totalCWeight = 0;

    rows.forEach(row => {
        const cWeightInput = row.querySelector('.pkg-cweight');
        const qtyInput = row.querySelector('.pkg-qty'); // V33: Add Qty Support
        // V37: Fix Comma Parsing
        const valStr = cWeightInput.value ? cWeightInput.value.toString().replace(',', '.') : "0";
        const val = parseFloat(valStr) || 0;
        const qty = parseFloat(qtyInput ? qtyInput.value : 1) || 1;
        totalCWeight += (val * qty);
    });

    // V36: Billing Weight Rounding Rule
    // If Total >= 21kg, round up to nearest 1kg.
    // Else, keep existing precision (0.5kg steps).
    let billingWeight = totalCWeight;
    if (billingWeight >= 21) {
        billingWeight = Math.ceil(billingWeight);
    }

    // Update Display
    const totalWeightSpan = document.getElementById('res-total-weight');
    if (totalWeightSpan) {
        totalWeightSpan.textContent = `${billingWeight.toFixed(2)} kg`;
    }

    const basicRateLabel = document.getElementById('basicRateLabel');
    const basicRateInput = document.getElementById('basicRate');

    // Store the current mode in a global variable for calculation
    // V38: Fix Threshold - Flat only up to 20kg. 20.5kg should be Per Kg.
    if (billingWeight > 20) {
        window.currentRateMode = 'perkg';
        if (basicRateLabel) basicRateLabel.textContent = 'Basic Rate (/kg)';
        if (basicRateInput) basicRateInput.placeholder = 'IDR/kg';
    } else {
        window.currentRateMode = 'flat';
        if (basicRateLabel) basicRateLabel.textContent = 'Basic Rate (Flat)';
        if (basicRateInput) basicRateInput.placeholder = 'IDR';
    }

    // Auto-update rate
    autoUpdateBasicRate();
}



// Country to Zone Mapping
const COUNTRY_ZONES = {
    // Americas
    "anguilla": "americas", "antigua and barbuda": "americas", "argentina": "americas", "aruba": "americas",
    "bahamas": "americas", "barbados": "americas", "belize": "americas", "bermuda": "americas", "bolivia": "americas",
    "bonaire": "americas", "st. eustatius": "americas", "saba": "americas", "brazil": "americas",
    "british virgin islands": "americas", "canada": "americas", "cayman islands": "americas", "chile": "americas",
    "colombia": "americas", "costa rica": "americas", "curacao": "americas", "dominica": "americas",
    "dominican republic": "americas", "ecuador": "americas", "el salvador": "americas", "french guiana": "americas",
    "grenada": "americas", "guadeloupe": "americas", "guatemala": "americas", "guyana": "americas", "haiti": "americas",
    "honduras": "americas", "jamaica": "americas", "martinique": "americas", "mexico": "americas",
    "montserrat": "americas", "nicaragua": "americas", "panama": "americas", "paraguay": "americas", "peru": "americas",
    "puerto rico": "americas", "st. barthelemy": "americas", "st. christopher": "americas", "st. kitts": "americas",
    "st. lucia": "americas", "st. martin": "americas", "st. maarten": "americas",
    "st. vincent and the grenadines": "americas", "suriname": "americas", "trinidad and tobago": "americas",
    "turks and caicos islands": "americas", "u.s. virgin islands": "americas", "united states": "americas", "usa": "americas",
    "us": "americas",

    // Europe
    "andorra": "eur", "albania": "eur", "armenia": "eur", "austria": "eur", "belarus": "eur", "belgium": "eur",
    "bosnia and herzegovina": "eur", "bulgaria": "eur", "croatia": "eur", "cyprus": "eur", "czech republic": "eur",
    "denmark": "eur", "estonia": "eur", "finland": "eur", "france": "eur", "georgia": "eur", "germany": "eur",
    "gibraltar": "eur", "greece": "eur", "guernsey": "eur", "hungary": "eur", "iceland": "eur", "ireland": "eur",
    "italy": "eur", "jersey": "eur", "kosovo": "eur", "latvia": "eur", "lithuania": "eur", "luxembourg": "eur",
    "north macedonia": "eur", "malta": "eur", "moldova": "eur", "montenegro": "eur", "netherlands": "eur",
    "norway": "eur", "poland": "eur", "portugal": "eur", "romania": "eur", "russia": "eur", "san marino": "eur",
    "serbia": "eur", "slovakia": "eur", "slovenia": "eur", "spain": "eur", "sweden": "eur", "switzerland": "eur",
    "turkey": "eur", "ukraine": "eur", "united kingdom": "eur", "uk": "eur", "great britain": "eur",

    // ISMEA
    "afghanistan": "ismea", "algeria": "ismea", "angola": "ismea", "azerbaijan": "ismea", "bahrain": "ismea",
    "bangladesh": "ismea", "benin": "ismea", "botswana": "ismea", "burkina faso": "ismea", "burundi": "ismea",
    "cameroon": "ismea", "cape verde": "ismea", "chad": "ismea", "comoros": "ismea", "republic of congo": "ismea",
    "democratic republic of the congo": "ismea", "djibouti": "ismea", "egypt": "ismea", "guinea": "ismea",
    "eritrea": "ismea", "ethiopia": "ismea", "gabon": "ismea", "gambia": "ismea", "ghana": "ismea",
    "guinea-bissau": "ismea", "iraq": "ismea", "cote d'ivoire": "ismea", "ivory coast": "ismea", "jordan": "ismea",
    "kazakhstan": "ismea", "kenya": "ismea", "kuwait": "ismea", "kyrgyzstan": "ismea", "lebanon": "ismea",
    "lesotho": "ismea", "liberia": "ismea", "madagascar": "ismea", "malawi": "ismea", "maldives": "ismea",
    "mali": "ismea", "mauritania": "ismea", "mauritius": "ismea", "mayotte": "ismea", "morocco": "ismea",
    "mozambique": "ismea", "namibia": "ismea", "nepal": "ismea", "niger": "ismea", "nigeria": "ismea",
    "oman": "ismea", "pakistan": "ismea", "qatar": "ismea", "reunion": "ismea", "rwanda": "ismea",
    "saudi arabia": "ismea", "senegal": "ismea", "seychelles": "ismea", "sierra leone": "ismea",
    "south africa": "ismea", "sri lanka": "ismea", "swaziland": "ismea", "tajikistan": "ismea", "tanzania": "ismea",
    "togo": "ismea", "tunisia": "ismea", "turkmenistan": "ismea", "united arab emirates": "ismea", "uae": "ismea",
    "uganda": "ismea", "uzbekistan": "ismea", "zambia": "ismea", "zimbabwe": "ismea",

    // Asia Pacific
    "american samoa": "asia", "brunei": "asia", "cambodia": "asia", "china": "asia", "fiji": "asia",
    "french polynesia": "asia", "guam": "asia", "hong kong": "asia", "hong kong sar": "asia", "indonesia": "asia",
    "india": "asia", "japan": "asia", "south korea": "asia", "laos": "asia", "macau": "asia", "macau sar": "asia",
    "malaysia": "asia", "mongolia": "asia", "myanmar": "asia", "new caledonia": "asia", "northern mariana islands": "asia",
    "philippines": "asia", "samoa": "asia", "singapore": "asia", "taiwan": "asia", "thailand": "asia", "vietnam": "asia",

    // Israel
    "israel": "israel"
};

function autoSelectZone(countryInputId, zoneSelectId) {
    const countryInput = document.getElementById(countryInputId);
    const zoneSelect = document.getElementById(zoneSelectId);

    countryInput.addEventListener('input', function () {
        const country = this.value.toLowerCase().trim();
        if (COUNTRY_ZONES[country]) {
            zoneSelect.value = COUNTRY_ZONES[country];
            // Visual feedback (optional)
            zoneSelect.style.backgroundColor = "#e8f0fe";
            setTimeout(() => zoneSelect.style.backgroundColor = "", 500);
        }
    });
}

// V17: Auto-set Indonesia based on Traffic
function updateTrafficDefaults() {
    const exportRadio = document.getElementById('type-export');
    const importRadio = document.getElementById('type-import');
    const originCountry = document.getElementById('originCountry');
    const destinationCountry = document.getElementById('destinationCountry');

    if (exportRadio && exportRadio.checked) {
        originCountry.value = "Indonesia";
        // Trigger input event to auto-select zone
        originCountry.dispatchEvent(new Event('input'));

        // Clear Destination
        destinationCountry.value = "";
    } else if (importRadio && importRadio.checked) {
        destinationCountry.value = "Indonesia";
        // Trigger input event to auto-select zone
        destinationCountry.dispatchEvent(new Event('input'));

        // Clear Origin
        originCountry.value = "";
    }
}

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    // loadTransitModel(); // Disabled - using embedded data
    attachRowListeners();
    autoSelectZone('originCountry', 'origin');
    autoSelectZone('destinationCountry', 'destination');

    // Initialize the label to default (Flat)
    updateTotalWeightAndMode();

    // Traffic Type Listeners
    // Traffic Type Listeners
    const trafficRadios = document.getElementsByName('shipmentType');
    trafficRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            updateTrafficDefaults();
            updateServiceAvailability();
            checkWWEFLimits();
        });
    });

    // FSI Logic & Import
    const shipmentDateInput = document.getElementById('shipmentDate');
    const fsiInput = document.getElementById('fsi');
    const fsiSourceLabel = document.getElementById('fsi-source-label');
    const btnUpdateFsi = document.getElementById('btn-update-fsi');
    const btnClearFsi = document.getElementById('btn-clear-fsi');
    const fsiPasteArea = document.getElementById('fsi-paste-area');
    const fsiUpdateStatus = document.getElementById('fsi-update-status');
    const LS_FSI_KEY = 'ups_fsi_history';

    function getEffectiveFSIHistory() {
        const stored = localStorage.getItem(LS_FSI_KEY);
        if (stored) {
            try { return { source: 'User Imported', data: JSON.parse(stored) }; } catch (e) { }
        }
        if (typeof FSI_HISTORY !== 'undefined' && Array.isArray(FSI_HISTORY)) {
            return { source: 'System Default', data: FSI_HISTORY };
        }
        return { source: 'None', data: [] };
    }

    function updateFSIByDate() {
        if (!shipmentDateInput || !fsiInput) return;
        const { source, data } = getEffectiveFSIHistory();
        if (data.length === 0) return;

        const selectedDateStr = shipmentDateInput.value;
        if (!selectedDateStr) return;

        // FSI history sorted desc
        let foundRate = null;
        for (const entry of data) {
            if (new Date(entry.date) <= new Date(selectedDateStr)) {
                foundRate = entry.rate;
                break;
            }
        }
        if (foundRate !== null) {
            fsiInput.value = foundRate;
            if (fsiSourceLabel) fsiSourceLabel.textContent = `(${source})`;
            fsiInput.style.backgroundColor = "#e8f0fe";
            setTimeout(() => fsiInput.style.backgroundColor = "", 500);
        }
    }

    function parseFSIText(text) {
        const lines = text.split(/\r?\n/);
        const history = [];
        const dateRegex = /(\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2})|(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4})/;
        const percentRegex = /(\d{1,2}(?:\.\d{1,2})?)%/;

        for (const line of lines) {
            const dateMatch = line.match(dateRegex);
            const rateMatch = line.match(percentRegex);
            if (dateMatch && rateMatch) {
                let dateStr = dateMatch[0];
                if (dateStr.includes('/')) {
                    const parts = dateStr.split('/');
                    if (parts[0].length === 4) dateStr = parts.join('-');
                    else dateStr = `${parts[2]}-${parts[0]}-${parts[1]}`;
                }
                history.push({ date: dateStr, rate: parseFloat(rateMatch[1]) });
            }
        }
        return history.sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    if (btnUpdateFsi) {
        btnUpdateFsi.addEventListener('click', () => {
            const history = parseFSIText(fsiPasteArea.value);
            if (history.length > 0) {
                localStorage.setItem(LS_FSI_KEY, JSON.stringify(history));
                fsiUpdateStatus.textContent = `Success! Imported ${history.length} rates.`;
                fsiUpdateStatus.style.color = 'green';
                fsiPasteArea.value = '';
                updateFSIByDate();
            } else {
                fsiUpdateStatus.textContent = "No valid data found.";
                fsiUpdateStatus.style.color = 'red';
            }
        });
    }

    if (btnClearFsi) {
        btnClearFsi.addEventListener('click', () => {
            if (confirm("Reset FSI data to default?")) {
                localStorage.removeItem(LS_FSI_KEY);
                fsiUpdateStatus.textContent = "Reset done.";
                updateFSIByDate();
            }
        });
    }

    if (shipmentDateInput) {
        shipmentDateInput.addEventListener('change', () => {
            updateFSIByDate();
            calculate();
        });
        updateFSIByDate();
    }

    // V34: Global Date Listener for Dimension Rounding
    if (shipmentDateInput) {
        shipmentDateInput.addEventListener('change', () => {
            const rows = document.querySelectorAll('#package-rows tr');
            rows.forEach(row => {
                const lengthInput = row.querySelector('.pkg-length');
                // Trigger input event on one field per row to run updateRowCalculations
                if (lengthInput) lengthInput.dispatchEvent(new Event('input'));
            });
        });
    }

    // Country Input Listeners for Service Availability
    const destinationInput = document.getElementById('destinationCountry');
    const originInput = document.getElementById('originCountry');

    if (destinationInput) {
        destinationInput.addEventListener('input', () => {
            updateServiceAvailability();
            checkWWEFLimits();
            checkIPFAutoSelect();
        });
    }

    function checkIPFAutoSelect() {
        const destInput = document.getElementById('destinationCountry');
        // Targeted selection to avoid ambiguity
        const ipfCheckbox = document.querySelector('input[type="checkbox"][value="ipf"]');

        if (!destInput || !ipfCheckbox) return;

        const dest = destInput.value.toLowerCase().trim();
        const isUSA = dest === 'united states' || dest === 'usa' || dest === 'us';

        if (isUSA) {
            if (!ipfCheckbox.checked) {
                ipfCheckbox.checked = true;
                calculate();
            }
        }
    }

    if (originInput) {
        originInput.addEventListener('input', () => {
            updateServiceAvailability();
            checkWWEFLimits();
            updateServiceRecommendation();
            checkThresholdWarnings(); // Explicitly check warning on input
            calculate();
        });
    }

    // Initial service availability check
    updateServiceAvailability();
    checkWWEFLimits();

    // Postal Code Surcharge Listeners
    const originPostCodeInput = document.getElementById('originPostCode');
    const destPostCodeInput = document.getElementById('destinationPostCode');
    const originCityInput = document.getElementById('originCity');
    const destCityInput = document.getElementById('destinationCity');

    // --- Autocomplete Helper ---
    function updateCitySuggestions(inputElement, datalistId, countryValue) {
        const datalist = document.getElementById(datalistId);
        if (!datalist) return;

        const val = inputElement.value.toLowerCase().trim();
        // clear if short
        if (val.length < 2) {
            datalist.innerHTML = '';
            return;
        }

        if (typeof EAS_RAS_CITIES === 'undefined' || !EAS_RAS_CITIES) {
            console.log("DEBUG: EAS_RAS_CITIES is missing!");
            return;
        }

        // Find city list
        let cities = EAS_RAS_CITIES[countryValue];
        if (!cities) {
            // Check case insensitive and trim keys
            const key = Object.keys(EAS_RAS_CITIES).find(k => k.toLowerCase().trim() === countryValue.toLowerCase().trim());
            if (key) cities = EAS_RAS_CITIES[key];
        }

        if (!cities) {
            console.log(`DEBUG: No cities found for country '${countryValue}'`);
            return;
        }

        // Filter matches (Limit to 50 to prevent lag)
        const matches = cities.filter(c => c.name.toLowerCase().startsWith(val)).slice(0, 50);
        console.log(`DEBUG: Autocomplete '${val}' in '${countryValue}' -> Found ${matches.length} matches`);

        // Build options
        // Only rebuild if content changes to avoid interfering with typing? 
        // Datalist is passive, so rebuilding is fine.

        let html = '';
        matches.forEach(c => {
            html += `<option value="${c.name}"></option>`;
        });
        datalist.innerHTML = html;
    }

    function updatePostalSurcharges() {
        const originCountry = document.getElementById('originCountry').value;
        const destCountry = document.getElementById('destinationCountry').value;
        const originZip = document.getElementById('originPostCode') ? document.getElementById('originPostCode').value : '';
        const destZip = document.getElementById('destinationPostCode') ? document.getElementById('destinationPostCode').value : '';

        // NEW: City Input
        const originCity = document.getElementById('originCity') ? document.getElementById('originCity').value : '';
        const destCity = document.getElementById('destinationCity') ? document.getElementById('destinationCity').value : '';

        console.log(`DEBUG: updatePostalSurcharges Triggered. OrgCity='${originCity}', DestCity='${destCity}'`);

        // Check Surcharge (Helper from eas_ras_data.js)


        // Check Surcharge (Local Logic)
        let originType = null;
        let destType = null;

        function lookupSurcharge(country, zip, cityName, context) {
            try {
                if (!country) return null;

                // --- 1. RANGE LOOKUP (Postal Code) ---
                if (typeof EAS_RAS_DATA !== 'undefined' && EAS_RAS_DATA) {
                    let ranges = EAS_RAS_DATA[country]; // Try exact
                    if (!ranges) ranges = EAS_RAS_DATA[country.trim()];
                    if (!ranges && country.toLowerCase) ranges = EAS_RAS_DATA[country.toLowerCase().trim()];

                    // Fallback to case-insensitive key search
                    if (!ranges) {
                        const lowerInput = country.toLowerCase().trim();
                        const matchedKey = Object.keys(EAS_RAS_DATA).find(k => k.toLowerCase().trim() === lowerInput);
                        if (matchedKey) ranges = EAS_RAS_DATA[matchedKey];
                    }

                    if (ranges && Array.isArray(ranges) && zip) {
                        const zipNum = parseInt(zip.replace(/[^0-9]/g, ''));
                        if (!isNaN(zipNum)) {
                            for (const range of ranges) {
                                if (zipNum >= range.low && zipNum <= range.high) {
                                    // Prefer range match if found
                                    if (context === 'origin' && range.originType) return range.originType;
                                    if (context === 'destination' && range.destType) return range.destType;
                                }
                            }
                        }
                    }
                } // End Range Lookup

                // --- 2. CITY LOOKUP (Fallback) ---
                if (typeof EAS_RAS_CITIES !== 'undefined' && EAS_RAS_CITIES && cityName && cityName.trim().length > 1) {
                    let cityList = EAS_RAS_CITIES[country];
                    if (!cityList) cityList = EAS_RAS_CITIES[country.trim()];
                    if (!cityList && country.toLowerCase) cityList = EAS_RAS_CITIES[country.toLowerCase().trim()];

                    // Case-insensitive key search for country
                    if (!cityList) {
                        const lowerInput = country.toLowerCase().trim();
                        const matchedKey = Object.keys(EAS_RAS_CITIES).find(k => k.toLowerCase().trim() === lowerInput);
                        if (matchedKey) cityList = EAS_RAS_CITIES[matchedKey];
                    }

                    if (cityList && Array.isArray(cityList)) {
                        const searchCity = cityName.toLowerCase().trim();
                        // Find matching city
                        const matchedCity = cityList.find(c => c.name.toLowerCase().trim() === searchCity);

                        if (matchedCity) {
                            if (context === 'origin' && matchedCity.originType) return matchedCity.originType;
                            if (context === 'destination' && matchedCity.destType) return matchedCity.destType;
                        }
                    }
                }

            } catch (err) {
                console.warn("Postal/City Surcharge Lookup Error:", err);
                return null;
            }
            return null;
        }

        originType = lookupSurcharge(originCountry, originZip, originCity, 'origin');
        destType = lookupSurcharge(destCountry, destZip, destCity, 'destination'); // Fixed function signature

        console.log(`DEBUG: Surcharge Result -> OriginType=${originType}, DestType=${destType}`);


        const easCheckbox = document.querySelector('#dropdown-options input[value="extendedArea"]');
        const rasCheckbox = document.querySelector('#dropdown-options input[value="remoteArea"]');

        // Reset check (UI logic remains same, just data source became smarter)
        // ... (existing helper logic)

        let easCount = 0;
        if (originType === 'EAS') easCount++;
        if (destType === 'EAS') easCount++;

        let rasCount = 0;
        if (originType === 'RAS') rasCount++;
        if (destType === 'RAS') rasCount++;

        // Auto-Check Logic & Multiplier Setting
        if (easCheckbox) {
            easCheckbox.dataset.multiplier = easCount > 0 ? easCount : 1;

            if (easCount > 0) {
                if (!easCheckbox.checked) {
                    easCheckbox.checked = true;
                    easCheckbox.dispatchEvent(new Event('change', { bubbles: true }));
                }
            } else {
                if (easCheckbox.checked) {
                    easCheckbox.checked = false;
                    easCheckbox.dispatchEvent(new Event('change', { bubbles: true }));
                }
                easCheckbox.dataset.multiplier = 1;
            }
        }

        if (rasCheckbox) {
            rasCheckbox.dataset.multiplier = rasCount > 0 ? rasCount : 1;

            if (rasCount > 0) {
                if (!rasCheckbox.checked) {
                    rasCheckbox.checked = true;
                    rasCheckbox.dispatchEvent(new Event('change', { bubbles: true }));
                }
            } else {
                if (rasCheckbox.checked) {
                    rasCheckbox.checked = false;
                    rasCheckbox.dispatchEvent(new Event('change', { bubbles: true }));
                }
                rasCheckbox.dataset.multiplier = 1;
            }
        }

        // Auto-Calculate into Total Cost
        calculate();
    } // Closes updatePostalSurcharges

    function autoDetectCountryFromPostCode(isExport) {
        const postCodeInput = isExport ? destPostCodeInput : originPostCodeInput;
        const countryInput = isExport ? destinationInput : originInput;

        if (!postCodeInput || !countryInput) return;

        // Clean postal code (remove spaces) for checking
        const rawPCode = postCodeInput.value;
        const cleanPCode = rawPCode.replace(/\s+/g, '');

        console.log(`AutoDetect: Input='${rawPCode}', Clean='${cleanPCode}', CurrentCountry='${countryInput.value}'`);

        const currentCountry = countryInput.value.trim().toLowerCase();

        // Check for China Logic
        // 1. Is it China Southern?
        if (isChinaSouthern(cleanPCode)) {
            // If empty OR already China/Southern China -> ensure it is "China" (effective zone handled by postal code)
            if (currentCountry === "" || currentCountry === "china" || currentCountry === "southern china") {
                console.log("AutoDetect: Detected China Southern range -> Setting/Keeping China");
                if (countryInput.value !== "China") { // Avoid redundant events
                    countryInput.value = "China";
                    countryInput.dispatchEvent(new Event('input'));
                }

                // --- Auto-Populate City ---
                const cityInputId = isExport ? 'destinationCity' : 'originCity';
                const cityInput = document.getElementById(cityInputId);

                if (cityInput && cityInput.value === "") {
                    // Try to map city
                    const prefix3 = cleanPCode.substring(0, 3);
                    const prefix2 = cleanPCode.substring(0, 2) + "0"; // Loose fallback? No, just stick to 3

                    if (CN_CITY_MAPPING[prefix3]) {
                        cityInput.value = CN_CITY_MAPPING[prefix3];
                        console.log(`AutoCity: Set ${cityInputId} to ${CN_CITY_MAPPING[prefix3]}`);
                    }
                }
                // --------------------------

                return;
            }
        }

        // 2. Is it generic China? (6 digits)
        if (/^\d{6}$/.test(cleanPCode)) {
            // If empty OR already China/Southern China -> ensure it is "China"
            if (currentCountry === "" || currentCountry === "china" || currentCountry === "southern china") {
                console.log("AutoDetect: Detected 6 digits -> Setting/Keeping China");
                if (countryInput.value !== "China") { // Correction: Force "China" so logic can decide zone
                    countryInput.value = "China";
                    countryInput.dispatchEvent(new Event('input'));
                }

                // --- Auto-Populate City ---
                const cityInputId = isExport ? 'destinationCity' : 'originCity';
                const cityInput = document.getElementById(cityInputId);

                if (cityInput && cityInput.value === "") {
                    // Try to map city
                    const prefix3 = cleanPCode.substring(0, 3);

                    if (CN_CITY_MAPPING[prefix3]) {
                        cityInput.value = CN_CITY_MAPPING[prefix3];
                        console.log(`AutoCity: Set ${cityInputId} to ${CN_CITY_MAPPING[prefix3]}`);
                    }
                }
                // --------------------------

                return;
            }
        }
    }

    if (originPostCodeInput) {
        originPostCodeInput.addEventListener('input', () => {
            autoDetectCountryFromPostCode(false);
            updatePostalSurcharges();
            updateServiceAvailability(); // Re-check zone
        });
    }
    if (destPostCodeInput) {
        destPostCodeInput.addEventListener('input', () => {
            autoDetectCountryFromPostCode(true);
            updatePostalSurcharges();
            updateServiceAvailability(); // Re-check zone
        });
    }
    // Event Listeners moved to DOMContentLoaded

    // Explicitly attach listeners to package row inputs for real-time updates and warnings
    // Explicitly attach listeners to package row inputs for real-time updates and warnings
    function initApp() {
        console.log("DEBUG: initApp executing... (readyState: " + document.readyState + ")");

        const originCityInput = document.getElementById('originCity');
        const destCityInput = document.getElementById('destinationCity');
        const originCountryInput = document.getElementById('originCountry');
        const destCountryInput = document.getElementById('destinationCountry');

        if (originCityInput) {
            console.log("DEBUG: originCityInput found. Attaching listener.");
            // Remove old listener to be safe (not possible with anon func, but okay)
            originCityInput.addEventListener('input', () => {
                updatePostalSurcharges();
                updateCitySuggestions(originCityInput, 'originCities', originCountryInput.value);
            });
        } else {
            console.error("DEBUG: originCityInput NOT FOUND during initApp!");
        }

        if (destCityInput) {
            console.log("DEBUG: destCityInput found. Attaching listener.");
            destCityInput.addEventListener('input', () => {
                updatePostalSurcharges();
                updateCitySuggestions(destCityInput, 'destCities', destCountryInput.value);
            });
        } else {
            console.error("DEBUG: destCityInput NOT FOUND during initApp!");
        }

        const pkgInputs = document.querySelectorAll('.pkg-length, .pkg-width, .pkg-height, .pkg-weight, .pkg-qty');
        console.log(`DEBUG: Found ${pkgInputs.length} package inputs for listeners.`);

        pkgInputs.forEach(input => {
            input.addEventListener('input', () => {
                try {
                    updateServiceRecommendation(); // Check for WWEF/Saver switch
                    checkThresholdWarnings();      // Check for LPS/AHS warnings
                    calculate();                   // Recalculate costs
                } catch (err) {
                    console.error("Error in package input listener:", err);
                }
            });
        });

        // Initial check on load
        try {
            checkThresholdWarnings();
        } catch (e) { console.error("Initial warning check failed", e); }
    }

    // Run Init Logic Safely
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initApp);
    } else {
        initApp();
    }


    // Service Type Listener
    const serviceTypeSelect = document.getElementById('serviceType');
    const wwefNotification = document.getElementById('wwef-notification');

    // V40: Smart Service Tracking (User Preference Memory)
    // moved to global scope


    if (serviceTypeSelect && wwefNotification) {

        serviceTypeSelect.addEventListener('change', function (e) {
            // Only update memory if USER triggered the change (trusted event)
            // and explicitly chose a non-forced service (Saver/Expedited).
            // If they chose WWEF manually, that's fine too, we remember it.
            if (e.isTrusted) {
                lastUserService = this.value;
                console.log("Service Memory Updated by User:", lastUserService);
            }

            const isWwef = this.value === 'wwef';

            // Toggle WWEF Notification
            wwefNotification.style.display = isWwef ? 'block' : 'none';

            // Toggle Residential Options
            const resSaver = document.querySelector('input[value="residential"]');
            const resWwef = document.querySelector('input[value="residential_wwef"]');

            if (resSaver && resWwef) {
                if (isWwef) {
                    // WWEF Selected: Enable WWEF Res, Disable Saver Res
                    resWwef.disabled = false;
                    resSaver.disabled = true;
                    resSaver.checked = false; // Uncheck invalid option
                } else {
                    // Saver/Expedited Selected: Disable WWEF Res, Enable Saver Res
                    resWwef.disabled = true;
                    resWwef.checked = false; // Uncheck invalid option
                    resSaver.disabled = false;
                }
                // Trigger change to update costs if a box was unchecked
                resSaver.dispatchEvent(new Event('change', { bubbles: true }));
            }

            autoUpdateBasicRate();
            calculate();
        });

        // Trigger once on init
        serviceTypeSelect.dispatchEvent(new Event('change'));
    }

    // Envelope Logic
    const contentTypeSelect = document.getElementById('contentType');
    if (contentTypeSelect && serviceTypeSelect) {
        contentTypeSelect.addEventListener('change', function () {
            const isEnvelope = this.value === 'document';
            const saverOption = serviceTypeSelect.querySelector('option[value="saver"]');
            const expeditedOption = serviceTypeSelect.querySelector('option[value="expedited"]');
            const wwefOption = serviceTypeSelect.querySelector('option[value="wwef"]');

            if (isEnvelope) {
                if (wwefOption) wwefOption.disabled = true;
                if (expeditedOption) expeditedOption.disabled = true;
                if (serviceTypeSelect.value === 'wwef' || serviceTypeSelect.value === 'expedited') {
                    serviceTypeSelect.value = 'saver';
                    autoUpdateBasicRate();
                }
            } else {
                if (wwefOption) wwefOption.disabled = false;
                if (expeditedOption) expeditedOption.disabled = false;
                updateServiceAvailability();
            }
            autoUpdateBasicRate();
            calculate();
        });
    }

    // Discount Listener
    const discountToggle = document.getElementById('toggle-discount');
    const discountRow = document.getElementById('discount-row');
    const discountSelect = document.getElementById('discount');

    if (discountToggle && discountRow && discountSelect) {
        discountToggle.addEventListener('change', function () {
            if (this.checked) {
                discountRow.classList.remove('hidden');
            } else {
                discountRow.classList.add('hidden');
                discountSelect.value = "0";
            }
            calculate();
        });
    }

    // Run once on load
    if (typeof FSI_DEFAULT !== 'undefined') {
        const fsiInput = document.getElementById('fsi');
        if (fsiInput) fsiInput.value = FSI_DEFAULT;
    }
    updateTrafficDefaults();


    document.getElementById('calculator-form').addEventListener('submit', function (e) {
        e.preventDefault();
        calculate();
    });
    function calculate() {
        try {
            _calculateInternal();
        } catch (e) {
            const debugDiv = document.getElementById('debug-output');
            debugDiv.style.display = 'block';
            debugDiv.textContent = "Error: " + e.message + "\n" + e.stack;
            alert("An error occurred. Check the bottom of the page for details.");
        }
    }

    function _calculateInternal() {
        // 1. Shipment Level Inputs
        const shipmentType = document.querySelector('input[name="shipmentType"]:checked').value;
        const serviceTypeEl = document.getElementById('serviceType');
        const serviceType = serviceTypeEl ? serviceTypeEl.value : 'wwef'; // Default to WWEF if missing

        // V42: Force 'perkg' mode for WWEF (Freight) regardless of weight
        let rateMode = window.currentRateMode || 'flat';
        if (serviceType === 'wwef') {
            rateMode = 'perkg';
        }

        const origin = document.getElementById('origin').value;
        const destination = document.getElementById('destination').value;
        const originCountry = document.getElementById('originCountry').value || '';
        const destinationCountry = document.getElementById('destinationCountry').value || '';

        const basicRateInput = parseFloat(document.getElementById('basicRate').value) || 0;
        const discountPercent = parseFloat(document.getElementById('discount').value) || 0;
        const fsiPercent = parseFloat(document.getElementById('fsi').value) || 0;

        // Apply Discount
        const effectiveBasicRate = basicRateInput * (1 - discountPercent / 100);

        // 2. Pre-Check for Global OMX & Mixed Package Logic
        const rows = document.querySelectorAll('#package-rows tr');
        let hasHeavyOrLarge = false; // Weight >= 71 OR L+G > 400
        let hasLightAndSmall = false; // Weight < 71 AND L+G < 400
        const isWwef = serviceType === 'wwef';

        // Helper: Safe Float
        const safeFloat = (val) => {
            if (typeof val === 'string') return parseFloat(val.replace(',', '.')) || 0;
            return parseFloat(val) || 0;
        };

        rows.forEach(row => {
            const weightInput = row.querySelector('.pkg-weight');
            const lengthInput = row.querySelector('.pkg-length');
            const widthInput = row.querySelector('.pkg-width');
            const heightInput = row.querySelector('.pkg-height');

            let weight = safeFloat(weightInput.value);
            let length = safeFloat(lengthInput.value);
            let width = safeFloat(widthInput.value);
            let height = safeFloat(heightInput.value);

            // V34: Dimension Rounding Rule in Calculate (Effective Jan 11, 2026)
            // Must replicate logic here to ensure consistency
            const dateInput = document.getElementById('shipmentDate');
            if (dateInput && dateInput.value) {
                const selectedDate = new Date(dateInput.value);
                const roundingCutoff = new Date('2026-01-11');
                if (selectedDate >= roundingCutoff) {
                    length = Math.ceil(length);
                    width = Math.ceil(width);
                    height = Math.ceil(height);
                }
            }

            if (weight === 0 && length === 0) return;

            const girth = (2 * width) + (2 * height);
            const totalDim = length + girth;

            // Check conditions
            if (weight >= 71 || totalDim > 400) {
                hasHeavyOrLarge = true;
            } else {
                hasLightAndSmall = true;
            }
        });

        const isMixedPackage = hasHeavyOrLarge && hasLightAndSmall;

        // 3. Iterate Packages (Main Calculation)
        let totalSurcharge = 0;
        let totalChargeableWeight = 0;
        let packageCount = 0;
        let surcharges = []; // { name, cost, type, count }

        // Comparison Logic Variables
        let potentialSaverSurcharges = 0; // Surcharges that WOULD apply if Saver
        let isComparisonNeeded = false; // Triggered by Weight >= 70 or Global OMX

        rows.forEach((row, index) => {
            const qtyInput = row.querySelector('.pkg-qty');
            const weightInput = row.querySelector('.pkg-weight');
            const lengthInput = row.querySelector('.pkg-length');
            const widthInput = row.querySelector('.pkg-width');
            const heightInput = row.querySelector('.pkg-height');
            const typeInput = row.querySelector('.pkg-type');

            const qty = parseInt(qtyInput.value) || 1;
            let weight = safeFloat(weightInput.value);
            let length = safeFloat(lengthInput.value);
            let width = safeFloat(widthInput.value);
            let height = safeFloat(heightInput.value);
            const packageType = typeInput.value;

            // V34: Logic Replication
            let shouldRound = false;
            const dateInput = document.getElementById('shipmentDate');
            if (dateInput && dateInput.value) {
                const selectedDate = new Date(dateInput.value);
                const roundingCutoff = new Date('2026-01-11');
                if (selectedDate >= roundingCutoff) {
                    shouldRound = true;
                    length = Math.ceil(length);
                    width = Math.ceil(width);
                    height = Math.ceil(height);
                }
            }

            if (weight === 0 && length === 0) return;

            packageCount += qty;
            let pkgUnitSurcharges = 0;
            let pkgPotentialSurcharges = 0; // For comparison

            // Volumetric Weight Calculation (Per Unit)
            const volumetricWeight = (length * width * height) / 5000;
            let unitChargeableWeight = Math.max(weight, volumetricWeight);

            // V35: Weight Rounding Rule (Up to nearest 0.5kg) - Effective same date
            if (shouldRound && unitChargeableWeight > 0) {
                unitChargeableWeight = Math.ceil(unitChargeableWeight * 2) / 2;
            }

            // Apply Min Weight Logic based on Service
            // if (isWwef) {
            //    // WWEF Min 71kg is Per Shipment, not Per Package. 
            //    // Moving logic to final calculation.
            // } else {
            // If NOT WWEF: Use actual/volumetric
            // }

            // Trigger Comparison if Weight > 70kg (User rule)
            if (weight > 70) {
                isComparisonNeeded = true;
            }

            let isPkgLps = false;
            let isPkgOmx = false;

            const girth = (2 * width) + (2 * height);
            const totalDim = length + girth;

            // Determine Surcharge Eligibility (Potential)
            // STRICT OMX RULES: L > 274 || L+G > 400 || W > 70
            // REVISED: If L > 274 AND L+G < 400 -> Special Surcharge (LPS+OMX) but NOT STRICT OMX (which implies forced WWEF/Freight)
            // Actually, "Strict OMX" in this context just means "Apply OMX+LPS cost".
            // If the user wants to ALLOW Saver, we just need to ensure the cost is added.

            let isSpecialLengthSurcharge = false;
            if (length > 274 && totalDim < 400) {
                isSpecialLengthSurcharge = true;
                // Treat as OMX for cost calculation? Yes, user said "LPS + OMX".
                isPkgOmx = true;
            }

            if (!isSpecialLengthSurcharge) {
                if (length > 274 || totalDim > 400 || weight > 70) {
                    isPkgOmx = true;
                } else if (totalDim > 300) {
                    isPkgLps = true;
                }
            }

            // Calculate Potential Surcharges (As if Saver)
            if (isPkgOmx) {
                pkgPotentialSurcharges += getCosts().OMX + getCosts().LPS;
                if (unitChargeableWeight < 40) unitChargeableWeight = 40;
            } else if (isPkgLps) {
                pkgPotentialSurcharges += getCosts().LPS;
                if (unitChargeableWeight < 40) unitChargeableWeight = 40;
            } else {
                // AHS Logic
                // AHS applies if NOT OMX/LPS
                let ahsReasons = [];
                if (weight > 25 && weight < 71) ahsReasons.push('Weight');
                if (packageType !== 'box') ahsReasons.push('Packaging');
                if ((length > 122 || width > 76) && totalDim <= 300) ahsReasons.push('Dimensions');

                if (ahsReasons.length > 0) {
                    pkgPotentialSurcharges += getCosts().AHS;
                }
            }

            // Apply Surcharges based on Service Type
            if (isWwef) {
                // WWEF: Waive OMX, LPS, AHS
                // pkgUnitSurcharges remains 0
            } else {
                // Saver: Apply the potential surcharges
                pkgUnitSurcharges = pkgPotentialSurcharges;

                // Add to display list
                if (isPkgOmx) {
                    surcharges.push({ name: `Pkg #${index + 1} (x${qty}): OMX + LPS`, cost: (getCosts().OMX + getCosts().LPS) * qty, type: 'omx', count: qty });
                } else if (isPkgLps) {
                    surcharges.push({ name: `Pkg #${index + 1} (x${qty}): LPS`, cost: getCosts().LPS * qty, type: 'lps', count: qty });
                } else if (pkgPotentialSurcharges > 0) { // AHS
                    // Re-determine reasons for display
                    let ahsReasons = [];
                    if (weight > 25 && weight < 71) ahsReasons.push('Weight');
                    if (packageType !== 'box') ahsReasons.push('Packaging');
                    if ((length > 122 || width > 76) && totalDim <= 300) ahsReasons.push('Dimensions');
                    surcharges.push({ name: `Pkg #${index + 1} (x${qty}): AHS (${ahsReasons.join(', ')})`, cost: getCosts().AHS * qty, count: qty });
                }
            }

            if (isWwef) {
                unitChargeableWeight = Math.max(unitChargeableWeight, 71);
            }

            totalSurcharge += (pkgUnitSurcharges * qty);
            potentialSaverSurcharges += (pkgPotentialSurcharges * qty);
            totalChargeableWeight += (unitChargeableWeight * qty);
        });

        // Rounding Logic
        if (rateMode === 'flat') {
            totalChargeableWeight = Math.ceil(totalChargeableWeight * 2) / 2;
        } else {
            // V19: Range Weight (> 21kg) - Always round up to next 1kg (e.g. 0.5 -> 1)
            totalChargeableWeight = Math.ceil(totalChargeableWeight);
        }

        // Basic Cost
        let basicCost = 0;

        // Apply WWEF Minimum Shipment Weight (71kg check removed as it is now per package)
        let finalBillableWeight = totalChargeableWeight;

        if (rateMode === 'flat') {
            basicCost = effectiveBasicRate; // Use discounted rate
        } else {
            basicCost = effectiveBasicRate * finalBillableWeight; // Use discounted rate
        }

        // Enforce Explicit Minimum Rate from Table (if available)
        // 1. Determine Zone (using effective country logic)
        const countryNameRaw = (shipmentType === 'export' ? destinationCountry : originCountry).toLowerCase().trim();
        let effectiveCountryName = countryNameRaw;

        if (countryNameRaw === 'china') {
            const postalCodeInput = shipmentType === 'export' ? document.getElementById('destinationPostCode') : document.getElementById('originPostCode');
            const postalCode = postalCodeInput ? postalCodeInput.value : '';
            if (isChinaSouthern(postalCode)) {
                effectiveCountryName = 'cn southern';
            }
        }

        let zone = null;
        if (COUNTRY_SERVICE_ZONES[effectiveCountryName]) {
            const cData = COUNTRY_SERVICE_ZONES[effectiveCountryName];
            if (shipmentType === 'export') {
                if (serviceType === 'saver') zone = cData.saverExport;
                else if (serviceType === 'expedited') zone = cData.expeditedExport;
                else if (serviceType === 'wwef') zone = cData.wwefExport || cData.saverExport;
            } else {
                if (serviceType === 'saver') zone = cData.saverImport;
                else if (serviceType === 'expedited') zone = cData.expeditedImport;
                else if (serviceType === 'wwef') zone = cData.wwefImport || cData.saverImport;
            }
        }

        // 2. Lookup Min Rate
        if (zone && RATES[shipmentType] && RATES[shipmentType][serviceType] && RATES[shipmentType][serviceType][zone]) {
            const tableMinRate = RATES[shipmentType][serviceType][zone]['min'];
            if (typeof tableMinRate === 'number' && tableMinRate > 0) {
                // Apply discount logic to Min Rate? Usually Minimum is also discountable?
                // Assuming Minimum Rate in table is List Price.
                const discountedMinRate = tableMinRate * (1 - discountPercent / 100);
                if (basicCost < discountedMinRate) {
                    basicCost = discountedMinRate;
                    // Optional: Log or indicate that Min Rate was applied?
                }
            }
        }

        // Shipment Level Surcharges
        let brokerageCost = 0;
        if (shipmentType === 'import') {
            brokerageCost = getCosts().BROKERAGE_IMPORT || 0; // Default to 0 if undefined
            if (brokerageCost > 0) {
                surcharges.push({ name: 'Additional Brokerage Import', cost: brokerageCost, count: 1 });
                totalSurcharge += brokerageCost;
            }
        }

        // Surge Fee
        let surgeRate = 0;
        const costs = getCosts();
        if (destination === 'eur') surgeRate = costs.SURGE.TO_EUR;
        else if (origin === 'eur') surgeRate = costs.SURGE.FROM_EUR;
        else if (origin === 'americas') surgeRate = costs.SURGE.FROM_AMERICAS;
        else if (destination === 'americas' || destination === 'ismea') surgeRate = costs.SURGE.TO_AMERICAS_ISMEA;
        else if (origin === 'israel' || destination === 'israel') surgeRate = costs.SURGE.ISRAEL;
        else if (origin === 'asia' || destination === 'asia') surgeRate = costs.SURGE.ASIA;

        let surgeTotal = 0;
        if (surgeRate > 0 && totalChargeableWeight > 0) {
            const surgeWeight = Math.ceil(totalChargeableWeight);
            surgeTotal = surgeRate * surgeWeight;
            surcharges.push({ name: `Surge Fee (${formatCurrency(surgeRate)}/kg)`, cost: surgeTotal, count: packageCount });
            totalSurcharge += surgeTotal;
        }

        // Optional Surcharges
        const optionalCheckboxes = document.querySelectorAll('#dropdown-options input[type="checkbox"]:checked');
        optionalCheckboxes.forEach(cb => {
            const val = cb.value;
            let cost = 0;
            let name = '';
            let count = 1;

            switch (val) {
                case 'extendedArea':
                    const eaMultiplier = parseInt(cb.dataset.multiplier) || 1;
                    const eaCost = Math.max(costs.OPTIONAL.EXTENDED_AREA_MIN, costs.OPTIONAL.EXTENDED_AREA_KG * totalChargeableWeight);
                    cost = eaCost * eaMultiplier;
                    name = `Extended Area${eaMultiplier > 1 ? ' (x2)' : ''}`;
                    break;
                case 'remoteArea':
                    const raMultiplier = parseInt(cb.dataset.multiplier) || 1;
                    const raCost = Math.max(costs.OPTIONAL.REMOTE_AREA_MIN, costs.OPTIONAL.REMOTE_AREA_KG * totalChargeableWeight);
                    cost = raCost * raMultiplier;
                    name = `Remote Area${raMultiplier > 1 ? ' (x2)' : ''}`;
                    break;
                case 'peb':
                    cost = costs.OPTIONAL.PEB;
                    name = 'PEB';
                    break;
                case 'residential':
                    // Saver/Expedited
                    cost = costs.OPTIONAL.RESIDENTIAL;
                    name = 'Residential (Saver/Expedited)';
                    break;
                case 'residential_wwef':
                    // WWEF
                    cost = costs.OPTIONAL.RESIDENTIAL_WWEF;
                    name = 'Residential (WWEF)';
                    break;
                case 'adultSignature':
                    cost = costs.OPTIONAL.ADULT_SIGNATURE;
                    name = 'Adult Signature';
                    break;
                case 'deliveryConfirmation':
                    cost = costs.OPTIONAL.DELIVERY_CONFIRMATION;
                    name = 'Delivery Confirmation';
                    break;
                case 'alternateBroker':
                    cost = costs.OPTIONAL.ALTERNATE_BROKER;
                    name = 'Alternate Broker';
                    break;
                case 'dutyTaxForward':
                    cost = costs.OPTIONAL.DUTY_TAX_FORWARD;
                    name = 'Duty Tax Forward';
                    break;
                case 'ipf':
                    cost = costs.OPTIONAL.IPF;
                    name = 'IPF';
                    break;
                case 'paperInvoice':
                    cost = costs.OPTIONAL.PAPER_INVOICE;
                    name = 'Paper Invoice';
                    break;
            }

            if (cost > 0) {
                surcharges.push({ name: name, cost: cost, count: count });
                totalSurcharge += cost;
            }
        });

        // Final Calculation
        const subtotal = basicCost + totalSurcharge;
        // Exclude Brokerage Import from FSI Base
        const fsiBase = subtotal - brokerageCost;
        const fsiAmount = fsiBase * (fsiPercent / 100);
        const vatAmount = (subtotal + fsiAmount) * 0.011;
        const finalTotal = subtotal + fsiAmount + vatAmount;

        // Render Results
        const resultsContainer = document.getElementById('results');
        const surchargeList = document.getElementById('surcharges-list');
        const omxOptions = document.getElementById('omx-options');
        const mixedWarning = document.getElementById('mixed-warning');
        const heavyWarning = document.getElementById('heavy-warning');
        const totalCostEl = document.getElementById('res-total-cost');

        resultsContainer.classList.remove('hidden');
        surchargeList.innerHTML = '';
        omxOptions.classList.add('hidden');
        mixedWarning.classList.add('hidden'); // Reset warning
        heavyWarning.classList.add('hidden'); // Reset warning

        document.getElementById('res-total-weight').textContent = `${totalChargeableWeight.toFixed(2)} kg`;

        // Add Origin -> Destination Row with Country Names
        const originText = originCountry ? `${originCountry} (${origin.toUpperCase()})` : origin.toUpperCase();
        const destText = destinationCountry ? `${destinationCountry} (${destination.toUpperCase()})` : destination.toUpperCase();

        const routeRow = document.createElement('tr');
        routeRow.innerHTML = `<td colspan="3" style="font-weight:bold; background:#f0f0f0;">Route: ${originText} -> ${destText}</td>`;
        surchargeList.appendChild(routeRow);

        // Basic Rate Display Name
        let basicRateName = 'Basic Rate';
        if (discountPercent > 0) {
            basicRateName += ` (Disc ${discountPercent}%)`;
        }

        const fullList = [
            { name: basicRateName, cost: basicCost, count: packageCount },
            ...surcharges,
            { name: `FSI (${fsiPercent}%)`, cost: fsiAmount, count: 1 },
            { name: 'VAT (1.1%)', cost: vatAmount, count: 1 }
        ];

        fullList.forEach(item => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
            <td>${item.name}</td>
            <td style="text-align:center;">${item.count || '-'}</td>
            <td class="amount">${formatCurrency(item.cost)}</td>
        `;
            surchargeList.appendChild(tr);
        });

        totalCostEl.textContent = formatCurrency(finalTotal);

        // Comparison Logic (Option B)
        let freightForTax = finalTotal;

        if (hasHeavyOrLarge || isComparisonNeeded) {
            omxOptions.classList.remove('hidden');
            heavyWarning.classList.remove('hidden'); // Show Heavy Warning

            const comparisonTitle = document.querySelector('#omx-options h4');
            const optAParagraph = document.getElementById('opt-a-text');
            const optBParagraph = document.getElementById('opt-b-text');

            // Calculate Saver Total (Simulated)
            const surchargeDiff = potentialSaverSurcharges;
            const fsiOnDiff = surchargeDiff * (fsiPercent / 100);
            const vatOnDiff = (surchargeDiff + fsiOnDiff) * 0.011;
            const totalDiff = surchargeDiff + fsiOnDiff + vatOnDiff;

            let wwefTotal = 0;
            // Finalize Total Weight
            // V36: Billing Weight Rounding Rule (Global >= 21kg)
            let billingWeight = totalChargeableWeight;
            if (billingWeight >= 21) {
                billingWeight = Math.ceil(billingWeight);
            }

            // Check if WWEF Min 71kg Applies
            if (isWwef) {
                if (billingWeight < 71) {
                    // WWEF has a minimum billable weight of 71kg
                    // However, for rate lookup it uses 71.
                    // We generally respect the actual weight but for rate lookup...
                }
            }
            wwefTotal = finalTotal;
            let saverTotal = 0;
            if (isWwef) {
                saverTotal = finalTotal + totalDiff;
            } else {
                saverTotal = finalTotal;
                wwefTotal = finalTotal - totalDiff;
            }

            // Use the higher/surcharged rate for Tax Calculation safety
            freightForTax = saverTotal;

            comparisonTitle.textContent = "Opsi Berat >= 70kg atau Batas Terlampaui";
            comparisonTitle.style.color = "red";

            optAParagraph.innerHTML = `<strong>Opsi 1 (WWEF):</strong> ${formatCurrency(wwefTotal)} (Biaya Tambahan Dihapus)`;
            optBParagraph.innerHTML = `<strong>Opsi 2 (Saver):</strong> ${formatCurrency(saverTotal)} (Termasuk OMX/LPS/AHS)`;
        }

        // Mixed Package Warning
        if (isMixedPackage) {
            mixedWarning.classList.remove('hidden');
        }

        // 5. Calculate Duty & Tax (if enabled)
        // Use freightForTax (includes implied Surcharges/Red Price) to ensure CIF is accurate
        // Move BEFORE Transit Prediction to prevent script errors from blocking Tax Calc
        calculateDutyTax(freightForTax);

        // 4. Update Transit Prediction
        // Wrap in try-catch just in case
        try {
            updateTransitPrediction();
        } catch (e) { console.error('Transit update error', e); }
    }

    // --- TRANSIT PREDICTION LOGIC ---
    function updateTransitPrediction() {
        if (!TRANSIT_MODEL) return;

        const transitDiv = document.getElementById('transit-prediction');
        const predTimeSpan = document.getElementById('pred-transit-time');
        const predRoutingSpan = document.getElementById('pred-routing');

        // Hide by default
        transitDiv.style.display = 'none';

        // Get Inputs
        const trafficType = document.querySelector('input[name="shipmentType"]:checked').value; // 'export' or 'import'
        const serviceVal = document.getElementById('serviceType').value; // 'saver', 'expedited', 'wwef'
        const dateStr = document.getElementById('shipmentDate').value;

        // Determine Country
        const destinationInput = document.getElementById('destinationCountry');
        const originInput = document.getElementById('originCountry');
        let countryName = (trafficType === 'export' ? destinationInput : originInput).value.trim();

        if (!countryName || !dateStr) return;

        // Get Day of Week
        const dateObj = new Date(dateStr);
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const dayName = days[dateObj.getDay()];

        // Map Country Name to Code (Basic Helper)
        // ideally we reuse a robust mapping, here we try to match what's in JSON
        // The JSON keys are UPPERCASE codes (US, AU, CN) or sometimes Names?
        // Let's check the Python script... it generated Keys as 'Country' column value. 
        // In the Excel file, 'Country' was "AU", "CA", "CN", "US". So 2-letter codes!
        // We need a Name -> Code Mapper.

        const COUNTRY_NAME_TO_CODE = {
            "united states": "US", "usa": "US", "us": "US",
            "australia": "AU", "austria": "AT",
            "china": "CN", "cn": "CN",
            "singapore": "SG", "malaysia": "MY", "hong kong": "HK",
            "japan": "JP", "taiwan": "TW", "thailand": "TH", "vietnam": "VN",
            "korea": "KR", "south korea": "KR", "philippines": "PH",
            "indonesia": "ID", "india": "IN",
            "germany": "DE", "france": "FR", "united kingdom": "GB", "uk": "GB",
            "netherlands": "NL", "belgium": "BE", "italy": "IT", "spain": "ES",
            "switzerland": "CH", "sweden": "SE", "norway": "NO", "denmark": "DK",
            "finland": "FI", "ireland": "IE", "portugal": "PT", "poland": "PL",
            "czech republic": "CZ", "hungary": "HU", "romania": "RO", "greece": "GR",
            "russia": "RU", "turkey": "TR", "uae": "AE", "united arab emirates": "AE",
            "audi arabia": "SA", "saudi arabia": "SA",
            "canada": "CA", "mexico": "MX", "brazil": "BR", "argentina": "AR",
            "chile": "CL", "colombia": "CO", "peru": "PE",
            "new zealand": "NZ"
        };

        const code = COUNTRY_NAME_TO_CODE[countryName.toLowerCase()];
        if (!code) return; // No mapping found

        // Look up in Model
        let foundData = null;

        let serviceKey = "";
        if (serviceVal === 'saver') serviceKey = "UPS saver";
        else if (serviceVal === 'expedited') serviceKey = "UPS expedited";
        else if (serviceVal === 'wwef') serviceKey = "UPS wwef";

        if (TRANSIT_MODEL[trafficType] && TRANSIT_MODEL[trafficType][code]) {
            let countryData = TRANSIT_MODEL[trafficType][code];
            Object.keys(countryData).forEach(k => {
                if (k.toLowerCase().includes(serviceVal)) {
                    foundData = countryData[k][dayName];
                }
            });
        }

        // --- FALLBACK LOGIC (Extrapolation) ---
        if (!foundData) {
            foundData = getExtrapolatedTransit(trafficType, code, serviceVal);
        }

        if (foundData) {
            // User Request: Round up transit time (e.g. 2.2 -> 3)
            const rawTransit = String(foundData.transit).replace(',', '.');
            const transitDays = Math.ceil(parseFloat(rawTransit) || 0);
            predTimeSpan.textContent = `${transitDays} Days`;
            predRoutingSpan.textContent = foundData.route || '-';
            transitDiv.style.display = 'block';
        }
    }

    // Helper: Generate Routing based on Region logic
    function getExtrapolatedTransit(trafficType, code, serviceType) {
        // Define Regional Hubs
        const REGIONS = {
            'EU': ['DE', 'FR', 'GB', 'IT', 'ES', 'NL', 'BE', 'AT', 'SE', 'NO', 'FI', 'DK', 'IE', 'PT', 'PL', 'CZ', 'HU', 'RO', 'CH', 'GR', 'TR', 'RU'],
            'AM': ['US', 'CA', 'MX', 'BR', 'AR', 'CL', 'CO', 'PE'],
            'EA': ['JP', 'KR', 'TW', 'CN', 'HK'],
            'SEA': ['SG', 'MY', 'TH', 'VN', 'PH', 'ID'],
            'ME': ['AE', 'SA', 'QA', 'KW', 'OM', 'LB', 'JO'],
            'OC': ['AU', 'NZ']
        };

        let region = null;
        for (const [rKey, countries] of Object.entries(REGIONS)) {
            if (countries.includes(code)) {
                region = rKey;
                break;
            }
        }

        if (!region) return null; // Unknown region

        // Logic Patterns
        let route = '';
        let transit = 0;

        if (trafficType === 'export') {
            // ID -> World (Routing via Major Hubs)
            if (region === 'EU') {
                // Main Hub: Cologne (CGN), Germany
                route = `ID - SG - CN - IN - DE (Cologne) - ${code}`;
                transit = 5;
            } else if (region === 'AM') {
                // Main Hub: Louisville (SDF), USA
                if (code === 'US') {
                    route = `ID - SG - HK - US (Louisville) - ${code}`;
                    transit = 5;
                } else {
                    route = `ID - SG - HK - US (Louisville) - ${code}`;
                    transit = 6;
                }
            } else if (region === 'EA') {
                // Intra-Asia Hubs: Shenzhen (SZX) / Hong Kong (HKG)
                route = `ID - SG - CN (Shenzhen) - ${code}`;
                transit = 3;
            } else if (region === 'SEA') {
                route = `ID - SG - ${code}`;
                transit = 2;
            } else if (region === 'ME') {
                // Dubai (DXB) is often a gateway
                route = `ID - SG - CN - AE (Dubai) - ${code}`;
                transit = 4;
            } else if (region === 'OC') {
                route = `ID - SG - AU (Sydney) - ${code}`;
                transit = 4;
            }
        } else {
            // World -> ID
            if (region === 'EU') {
                route = `${code} - DE (Cologne) - CN - SG - ID`;
                transit = 5;
            } else if (region === 'AM') {
                route = `${code} - US (Louisville) - HK - SG - ID`;
                transit = 7;
            } else if (region === 'EA') {
                route = `${code} - CN (Shenzhen) - SG - ID`;
                transit = 4;
            } else if (region === 'SEA') {
                route = `${code} - SG - ID`;
                transit = 2;
            } else if (region === 'ME') {
                route = `${code} - AE (Dubai) - CN - SG - ID`;
                transit = 5;
            } else if (region === 'OC') {
                route = `${code} - AU - SG - ID`;
                transit = 4;
            }
        }

        // Add 1 day for non-Saver services just as a heuristic?
        if (serviceType === 'expedited') transit += 2;

        return { transit, route };
    }


    // --- DUTY & TAX LOGIC ---

    function initDutyTaxListeners() {
        const toggle = document.getElementById('enable-duty-tax');
        const container = document.getElementById('duty-tax-inputs');
        const resultBox = document.getElementById('duty-tax-result');
        const handlingInputs = document.getElementById('handling-inputs');

        // Traffic Type Listener (Export vs Import)
        const trafficRadios = document.querySelectorAll('input[name="shipmentType"]');
        const dutyTaxSection = toggle.closest('.section-box');

        function updateDutyTaxVisibility() {
            const trafficType = document.querySelector('input[name="shipmentType"]:checked').value;
            if (trafficType === 'import') {
                dutyTaxSection.style.display = 'block';
            } else {
                dutyTaxSection.style.display = 'none';
                if (toggle.checked) {
                    toggle.checked = false;
                    toggle.dispatchEvent(new Event('change'));
                }
            }
        }

        trafficRadios.forEach(r => r.addEventListener('change', updateDutyTaxVisibility));
        updateDutyTaxVisibility();

        // Importer Type Listener
        const importerType = document.getElementById('importer-type');
        const npwpSelect = document.getElementById('has-npwp');

        importerType.addEventListener('change', (e) => {
            const val = e.target.value;
            const apiOption = npwpSelect.querySelector('option[value="api"]');

            if (val === 'personal') {
                if (apiOption) apiOption.style.display = 'none';
                if (npwpSelect.value === 'api') npwpSelect.value = 'yes';
            } else {
                if (apiOption) apiOption.style.display = 'block';
            }
            // Recalc on change
            const getFreight = () => {
                const txt = document.getElementById('res-used-freight').textContent;
                return parseFloat(txt.replace(/[^0-9]/g, '')) || 0;
            };
            calculateDutyTax(getFreight());
        });

        // Also Trigger Recalc on NPWP Change directly
        npwpSelect.addEventListener('change', () => {
            const getFreight = () => {
                const txt = document.getElementById('res-used-freight').textContent;
                return parseFloat(txt.replace(/[^0-9]/g, '')) || 0;
            };
            calculateDutyTax(getFreight());
        });
        importerType.dispatchEvent(new Event('change'));

        // Toggle Visibility
        toggle.addEventListener('change', (e) => {
            if (e.target.checked) {
                container.style.display = 'block';
                setTimeout(() => {
                    container.style.opacity = '1';
                    container.style.pointerEvents = 'auto';
                }, 10);
                resultBox.style.display = 'block';
                // Trigger calc
                const getFreight = () => {
                    const txt = document.getElementById('res-used-freight').textContent;
                    return parseFloat(txt.replace(/[^0-9]/g, '')) || 0;
                };
                calculateDutyTax(getFreight());
            } else {
                container.style.opacity = '0';
                container.style.pointerEvents = 'none';
                setTimeout(() => container.style.display = 'none', 300);
                resultBox.style.display = 'none';
            }
        });

        // Handling Fee Toggle
        const enableHandling = document.getElementById('enable-handling');
        enableHandling.addEventListener('change', (e) => {
            handlingInputs.style.display = e.target.checked ? 'block' : 'none';
            // Recalc
            const getFreight = () => {
                const txt = document.getElementById('res-used-freight').textContent;
                return parseFloat(txt.replace(/[^0-9]/g, '')) || 0;
            };
            calculateDutyTax(getFreight());
        });

        // Auto format currency inputs (Global ones)
        ['val-insurance', 'val-kurs', 'val-handling-fee', 'val-disbursement-fee', 'val-doc-fee', 'val-storage-fee'].forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.addEventListener('input', function () {
                    formatCurrencyInput(this);
                    // Recalc on input
                    const getFreight = () => {
                        const txt = document.getElementById('res-used-freight').textContent;
                        return parseFloat(txt.replace(/[^0-9]/g, '')) || 0;
                    };
                    calculateDutyTax(getFreight());
                });
            }
        });

        // Initialize Row Listeners (HS Code, Values)
        // Ensure setupRowListeners is defined (it is defined below in the file)
        if (typeof setupRowListeners === 'function') {
            setupRowListeners();
        }
    }



    // Helper: Check for MFN Exceptions (PMK 96 2023: Tas, Sepatu, Tekstil, etc.)
    function checkExceptionGoods(dutyRows) {
        // PMK 96 2023 Exceptions (Must pay MFN): 
        // 1. Tas (4202), 2. Buku (49), 3. Tekstil (61-63), 4. Alas Kaki (64)
        // 5. Kosmetik (3303-3307), 6. Besi Baja (73), 7. Sepeda (8711/8712), 8. Jam Tangan (9101/9102)
        const EXCEPTION_PREFIXES = ['3303', '3304', '3305', '3306', '3307', '4202', '4901', '4902', '4903', '4904', '61', '62', '63', '64', '73', '8711', '8712', '9101', '9102'];

        let found = false;
        dutyRows.forEach(row => {
            const input = row.querySelector('.hs-code-input');
            if (input && input.value) {
                const hsVal = input.value.replace(/\D/g, '');
                if (EXCEPTION_PREFIXES.some(prefix => hsVal.startsWith(prefix))) found = true;
            }
        });
        return found;
    }

    function calculateDutyTax(freightIDR) {
        if (!document.getElementById('enable-duty-tax').checked) {
            document.getElementById('duty-tax-result').style.display = 'none';
            return;
        }
        document.getElementById('duty-tax-result').style.display = 'block';

        // Auto-Correct: If freight is 0/missing, try to grab from Main Result (Red Price)
        // This ensures tax calc never loses sync with the main cost shown to user.
        if (!freightIDR || freightIDR === 0) {
            const mainTotalTxt = document.getElementById('res-total-cost').textContent;
            const mainTotal = parseFloat(mainTotalTxt.replace(/[^0-9]/g, '')) || 0;
            if (mainTotal > 0) {
                freightIDR = mainTotal;
            }
        }

        // Helper for IDR Format (1.000,00) -> 1000.00
        const parseLoc = (val) => {
            if (!val) return 0;
            return parseFloat(val.toString().replace(/\./g, '').replace(',', '.')) || 0;
        };

        // 1. Get Global Inputs
        const insuranceValRaw = parseLoc(document.getElementById('val-insurance').value);
        const kurs = parseLoc(document.getElementById('val-kurs').value) || 16500;

        // Insurance is typically in USD based on label
        const insuranceIDR = insuranceValRaw * kurs;

        // 2. Multi-Row Aggregation
        let totalGoodsFobIDR = 0;
        const dutyRows = document.querySelectorAll('#duty-rows tr');

        // Pass 1: Calculate Total FOB to determine proration shares
        dutyRows.forEach(row => {
            const currency = row.querySelector('.row-currency').value;
            const valStr = row.querySelector('.row-value-input').value;
            const rawVal = parseLoc(valStr);

            if (currency === 'USD') {
                totalGoodsFobIDR += (rawVal * kurs);
            } else {
                totalGoodsFobIDR += rawVal;
            }
        });

        // Pass 2: Calculate Duty Per Item (MFN Basis)
        const totalSharedCost = freightIDR + insuranceIDR; // Freight + Insurance to be prorated
        const totalCifIDR = totalGoodsFobIDR + totalSharedCost;

        // Convert to USD for Threshold Validation
        const totalFobUSD = totalGoodsFobIDR / kurs;
        const totalCifUSD = totalCifIDR / kurs;

        // Check Exceptions
        const isException = checkExceptionGoods(dutyRows);

        let activeTier = 'mfn'; // 'deminimis' | 'flat' | 'mfn' | 'mfn-exception'
        let appliedBM = 0;
        let appliedPPN = 0;
        let appliedPPH = 0;
        let taxBase = 0;

        // 1. Determine Tier (Strict Priority: Exceptions > De Minimis > Flat > MFN)
        if (isException) {
            activeTier = 'mfn-exception';
        } else if (totalFobUSD <= 3) {
            activeTier = 'deminimis';
        } else if (totalFobUSD <= 1500) {
            activeTier = 'flat';
        } else {
            activeTier = 'mfn';
        }

        // 2. Apply Calculation based on Tier
        if (activeTier === 'deminimis') {
            // De Minimis: BM 0%, PPh 0%, PPN 11%
            // Tax Base = CIF (since BM is 0)
            appliedBM = 0;
            taxBase = totalCifIDR;
            appliedPPN = Math.round(taxBase * 0.11);
            appliedPPH = 0;

        } else if (activeTier === 'flat') {
            // Flat Rate: BM 7.5%, PPh 0%, PPN 11% (No PPh)
            appliedBM = Math.round(totalCifIDR * 0.075);
            taxBase = totalCifIDR + appliedBM;
            appliedPPN = Math.round(taxBase * 0.11);
            appliedPPH = 0;

        } else {
            // MFN (Standard OR Exception)
            // Calculate Duty Per Item
            dutyRows.forEach(row => {
                const currency = row.querySelector('.row-currency').value;
                const valStr = row.querySelector('.row-value-input').value;
                const bmStr = row.querySelector('.hs-rate-input').value;
                const hsCodeRaw = row.querySelector('.hs-code-input').value;

                const rawVal = parseLoc(valStr);
                let bmRate = parseLoc(bmStr);
                const hsCode = hsCodeRaw.replace(/[^0-9]/g, '');

                // PMK 4/2025 Override Logic (Specific Rates for MFN Exceptions)
                if (hsCode) {
                    let overridden = false;
                    if (hsCode.startsWith('49')) { bmRate = 0; overridden = true; } // Buku
                    else if (hsCode.startsWith('91')) { bmRate = 15; overridden = true; } // Jam Tangan
                    else if (hsCode.startsWith('33')) { bmRate = 15; overridden = true; } // Kosmetik
                    else if (hsCode.startsWith('73')) { bmRate = 15; overridden = true; } // Besi Baja
                    else if (hsCode.startsWith('61') || hsCode.startsWith('62') || hsCode.startsWith('63')) { bmRate = 25; overridden = true; } // Tekstil
                    else if (hsCode.startsWith('64')) { bmRate = 25; overridden = true; } // Sepatu
                    else if (hsCode.startsWith('4202')) { bmRate = 25; overridden = true; } // Tas
                    else if (hsCode.startsWith('8711') || hsCode.startsWith('8712')) { bmRate = 25; overridden = true; } // Sepeda

                    // Update UI if overridden to show user the enforced rate
                    if (overridden) {
                        row.querySelector('.hs-rate-input').value = bmRate;
                    }
                }

                let rowFobIDR = (currency === 'USD') ? rawVal * kurs : rawVal;

                // Proration Share
                let share = 0;
                if (totalGoodsFobIDR > 0) {
                    share = rowFobIDR / totalGoodsFobIDR;
                }

                // Item CIF = Item FOB + (Freight+Ins * Share)
                const itemCif = rowFobIDR + (totalSharedCost * share);

                // CEISA Rounding Rules (PMK 190/2022):
                // BM: Round UP to nearest 1000 per Item Type.
                // PPN/PPh: Round DOWN to nearest 1 Rupiah (Standard).

                // Calculate Raw Duty
                let rawDuty = itemCif * (bmRate / 100);

                // Exemptions (De Minimis / Flat Rate Logic overrides this normally, 
                // but this loop is for MFN. MFN requires 1000 ceiling).
                let itemDuty = Math.ceil(rawDuty / 1000) * 1000;

                // Add to Total
                appliedBM += itemDuty;
            });

            taxBase = totalCifIDR + appliedBM;
            appliedPPN = Math.floor(taxBase * 0.11);

            // PPh Calculation (MFN Only)
            const npwpSelect = document.getElementById('has-npwp');
            let pphRate = 0.075; // Default Non-API
            if (npwpSelect.value === 'no') pphRate = 0.15; // No NPWP
            else if (npwpSelect.value === 'api') pphRate = 0.025; // API
            else pphRate = 0.075; // NPWP only

            appliedPPH = Math.floor(taxBase * pphRate);
        }

        // Auto-Update Warehouse Days (3 days for <$1500/Flat/DeMinimis, 5 days for MFN)
        const whDaysInput = document.getElementById('val-warehouse-days');
        if (whDaysInput) {
            let targetDays = 3;
            if (activeTier === 'mfn' || activeTier === 'mfn-exception') targetDays = 5;
            // Update value if not being typed in
            if (document.activeElement !== whDaysInput) {
                whDaysInput.value = targetDays;
            }
        }

        let totalTax = appliedBM + appliedPPN + appliedPPH;


        // 6. Handling Fees
        const enableHandling = document.getElementById('enable-handling').checked;
        const resHandlingRow = document.getElementById('res-handling-row');
        let totalHandling = 0;

        if (totalTax > 0) {
            const handlingFee = Math.max(200000, Math.ceil(totalTax * 0.025));
            const disbursementFee = Math.max(94159, Math.ceil(totalTax * 0.059));

            document.getElementById('val-handling-fee').value = formatCurrency(handlingFee).replace('IDR ', '');
            document.getElementById('val-disbursement-fee').value = formatCurrency(disbursementFee).replace('IDR ', '');

            if (enableHandling) {
                const docFee = parseFloat(document.getElementById('val-doc-fee').value.replace(/\./g, '')) || 0;
                const whDays = parseFloat(document.getElementById('val-warehouse-days').value) || 0;

                // Storage Fee Logic (Mock weight read)
                const weightText = document.getElementById('res-total-weight').textContent;
                const weight = parseFloat(weightText.replace(' kg', '')) || 0;
                let storageFee = 0;
                if (whDays >= 3) {
                    storageFee = Math.ceil(3016 * weight * whDays);
                }
                document.getElementById('val-storage-fee').value = formatCurrency(storageFee).replace('IDR ', '');

                totalHandling = handlingFee + disbursementFee + docFee + storageFee;
                resHandlingRow.classList.remove('hidden');
                document.getElementById('res-handling').textContent = formatCurrency(totalHandling);
            } else {
                resHandlingRow.classList.add('hidden');
            }
        } else {
            resHandlingRow.classList.add('hidden');
        }

        totalTax += totalHandling;

        // Display Results
        document.getElementById('res-cif').textContent = formatCurrency(totalCifIDR);
        document.getElementById('res-bm').textContent = formatCurrency(appliedBM);
        document.getElementById('res-ppn').textContent = formatCurrency(appliedPPN);
        document.getElementById('res-pph').textContent = formatCurrency(appliedPPH);
        document.getElementById('res-total-tax').textContent = formatCurrency(totalTax);

        // Update Header/Info to show tier (Hack: Append to CIF label or similar? Or just log/alert? 
        // User asked for logic fix. I'll leave UI structure as is but update values correct.)
        // Update Header/Info to show tier
        const taxTitle = document.querySelector('#duty-tax-result h4');
        if (taxTitle) {
            let tierText = "MFN (CIF > $1500)";
            if (activeTier === 'deminimis') tierText = "De Minimis (FOB <= $3)";
            else if (activeTier === 'flat') tierText = "Flat Rate (CIF <= $1500)";
            else if (activeTier === 'mfn-exception') tierText = "MFN (Exception Goods/Lartas)";
            taxTitle.textContent = `Estimasi Duty & Tax (${tierText})`;
        }

        document.getElementById('res-used-freight').textContent = formatCurrency(freightIDR);
        document.getElementById('res-used-kurs').textContent = formatCurrency(kurs);
    }

    // Helper: Copy HS & Open INSW
    window.checkINSW = function (el) {
        const row = el.closest('tr');
        const input = row.querySelector('.hs-code-input');
        if (!input) return;

        const hsCode = input.value.trim();
        if (!hsCode) {
            alert("HS Code kosong!");
            return;
        }

        // Remove dots
        const cleanHS = hsCode.replace(/\./g, '');

        // Copy to clipboard
        navigator.clipboard.writeText(cleanHS).then(() => {
            // Open INSW
            window.open('https://insw.go.id/intr', '_blank');
        }).catch(err => {
            console.error('Failed to copy: ', err);
            window.open('https://insw.go.id/intr', '_blank');
        });
    };

    // --- NEW: Multi-Row Listener Setup ---
    function setupRowListeners() {
        const rows = document.querySelectorAll('#duty-rows tr');

        // Helper to get last calculated freight
        // Helper to get last calculated freight
        const getFreight = () => {
            const txt = document.getElementById('res-used-freight').textContent;
            let val = parseFloat(txt.replace(/[^0-9]/g, '')) || 0;
            // Fallback to Main Total if Duty Freight is missing/zero
            if (val === 0) {
                const main = document.getElementById('res-total-cost').textContent;
                val = parseFloat(main.replace(/[^0-9]/g, '')) || 0;
            }
            return val;
        };

        rows.forEach(row => {
            const searchInput = row.querySelector('.hs-code-input');
            const resultsDiv = row.querySelector('.hs-results-container');
            const rateInput = row.querySelector('.hs-rate-input');
            const valueInput = row.querySelector('.row-value-input');
            const currencySelect = row.querySelector('.row-currency');
            const displayDiv = row.querySelector('.selected-hs-display');

            // Search Logic
            searchInput.addEventListener('input', function () {
                const query = this.value.toLowerCase();
                if (query.length < 3) { resultsDiv.style.display = 'none'; return; }

                const HS_DATA = window.HS_DATA_SOURCE;
                if (!HS_DATA) return;

                const matches = HS_DATA.filter(item =>
                    item.hs.replace(/\./g, '').includes(query) ||
                    item.desc.toLowerCase().includes(query)
                ).slice(0, 50);

                resultsDiv.innerHTML = '';
                if (matches.length > 0) {
                    matches.forEach(item => {
                        const div = document.createElement('div');
                        div.style.padding = '5px'; div.style.cursor = 'pointer'; div.style.borderBottom = '1px solid #eee'; div.style.fontSize = '0.85em';
                        div.innerHTML = `<strong>${item.hs}</strong> - ${item.desc} (BM: ${item.bm}%)`;

                        div.addEventListener('click', () => {
                            searchInput.value = `${item.hs}`; // Use item.hs
                            displayDiv.textContent = item.desc;
                            displayDiv.style.display = 'block';
                            rateInput.value = item.bm;
                            resultsDiv.style.display = 'none';
                            calculateDutyTax(getFreight());
                        });

                        div.onmouseover = () => div.style.background = '#f0f0f0';
                        div.onmouseout = () => div.style.background = 'white';
                        resultsDiv.appendChild(div);
                    });
                    resultsDiv.style.display = 'block';
                } else { resultsDiv.style.display = 'none'; }
            });

            // Close Search
            document.addEventListener('click', (e) => {
                if (!searchInput.contains(e.target) && !resultsDiv.contains(e.target)) resultsDiv.style.display = 'none';
            });

            // Recalc Triggers
            rateInput.addEventListener('input', () => calculateDutyTax(getFreight()));
            valueInput.addEventListener('input', () => calculateDutyTax(getFreight()));
            currencySelect.addEventListener('change', () => calculateDutyTax(getFreight()));
        });
    }

    // Helpers copied from Duty Calc
    function parseLocaleNumber(stringNumber) {
        if (!stringNumber) return 0;
        return parseFloat(stringNumber.replace(/,/g, '')) || 0;
    }

    function formatCurrencyInput(input) {
        let val = input.value.replace(/[^0-9.]/g, '');
        if (val === "") return;
        let parts = val.split('.');
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        input.value = parts.join('.');
    }

    // Init Listener immediately
    initDutyTaxListeners();

    // Add Listener for Warehouse Days
    const whDaysInput = document.getElementById('val-warehouse-days');
    if (whDaysInput) {
        whDaysInput.addEventListener('input', function () {
            // Re-trigger calculation. 
            // We need to know freightIDR to call calculateDutyTax.
            // We can trigger the main calculate button, or just update if we knew the last freight.
            // Simplest is to trigger main calculate to ensure everything syncs.
            // But wait, calculateDutyTax is called at end of calculate().
            // So just calling calculate() is safe.
            // However, calculate() reads inputs.
            // We need to make sure we don't cause infinite loop.
            // Just triggering calculate() is fine.
            // document.getElementById('calculator-form').dispatchEvent(new Event('submit')); // Might be too heavy?
            // calculate() function is globally available inside scope? Yes.
            calculate();
        });
    }

}); // Closes DOMContentLoaded

