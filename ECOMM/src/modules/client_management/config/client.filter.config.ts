import { ClientColumnConfig } from "./client.column.config.js";

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

    return ` AND (partner_name ILIKE $${idx} OR client_code ILIKE $${idx} OR client_name ILIKE $${idx} OR domain ILIKE $${idx} OR industry ILIKE $${idx} OR contact_person_name ILIKE $${idx} OR email ILIKE $${idx})`;
}

export function ClientFilterConfig(inputs: any, valuesArray?: any[]): string {
    const values = valuesArray || inputs?.values || (inputs.values = []);
    let clause = '';

    if (!inputs || typeof inputs !== 'object') {
        return '';
    }

    let filtersObj = inputs.filters;
    if (typeof filtersObj === 'string') {
        try { filtersObj = JSON.parse(filtersObj); } catch (_) { filtersObj = {}; }
    }
    if (!filtersObj || typeof filtersObj !== 'object' || Array.isArray(filtersObj)) {
        filtersObj = {};
    }

    for (const [colKey, config] of Object.entries<any>(ClientColumnConfig)) {
        const filterKey = config.filter_key || colKey;
        const dbColumn = colKey;

        let rawVal = filtersObj[filterKey] !== undefined ? filtersObj[filterKey]
            : (filtersObj[colKey] !== undefined ? filtersObj[colKey]
            : (inputs[filterKey] !== undefined ? inputs[filterKey]
            : inputs[colKey]));

        if (rawVal === undefined || rawVal === null || rawVal === '') continue;

        if (typeof rawVal === 'string' && (rawVal.startsWith('[') || rawVal.startsWith('{'))) {
            try { rawVal = JSON.parse(rawVal); } catch (_) {}
        }

        if (typeof rawVal === 'string' && rawVal.includes(',') && (config.filter_type === 'multi_search' || config.filter_type === 'list')) {
            rawVal = rawVal.split(',').map((s: string) => s.trim()).filter(Boolean);
        }

        const fType = config.filter_type || 'search';

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
        // 2. single_search or search
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
                const term = typeof rawVal === 'string' ? rawVal.trim() : String(rawVal);
                if (term) {
                    const idx = values.length + 1;
                    values.push(`%${term}%`);
                    clause += ` AND ${dbColumn} ILIKE $${idx}`;
                }
            }
        }
        // 3. dropdowns / lists / enums (case-insensitive UPPER check)
        else if (fType === 'list' || fType === 'dropdown_checkboxes' || fType === 'dropdown_checkbox') {
            if (Array.isArray(rawVal)) {
                const validItems = rawVal
                    .map(item => typeof item === 'object' && item !== null ? (item.key ?? item.value ?? item.name) : item)
                    .filter(item => item !== undefined && item !== null && String(item).trim() !== '');
                if (validItems.length > 0) {
                    const inParts = validItems.map(item => {
                        const idx = values.length + 1;
                        values.push(String(item).trim().toUpperCase());
                        return `UPPER(${dbColumn}::text) = $${idx}`;
                    });
                    clause += ` AND (${inParts.join(' OR ')})`;
                }
            } else {
                const item = typeof rawVal === 'object' && rawVal !== null ? (rawVal.key ?? rawVal.value ?? rawVal.name) : rawVal;
                const idx = values.length + 1;
                values.push(String(item).trim().toUpperCase());
                clause += ` AND UPPER(${dbColumn}::text) = $${idx}`;
            }
        }
        // 4. date_range
        else if (fType === 'date_range') {
            let startDate: any = null;
            let endDate: any = null;

            if (Array.isArray(rawVal)) {
                if (rawVal.length >= 1) startDate = rawVal[0];
                if (rawVal.length >= 2) endDate = rawVal[1];
            } else if (typeof rawVal === 'object' && (rawVal.start || rawVal.end || rawVal.from || rawVal.to)) {
                startDate = rawVal.start || rawVal.from;
                endDate = rawVal.end || rawVal.to;
            } else if (typeof rawVal === 'string' && rawVal.includes(',')) {
                const parts = rawVal.split(',').map(s => s.trim());
                startDate = parts[0];
                endDate = parts[1];
            } else if (typeof rawVal === 'string') {
                startDate = rawVal;
                endDate = rawVal;
            }

            if (startDate) {
                const parsedStart = parseDateInput(startDate);
                if (parsedStart) {
                    const idx = values.length + 1;
                    values.push(parsedStart);
                    clause += ` AND ${dbColumn}::date >= $${idx}::date`;
                }
            }
            if (endDate) {
                const parsedEnd = parseDateInput(endDate);
                if (parsedEnd) {
                    const idx = values.length + 1;
                    values.push(parsedEnd);
                    clause += ` AND ${dbColumn}::date <= $${idx}::date`;
                }
            }
        }
        // 5. single_date
        else if (fType === 'single_date') {
            const parsed = parseDateInput(rawVal);
            if (parsed) {
                const idx = values.length + 1;
                values.push(parsed);
                clause += ` AND ${dbColumn}::date = $${idx}::date`;
            }
        }
        // 6. number_range or numeric
        else if (fType === 'number_range' || fType === 'numeric') {
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
            } else {
                const num = Number(rawVal);
                if (!isNaN(num)) {
                    const idx = values.length + 1;
                    values.push(num);
                    clause += ` AND ${dbColumn}::numeric = $${idx}`;
                }
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
        // 7. single_number
        else if (fType === 'single_number') {
            const num = Number(rawVal);
            if (!isNaN(num)) {
                const idx = values.length + 1;
                values.push(num);
                clause += ` AND ${dbColumn}::numeric = $${idx}`;
            }
        }
        // 8. boolean
        else if (config.type === 'boolean') {
            const boolStr = String(rawVal).toLowerCase();
            if (boolStr === 'true' || boolStr === 'false') {
                const idx = values.length + 1;
                values.push(boolStr === 'true');
                clause += ` AND ${dbColumn} = $${idx}`;
            }
        }
    }

    return clause;
}
