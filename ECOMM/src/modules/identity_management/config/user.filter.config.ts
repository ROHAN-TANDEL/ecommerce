import { UserColumnConfig } from "./user.column.config.js";

function parseDateInput(dateStr: any): string {
    if (!dateStr || typeof dateStr !== 'string') return dateStr;
    const trimmed = dateStr.trim();
    // match DD-MM-YYYY or DD/MM/YYYY
    const dmyMatch = trimmed.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
    if (dmyMatch) {
        const [, day, month, year] = dmyMatch;
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
    return trimmed;
}

/**
 * Builds the Master Filter SQL clause across searchable columns.
 * Can be used as:
 *   query = query + MasterFilterConfig(inputs);
 * or
 *   query = query + MasterFilterConfig(inputs, values);
 */
export function MasterFilterConfig(inputs: any, valuesArray?: any[]): string {
    const values = valuesArray || inputs?.values || (inputs.values = []);
    const search = inputs?.master_search || inputs?.master || inputs?.search || inputs?.q || inputs?.filters?.search || inputs?.filters?.q;

    if (!search || typeof search !== 'string' || search.trim() === '') {
        return '';
    }

    const term = `%${search.trim()}%`;
    const idx = values.length + 1;
    values.push(term);

    return ` AND (first_name ILIKE $${idx} OR last_name ILIKE $${idx} OR email ILIKE $${idx} OR status ILIKE $${idx})`;
}

/**
 * Builds the User / Custom Filter SQL clause based on UserColumnConfig and input parameters.
 * Can be used as:
 *   query = query + UserFilterConfig(inputs);
 * or
 *   query = query + UserFilterConfig(inputs, values);
 */
export function UserFilterConfig(inputs: any, valuesArray?: any[]): string {
    const values = valuesArray || inputs?.values || (inputs.values = []);
    let clause = '';

    if (!inputs || typeof inputs !== 'object') {
        return '';
    }

    const filtersObj = (inputs.filters && typeof inputs.filters === 'object' && !Array.isArray(inputs.filters))
        ? inputs.filters
        : {};

    for (const [colKey, config] of Object.entries<any>(UserColumnConfig)) {
        const filterKey = config.filter_key || colKey;
        const dbColumn = config.columns?.users || colKey;

        // Check if value is present in inputs.filters or inputs under filterKey, colKey, or aliases
        let rawVal = filtersObj[filterKey] !== undefined
            ? filtersObj[filterKey]
            : filtersObj[colKey] !== undefined
                ? filtersObj[colKey]
                : inputs[filterKey] !== undefined
                    ? inputs[filterKey]
                    : inputs[colKey];

        // Specific aliases for created_at (date, registration_date)
        if ((rawVal === undefined || rawVal === null || rawVal === '') && (colKey === 'created_at' || filterKey === 'user_created_at')) {
            rawVal = filtersObj.date ?? filtersObj.registration_date ?? inputs.date ?? inputs.registration_date;
        }

        if (rawVal === undefined || rawVal === null || rawVal === '') {
            continue;
        }

        // If string representation is comma-separated (e.g. from query params "val1,val2")
        // and filter type is multi_search or list:
        if (typeof rawVal === 'string' && rawVal.includes(',') && (config.filter_type === 'multi_search' || config.filter_type === 'list')) {
            rawVal = rawVal.split(',').map((s: string) => s.trim()).filter(Boolean);
        }

        const fType = config.filter_type || 'single_search';

        // 1. multi_search (array of search tokens or single string)
        if (fType === 'multi_search') {
            if (Array.isArray(rawVal)) {
                const validItems = rawVal.filter(item => item !== undefined && item !== null && String(item).trim() !== '');
                if (validItems.length > 0) {
                    const orParts = validItems.map(item => {
                        const idx = values.length + 1;
                        values.push(`%${String(item).trim()}%`);
                        return `${dbColumn} ILIKE $${idx}`;
                    });
                    clause += ` AND (${orParts.join(' OR ')})`;
                }
            } else {
                const idx = values.length + 1;
                values.push(`%${String(rawVal).trim()}%`);
                clause += ` AND ${dbColumn} ILIKE $${idx}`;
            }
        }
        // 2. single_search aka search
        else if (fType === 'single_search' || fType === 'search') {
            if (Array.isArray(rawVal)) {
                const validItems = rawVal.filter(item => item !== undefined && item !== null && String(item).trim() !== '');
                if (validItems.length > 0) {
                    const orParts = validItems.map(item => {
                        const idx = values.length + 1;
                        values.push(`%${String(item).trim()}%`);
                        return `${dbColumn} ILIKE $${idx}`;
                    });
                    clause += ` AND (${orParts.join(' OR ')})`;
                }
            } else {
                const idx = values.length + 1;
                values.push(`%${String(rawVal).trim()}%`);
                clause += ` AND ${dbColumn} ILIKE $${idx}`;
            }
        }
        // 3. single_date (exact date matching)
        else if (fType === 'single_date') {
            const parsed = parseDateInput(rawVal);
            if (parsed) {
                const idx = values.length + 1;
                values.push(parsed);
                clause += ` AND ${dbColumn}::date = $${idx}::date`;
            }
        }
        // 4. date_range (date range comparison)
        else if (fType === 'date_range') {
            let startDate: any = null;
            let endDate: any = null;

            if (Array.isArray(rawVal)) {
                if (rawVal.length >= 1) startDate = rawVal[0];
                if (rawVal.length >= 2) endDate = rawVal[1];
            } else if (typeof rawVal === 'object' && (rawVal.start || rawVal.end || rawVal.from || rawVal.to)) {
                startDate = rawVal.start || rawVal.from;
                endDate = rawVal.end || rawVal.to;
            } else if (typeof rawVal === 'string') {
                startDate = rawVal;
                endDate = rawVal;
            }

            if (startDate) {
                const parsedStart = parseDateInput(startDate);
                const idx = values.length + 1;
                values.push(parsedStart);
                clause += ` AND ${dbColumn}::date >= $${idx}::date`;
            }
            if (endDate) {
                const parsedEnd = parseDateInput(endDate);
                const idx = values.length + 1;
                values.push(parsedEnd);
                clause += ` AND ${dbColumn}::date <= $${idx}::date`;
            }
        }
        // 5. single_number (exact number match)
        else if (fType === 'single_number') {
            const num = Number(rawVal);
            if (!isNaN(num)) {
                const idx = values.length + 1;
                values.push(num);
                clause += ` AND ${dbColumn}::numeric = $${idx}`;
            }
        }
        // 6. number_range (min & max number range)
        else if (fType === 'number_range') {
            let minVal: any = null;
            let maxVal: any = null;
            if (Array.isArray(rawVal)) {
                if (rawVal.length >= 1 && rawVal[0] !== '' && !isNaN(Number(rawVal[0]))) minVal = Number(rawVal[0]);
                if (rawVal.length >= 2 && rawVal[1] !== '' && !isNaN(Number(rawVal[1]))) maxVal = Number(rawVal[1]);
            } else if (typeof rawVal === 'object') {
                if (rawVal.min !== undefined && rawVal.min !== '' && !isNaN(Number(rawVal.min))) minVal = Number(rawVal.min);
                if (rawVal.max !== undefined && rawVal.max !== '' && !isNaN(Number(rawVal.max))) maxVal = Number(rawVal.max);
            } else if (typeof rawVal === 'string' && rawVal.includes('-')) {
                const parts = rawVal.split('-').map(s => s.trim());
                if (parts[0] !== '' && !isNaN(Number(parts[0]))) minVal = Number(parts[0]);
                if (parts[1] !== '' && !isNaN(Number(parts[1]))) maxVal = Number(parts[1]);
            }

            if (minVal !== null) {
                const idx = values.length + 1;
                values.push(minVal);
                clause += ` AND ${dbColumn}::numeric >= $${idx}`;
            }
            if (maxVal !== null) {
                const idx = values.length + 1;
                values.push(maxVal);
                clause += ` AND ${dbColumn}::numeric <= $${idx}`;
            }
        }
        // 7. dropdowns with checkboxes (list / dropdown_checkboxes)
        else if (fType === 'dropdown_checkboxes' || fType === 'dropdown_checkbox' || fType === 'list') {
            if (Array.isArray(rawVal)) {
                const validItems = rawVal.filter(item => item !== undefined && item !== null && String(item).trim() !== '');
                if (validItems.length > 0) {
                    const inParts = validItems.map(item => {
                        const idx = values.length + 1;
                        values.push(String(item).trim().toUpperCase());
                        return `UPPER(${dbColumn}::text) = $${idx}`;
                    });
                    clause += ` AND (${inParts.join(' OR ')})`;
                }
            } else {
                const idx = values.length + 1;
                values.push(String(rawVal).trim().toUpperCase());
                clause += ` AND UPPER(${dbColumn}::text) = $${idx}`;
            }
        }
        // 8. dropdowns with radiobuttons (dropdown_radiobuttons / dropdown_radio)
        else if (fType === 'dropdown_radiobuttons' || fType === 'dropdown_radio') {
            const val = Array.isArray(rawVal) ? rawVal[0] : rawVal;
            if (val !== undefined && val !== null && String(val).trim() !== '') {
                const idx = values.length + 1;
                values.push(String(val).trim().toUpperCase());
                clause += ` AND UPPER(${dbColumn}::text) = $${idx}`;
            }
        }
        // 9. default fallback
        else {
            const idx = values.length + 1;
            values.push(`%${String(rawVal).trim()}%`);
            clause += ` AND ${dbColumn}::text ILIKE $${idx}`;
        }
    }

    return clause;
}
