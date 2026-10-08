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

        // 1. multi_search (array of search tokens or single string)
        if (config.filter_type === 'multi_search') {
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
        // 2. search (single substring match or array of substrings)
        else if (config.filter_type === 'search') {
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
        // 3. list (enum / category matching)
        else if (config.filter_type === 'list') {
            if (Array.isArray(rawVal)) {
                const validItems = rawVal.filter(item => item !== undefined && item !== null && String(item).trim() !== '');
                if (validItems.length > 0) {
                    const inParts = validItems.map(item => {
                        const idx = values.length + 1;
                        values.push(String(item).trim().toUpperCase());
                        return `UPPER(${dbColumn}) = $${idx}`;
                    });
                    clause += ` AND (${inParts.join(' OR ')})`;
                }
            } else {
                const idx = values.length + 1;
                values.push(String(rawVal).trim().toUpperCase());
                clause += ` AND UPPER(${dbColumn}) = $${idx}`;
            }
        }
        // 4. date_range (date comparison)
        else if (config.filter_type === 'date_range') {
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
        // 5. default fallback
        else {
            const idx = values.length + 1;
            values.push(`%${String(rawVal).trim()}%`);
            clause += ` AND ${dbColumn}::text ILIKE $${idx}`;
        }
    }

    return clause;
}
