
/**
 * zip_screening_lib.js
 * Library for handling Zip Code normalization and Surcharge Screening for UPS Calculator.
 * 
 * Dependencies:
 * - EAS_RAS_DATA (Global Variable from city_data.js)
 * - EAS_RAS_CITIES (Global Variable from city_data.js)
 */

window.ZipScreeningLib = (function () {

    /**
     * Normalizes a postal code based on country rules.
     * @param {string} country - The country name.
     * @param {string} zip - The raw zip code input.
     * @returns {string} - The normalized zip code.
     */
    function normalizeZip(country, zip) {
        if (!zip) return "";

        // 1. Split by separators (space, dash) to get the "primary" part
        // Examples: "12345-6789" -> "12345", "AB37 9CD" -> "AB37", "1790 AB" -> "1790"
        let parts = zip.toString().trim().split(/[\s-]+/);
        let cleanZip = parts[0];

        // 2. Remove non-digits for numeric range checking
        // This assumes the range data in city_data.js is purely numeric and based on the numeric part of the zip prefix.
        cleanZip = cleanZip.replace(/[^0-9]/g, '');

        const countryLower = country.toLowerCase().trim();

        // Rule: US/United States - Truncate if still > 5 (Safety)
        if (countryLower === 'united states' || countryLower === 'usa' || countryLower === 'us') {
            if (cleanZip.length > 5) {
                cleanZip = cleanZip.substring(0, 5);
                console.log(`ZipScreeningLib: Truncated US Zip '${zip}' to '${cleanZip}'`);
            }
        }

        return cleanZip;
    }

    /**
     * Lookup surcharge type (EAS/RAS) for a given location.
     * @param {string} country - Country Name
     * @param {string} zip - Postal Code
     * @param {string} city - City Name
     * @param {string} context - 'origin' or 'destination'
     * @returns {string|null} - 'EAS', 'RAS', or null
     */
    function getSurcharge(country, zip, city, context) {
        if (!country) return null;

        // Country Aliases
        const aliases = {
            "usa": "United States",
            "us": "United States",
            "uk": "United Kingdom",
            "great britain": "United Kingdom",
            "uae": "United Arab Emirates",
            "korea": "South Korea",
            "south korea": "South Korea" // ensure casing match if needed, though we do case-insensitive search later
        };

        let effectiveCountry = country;
        const lowerC = country.toLowerCase().trim();
        if (aliases[lowerC]) {
            effectiveCountry = aliases[lowerC];
        }

        const effectiveZip = normalizeZip(effectiveCountry, zip);
        const cityTrimmed = city ? city.trim() : "";

        // --- 1. RANGE LOOKUP (Postal Code) ---
        if (typeof EAS_RAS_DATA !== 'undefined' && EAS_RAS_DATA) {
            let ranges = EAS_RAS_DATA[effectiveCountry]; // Try exact
            if (!ranges) ranges = EAS_RAS_DATA[effectiveCountry.trim()];
            if (!ranges && effectiveCountry.toLowerCase) ranges = EAS_RAS_DATA[effectiveCountry.toLowerCase().trim()];

            // Fallback to case-insensitive key search
            if (!ranges) {
                const lowerInput = effectiveCountry.toLowerCase().trim();
                const matchedKey = Object.keys(EAS_RAS_DATA).find(k => k.toLowerCase().trim() === lowerInput);
                if (matchedKey) ranges = EAS_RAS_DATA[matchedKey];
            }

            if (ranges && Array.isArray(ranges) && effectiveZip) {
                // For numeric ranges, we strip non-digits typically.
                // Assuming city_data.js 'low' and 'high' are numeric.
                const zipNum = parseInt(effectiveZip.replace(/[^0-9]/g, ''));

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
        }

        // --- 2. CITY LOOKUP (Fallback) ---
        if (typeof EAS_RAS_CITIES !== 'undefined' && EAS_RAS_CITIES && cityTrimmed && cityTrimmed.length > 1) {
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
                const searchCity = cityTrimmed.toLowerCase();
                // Find matching city
                const matchedCity = cityList.find(c => c.name.toLowerCase().trim() === searchCity);

                if (matchedCity) {
                    if (context === 'origin' && matchedCity.originType) return matchedCity.originType;
                    if (context === 'destination' && matchedCity.destType) return matchedCity.destType;
                }
            }
        }

        return null; // No Surcharge
    }

    return {
        normalizeZip: normalizeZip,
        getSurcharge: getSurcharge
    };

})();
