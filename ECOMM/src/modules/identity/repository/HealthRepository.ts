import db from "../../../platformdb/facade.js";
import { randomUUID } from "node:crypto";

export class HealthRepository {

    async check()
    {
        console.log(db);
        return await db.master.query(
            "SELECT current_schema()"
        );
    }


    async getCustomers(page, limit)
    {
        try {
            const offset = (page - 1) * limit;

            const pool = db.master;
            const countResult = await pool.query(`SELECT COUNT(*)::int AS total FROM customers`);

            const dataResult = await pool.query(`
          SELECT
            id,
            customer_code,
            customer_name,
            legal_name,
            email,
            phone,
            status,
            industry,
            country,
            country_code,
            city,
            state,
            address,
            postal_code,
            website,
            annual_revenue,
            currency,
            employee_count,
            owner_name,
            owner_email,
            risk_level,
            customer_type,
            onboarding_date,
            last_activity_at,
            is_active,
            editable,
            created_at,
            updated_at
          FROM customers
          ORDER BY created_at DESC
          LIMIT $1
          OFFSET $2
        `, [limit, offset]);

            const total = countResult.rows[0].total;

            return {
                data: dataResult.rows,

                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            };

        } catch (error) {
            console.error({ message : 'Failed to fetch customers:', error : error});

            return {
                message: 'Failed to fetch customers'
            };
        }
    }

    randomItem(items) {
        return items[Math.floor(Math.random() * items.length)];
    }

    randomRevenue() {
        return Math.floor(
            Math.random() * (50000000 - 500000) + 500000
        );
    }

    async seedCustomers()
    {
        const client = await db.master.connect();


        const customers = [
            ['Acme Corporation', 'acme.com', 'Fintech', 'India', 'IN'],
            ['Globex Corporation', 'globex.com', 'SaaS', 'Germany', 'DE'],
            ['Umbrella Technologies', 'umbrella.com', 'Healthcare', 'USA', 'US'],
            ['Stark Industries', 'stark.com', 'Manufacturing', 'USA', 'US'],
            ['Wayne Enterprises', 'wayne.com', 'Energy', 'United Kingdom', 'GB'],
            ['Oscorp Industries', 'oscorp.com', 'Biotech', 'USA', 'US'],
            ['Initech', 'initech.com', 'IT Services', 'Canada', 'CA'],
            ['Hooli', 'hooli.com', 'Software', 'USA', 'US'],
            ['Wonka Industries', 'wonka.com', 'Food & Beverage', 'United Kingdom', 'GB'],
            ['Tyrell Corporation', 'tyrell.com', 'Technology', 'USA', 'US'],
            ['Cyberdyne Systems', 'cyberdyne.com', 'AI & Robotics', 'USA', 'US'],
            ['Massive Dynamic', 'massivedynamic.com', 'Research', 'USA', 'US'],
            ['Soylent Corp', 'soylent.com', 'Consumer Goods', 'USA', 'US'],
            ['Oceanic Airlines', 'oceanic.com', 'Travel', 'Australia', 'AU'],
            ['Prestige Worldwide', 'prestigeworldwide.com', 'Entertainment', 'USA', 'US']
        ];

        const cities = [
            ['Bengaluru', 'Karnataka', '560001'],
            ['Mumbai', 'Maharashtra', '400001'],
            ['Hyderabad', 'Telangana', '500001'],
            ['Delhi', 'Delhi', '110001'],
            ['Pune', 'Maharashtra', '411001'],
            ['Chennai', 'Tamil Nadu', '600001'],
            ['Berlin', 'Berlin', '10115'],
            ['Munich', 'Bavaria', '80331'],
            ['London', 'England', 'SW1A'],
            ['New York', 'New York', '10001'],
            ['San Francisco', 'California', '94105'],
            ['Toronto', 'Ontario', 'M5H'],
            ['Sydney', 'New South Wales', '2000'],
            ['Amsterdam', 'North Holland', '1011'],
            ['Singapore', 'Singapore', '018989']
        ];

        const owners = [
            ['John Doe', 'john.doe@nexora.com'],
            ['Sarah Connor', 'sarah.connor@nexora.com'],
            ['Michael Kim', 'michael.kim@nexora.com'],
            ['Tony Stark', 'tony.stark@nexora.com'],
            ['Bruce Wayne', 'bruce.wayne@nexora.com'],
            ['Norman Osborn', 'norman.osborn@nexora.com'],
            ['Peter Gibbons', 'peter.gibbons@nexora.com'],
            ['Richard Hendricks', 'richard.hendricks@nexora.com']
        ];

        const statuses = [
            'Active',
            'Pending',
            'Disabled',
            'Suspended'
        ];

        const riskLevels = [
            'Low',
            'Medium',
            'High',
            'Critical'
        ];

        const customerTypes = [
            'Enterprise',
            'Mid-Market',
            'SMB'
        ];

        const currencies = [
            'USD',
            'EUR',
            'GBP',
            'INR',
            'CAD',
            'AUD'
        ];

        try {
            await client.query('BEGIN');

            await client.query('TRUNCATE TABLE customers CASCADE');

            const values = [];
            const placeholders = [];

            for (let i = 1; i <= 120; i++) {
                const [
                    company,
                    domain,
                    industry,
                    country,
                    countryCode
                ] = this.randomItem(customers);

                const [
                    city,
                    state,
                    postalCode
                ] = this.randomItem(cities);

                const [
                    ownerName,
                    ownerEmail
                ] = this.randomItem(owners);

                const status = this.randomItem(statuses);

                const email = `contact${i}@${domain}`;

                const phone = `+1-555-${String(
                    Math.floor(Math.random() * 9000000 + 1000000)
                )}`;

                const revenue = this.randomRevenue();

                const currency = this.randomItem(currencies);

                const employeeCount =
                    Math.floor(Math.random() * 5000) + 10;

                const riskLevel = this.randomItem(riskLevels);

                const customerType = this.randomItem(customerTypes);

                const onboardingDate =
                    new Date(
                        2024,
                        Math.floor(Math.random() * 12),
                        Math.floor(Math.random() * 28) + 1
                    );

                const lastActivity =
                    new Date(
                        Date.now() -
                        Math.floor(Math.random() * 180) *
                        24 *
                        60 *
                        60 *
                        1000
                    );

                const editable = Math.random() > 0.2;

                const valuesForRow = [
                    randomUUID(),
                    `CUST-${String(i).padStart(5, '0')}`,
                    company,
                    `${company} Holdings Ltd`,
                    email,
                    phone,
                    status,
                    industry,
                    country,
                    countryCode,
                    city,
                    state,
                    `${Math.floor(Math.random() * 500) + 1} Main Street`,
                    postalCode,
                    `https://www.${domain}`,
                    revenue,
                    currency,
                    employeeCount,
                    ownerName,
                    ownerEmail,
                    riskLevel,
                    customerType,
                    onboardingDate,
                    lastActivity,
                    status === 'Active',
                    editable,
                    new Date(),
                    new Date()
                ];

                const offset = values.length;

                const rowPlaceholders = valuesForRow.map(
                    (_, index) => `$${offset + index + 1}`
                );

                placeholders.push(
                    `(${rowPlaceholders.join(', ')})`
                );

                values.push(...valuesForRow);
            }

            const query = `
      INSERT INTO customers (
        id,
        customer_code,
        customer_name,
        legal_name,
        email,
        phone,
        status,
        industry,
        country,
        country_code,
        city,
        state,
        address,
        postal_code,
        website,
        annual_revenue,
        currency,
        employee_count,
        owner_name,
        owner_email,
        risk_level,
        customer_type,
        onboarding_date,
        last_activity_at,
        is_active,
        editable,
        created_at,
        updated_at
      )
      VALUES ${placeholders.join(', ')}
    `;

            await client.query(query, values);

            await client.query('COMMIT');

            console.log('120 customers seeded successfully.');
        } catch (error) {
            await client.query('ROLLBACK');

            console.error('Customer seeding failed:', error);

            throw error;
        } finally {
            client.release();
        }

        return { status: "seeded" };
    }
}