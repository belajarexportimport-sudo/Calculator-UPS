
// Mock Data (Partial)
const EAS_RAS_DATA = {
    "United States": [
        { low: 44233, high: 44233, originType: null, destType: "EAS" }
    ],
    "Germany": [
        { low: 39393, high: 39393, originType: null, destType: "EAS" }
    ]
};

// Simulate Library (Pasted from updated file for standalone test)
const ZipScreeningLib = (function () {
    function normalizeZip(country, zip) {
        if (!zip) return "";
        let parts = zip.toString().trim().split(/[\s-]+/);
        let cleanZip = parts[0];
        cleanZip = cleanZip.replace(/[^0-9]/g, ''); // Strip non-digits

        const countryLower = country.toLowerCase().trim();
        if (countryLower === 'united states' || countryLower === 'usa' || countryLower === 'us') {
            if (cleanZip.length > 5) cleanZip = cleanZip.substring(0, 5);
        }
        return cleanZip;
    }

    function getSurcharge(country, zip, city, context) {
        if (!country) return null;

        // Alias
        const aliases = { "usa": "United States", "us": "United States", "germany": "Germany" };
        let effectiveCountry = country;
        if (aliases[country.toLowerCase()]) effectiveCountry = aliases[country.toLowerCase()];

        const effectiveZip = normalizeZip(effectiveCountry, zip);

        if (EAS_RAS_DATA[effectiveCountry]) {
            const ranges = EAS_RAS_DATA[effectiveCountry];
            const rawZipNum = effectiveZip.replace(/[^0-9]/g, '');
            const zipNum = parseInt(rawZipNum, 10);

            if (!isNaN(zipNum)) {
                for (const range of ranges) {
                    const low = parseInt(range.low, 10);
                    const high = parseInt(range.high, 10);
                    if (zipNum >= low && zipNum <= high) {
                        console.log(`Match: ${effectiveCountry} ${zip} -> ${range.destType}`);
                        if (context === 'destination' && range.destType) return range.destType;
                    }
                }
            }
        }
        return null;
    }

    return { getSurcharge };
})();

// Test Cases
console.log("Testing US 44233 (Expected EAS):", ZipScreeningLib.getSurcharge("United States", "44233", "", "destination"));
console.log("Testing Germany 39393 (Expected EAS):", ZipScreeningLib.getSurcharge("Germany", "39393", "", "destination"));
console.log("Testing Germany 39393 String (Expected EAS):", ZipScreeningLib.getSurcharge("Germany", "39393", "", "destination"));
