import { CustomerColumnConfig } from "./customer.column.config.js";

function parseDateInput(dateStr: any): string {
    if (!dateStr || typeof dateStr !== 'string') return dateStr;
    const trimmed = dateStr.trim();
    const dmyMatch = trimmed.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
    if (dmyMatch) {
        const day = dmyMatch[1] || '';
        const month = dmyMatch[2] || '';
        const year = dmyMatch[3] || '';
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
    return trimmed;
}

export function MasterFilterConfig(inputs: any, valuesArray?: any[]): string {
    const values = valuesArray || inputs?.values || (inputs.values = []);
    const search = inputs?.master_search || inputs?.master || inputs?.search || inputs?.q || inputs?.filters?.search || inputs?.filters?.q;

    if (!search || typeof search !== 'string' || search.trim() === '') {
        return '';
    }

    const term = `%${search.trim()}%`;
    const idx = values.length + 1;
    values.push(term);

    return ` AND (customer_code ILIKE $${idx} OR customer_name ILIKE $${idx} OR legal_name ILIKE $${idx} OR industry ILIKE $${idx} OR email ILIKE $${idx} OR phone ILIKE $${idx} OR website ILIKE $${idx} OR owner_name ILIKE $${idx} OR owner_email ILIKE $${idx} OR country ILIKE $${idx} OR country_code ILIKE $${idx} OR city ILIKE $${idx} OR state ILIKE $${idx} OR postal_code ILIKE $${idx} OR address ILIKE $${idx})`;
}

export function CustomerFilterConfig(inputs: any, valuesArray?: any[]): string {
    const values = valuesArray || inputs?.values || (inputs.values = []);
    let clause = '';

    if (!inputs || typeof inputs !== 'object') {
        return '';
    }

    const filtersObj = (inputs.filters && typeof inputs.filters === 'object' && !Array.isArray(inputs.filters))
        ? inputs.filters
        : {};

    for (const [colKey, config] of Object.entries<any>(CustomerColumnConfig)) {
        const filterKey = config.filter_key || colKey;
        const dbColumn = colKey;

        let rawVal = filtersObj[filterKey] !== undefined ? filtersObj[filterKey]
            : (filtersObj[colKey] !== undefined ? filtersObj[colKey]
            : (inputs[filterKey] !== undefined ? inputs[filterKey]
            : inputs[colKey]));

        if (rawVal === undefined || rawVal === null || rawVal === '') continue;

        const fType = config.filter_type;

        if (fType === 'search') {
            const term = typeof rawVal === 'string' ? rawVal.trim() : String(rawVal);
            if (term) {
                const idx = values.length + 1;
                values.push(`%${term}%`);
                clause += ` AND ${dbColumn} ILIKE $${idx}`;
            }
        } else if (fType === 'multi_search' || fType === 'list') {
            const arr = Array.isArray(rawVal) ? rawVal : [rawVal];
            const cleanArr = arr.map(v => typeof v === 'object' && v !== null ? (v.key || v.value) : v).filter(Boolean);
            if (cleanArr.length > 0) {
                const idx = values.length + 1;
                values.push(cleanArr.map(String));
                clause += ` AND ${dbColumn}::text = ANY($${idx})`;
            }
        } else if (fType === 'date_range') {
            let from = rawVal.from || rawVal.startDate || rawVal.start;
            let to = rawVal.to || rawVal.endDate || rawVal.end;
            if (from) {
                const idx = values.length + 1;
                values.push(parseDateInput(from));
                clause += ` AND ${dbColumn} >= $${idx}`;
            }
            if (to) {
                const idx = values.length + 1;
                values.push(parseDateInput(to));
                clause += ` AND ${dbColumn} <= $${idx}`;
            }
        } else if (fType === 'numeric' || fType === 'number_range') {
            if (typeof rawVal === 'object' && !Array.isArray(rawVal)) {
                if (rawVal.min !== undefined && rawVal.min !== '') {
                    const idx = values.length + 1;
                    values.push(Number(rawVal.min));
                    clause += ` AND ${dbColumn} >= $${idx}`;
                }
                if (rawVal.max !== undefined && rawVal.max !== '') {
                    const idx = values.length + 1;
                    values.push(Number(rawVal.max));
                    clause += ` AND ${dbColumn} <= $${idx}`;
                }
            } else {
                const idx = values.length + 1;
                values.push(Number(rawVal));
                clause += ` AND ${dbColumn} = $${idx}`;
            }
        }
    }

    return clause;
}
