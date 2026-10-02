export class QueryBuilder {

    binding(updateData, startingIndex = 1)
    {
        const keys = Object.keys(updateData);
        if (keys.length === 0) return null;

        const setClause = keys
            .map((key, index) => `"${key}" = $${startingIndex + index}`)
            .join(', ');

        return {
            setClause,
            values: Object.values(updateData),
            nextIndex: startingIndex + keys.length
        };
    }
}