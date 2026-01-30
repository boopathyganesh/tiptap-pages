/**
 * Page format presets following TipTap Pro official patterns
 * All dimensions are in pixels at 96 DPI
 */
/**
 * Standard page format presets
 * Following TipTap Pro official format options
 */
export const PAGE_FORMATS = {
    // A4 - 210mm × 297mm (8.27in × 11.69in at 96 DPI)
    A4: {
        name: 'A4',
        width: 794, // 210mm ≈ 8.27in × 96 DPI
        height: 1123, // 297mm ≈ 11.69in × 96 DPI
        margins: {
            top: 72, // 0.75in
            right: 48, // 0.5in
            bottom: 72, // 0.75in
            left: 48 // 0.5in
        }
    },
    // A3 - 297mm × 420mm (11.69in × 16.54in at 96 DPI)
    A3: {
        name: 'A3',
        width: 1123, // 297mm ≈ 11.69in × 96 DPI
        height: 1587, // 420mm ≈ 16.54in × 96 DPI
        margins: {
            top: 72,
            right: 72,
            bottom: 72,
            left: 72
        }
    },
    // A5 - 148mm × 210mm (5.83in × 8.27in at 96 DPI)
    A5: {
        name: 'A5',
        width: 559, // 148mm ≈ 5.83in × 96 DPI
        height: 794, // 210mm ≈ 8.27in × 96 DPI
        margins: {
            top: 48,
            right: 36,
            bottom: 48,
            left: 36
        }
    },
    // US Letter - 8.5in × 11in at 96 DPI
    Letter: {
        name: 'Letter',
        width: 816, // 8.5in × 96 DPI
        height: 1056, // 11in × 96 DPI
        margins: {
            top: 72, // 0.75in
            right: 48, // 0.5in
            bottom: 72, // 0.75in
            left: 48 // 0.5in
        }
    },
    // US Legal - 8.5in × 14in at 96 DPI
    Legal: {
        name: 'Legal',
        width: 816, // 8.5in × 96 DPI
        height: 1344, // 14in × 96 DPI
        margins: {
            top: 72,
            right: 48,
            bottom: 72,
            left: 48
        }
    },
    // Tabloid - 11in × 17in at 96 DPI
    Tabloid: {
        name: 'Tabloid',
        width: 1056, // 11in × 96 DPI
        height: 1632, // 17in × 96 DPI
        margins: {
            top: 72,
            right: 72,
            bottom: 72,
            left: 72
        }
    }
};
/**
 * Convert PageFormat to PageOptions
 */
export function pageFormatToOptions(format) {
    const pageFormat = typeof format === 'string' ? PAGE_FORMATS[format] : format;
    if (!pageFormat) {
        throw new Error(`Unknown page format: ${format}`);
    }
    return {
        bodyHeight: pageFormat.height,
        bodyWidth: pageFormat.width,
        pageLayout: {
            margins: {
                // Convert pixels back to inches for consistency
                top: { unit: 'INCHES', value: pageFormat.margins.top / 96 },
                bottom: { unit: 'INCHES', value: pageFormat.margins.bottom / 96 },
                left: { unit: 'INCHES', value: pageFormat.margins.left / 96 },
                right: { unit: 'INCHES', value: pageFormat.margins.right / 96 }
            }
        }
    };
}
/**
 * Get page format by name
 */
export function getPageFormat(name) {
    return PAGE_FORMATS[name];
}
/**
 * Get all available page format names
 */
export function getPageFormatNames() {
    return Object.keys(PAGE_FORMATS);
}
