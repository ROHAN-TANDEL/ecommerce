import { UserColumnConfig } from "./user.column.config.js";

/**
 * Builds the Master Filter SQL clause across searchable columns.
 * Can be used as:
 *   query = query + MasterFilterConfig(inputs);
 * or
 *   query = query + MasterFilterConfig(inputs, values);
 */
export function MasterFilterConfig(inputs: any, valuesArray?: any[]): string {
    const values = valuesArray || inputs?.values || (inputs.values = []);
    const search = inputs?.master_search || inputs?.master || inputs?.search || inputs?.q;

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

    for (const [colKey, config] of Object.entries<any>(UserColumnConfig)) {
        const filterKey = config.filter_key || colKey;
        const dbColumn = config.columns?.users || colKey;

        // Check if value is present in inputs under filterKey or colKey
        let rawVal = inputs[filterKey] !== undefined ? inputs[filterKey] : inputs[colKey];
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
                if (rawVal.length > 0) {
                    const orParts = rawVal.map(item => {
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
        // 2. search (single substring match)
        else if (config.filter_type === 'search') {
            const idx = values.length + 1;
            values.push(`%${String(rawVal).trim()}%`);
            clause += ` AND ${dbColumn} ILIKE $${idx}`;
        }
        // 3. list (enum / category matching)
        else if (config.filter_type === 'list') {
            if (Array.isArray(rawVal)) {
                if (rawVal.length > 0) {
                    const inParts = rawVal.map(item => {
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
            if (typeof rawVal === 'object' && (rawVal.start || rawVal.end || rawVal.from || rawVal.to)) {
                const startDate = rawVal.start || rawVal.from;
                const endDate = rawVal.end || rawVal.to;
                if (startDate) {
                    const idx = values.length + 1;
                    values.push(startDate);
                    clause += ` AND ${dbColumn} >= $${idx}`;
                }
                if (endDate) {
                    const idx = values.length + 1;
                    values.push(endDate);
                    clause += ` AND ${dbColumn} <= $${idx}`;
                }
            } else if (typeof rawVal === 'string') {
                const idx = values.length + 1;
                values.push(rawVal);
                clause += ` AND ${dbColumn}::date = $${idx}::date`;
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
