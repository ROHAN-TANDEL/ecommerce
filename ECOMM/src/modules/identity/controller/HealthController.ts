import db from "../../../platformdb/facade.js";

export class HealthController {

    private readonly healthService:any;

    private readonly healthValidator:any;

    private readonly healthResponse:any;

    constructor(
        {
            healthService,
            healthValidator,
            healthResponse
        }:any
    ) {
        this.healthService = healthService;
        this.healthValidator = healthValidator;
        this.healthResponse = healthResponse;
    }

    async check(
        request:any,
        response:any
    )
    {
        this.healthValidator.validate();

        const result = await this.healthService.check();

        return response.json(
            this.healthResponse.modify(result)
        );
    }


    async getCustomers(
        request:any,
        response:any
    )
    {
        const page = Number(request.query?.page || 1);
        const limit = Number(request.query?.limit || 25);

        const result = await this.healthService.getCustomers(page, limit);

        return response.json(result);
    }

    async seedCustomers(
        request:any,
        response:any
    )
    {

        const result = await this.healthService.seedCustomers();

        return response.json(result);
    }


    async updateCustomer(req, res)
    {
            const { id } = req.params;
            const updates = req.body;

            try {
                const pool = db.master;

                // 1. Check whether the customer exists and is editable
                const customerResult = await pool.query(
                    `
      SELECT
        id,
        editable
      FROM customers
      WHERE id = $1
      `,
                    [id]
                );

                if (customerResult.rows.length === 0) {
                    return res.status(404).json({
                        message: 'Customer not found'
                    });
                }

                const customer = customerResult.rows[0];

                // 2. Server-side editability check
                if (!customer.editable) {
                    return res.status(409).json({
                        message: 'Customer is not editable'
                    });
                }

                // 3. Only allow fields that the API permits updating
                const allowedFields = [
                    'customer_name',
                    'legal_name',
                    'email',
                    'phone',
                    'status',
                    'industry',
                    'country',
                    'country_code',
                    'city',
                    'state',
                    'address',
                    'postal_code',
                    'website',
                    'annual_revenue',
                    'currency',
                    'employee_count',
                    'owner_name',
                    'owner_email',
                    'risk_level',
                    'customer_type',
                    'onboarding_date',
                    'is_active'
                ];

                // 4. Remove fields that aren't allowed
                const fields = Object.keys(updates)
                    .filter(field => allowedFields.includes(field));

                if (fields.length === 0) {
                    return res.status(400).json({
                        message: 'No valid fields provided for update'
                    });
                }

                // 5. Build parameterized UPDATE
                const values = [];
                const setClauses = [];

                fields.forEach((field, index) => {
                    values.push(updates[field]);
                    setClauses.push(`${field} = $${index + 1}`);
                });

                // updated_at is always controlled by the server
                setClauses.push('updated_at = NOW()');

                values.push(id);

                const result = await pool.query(
                    `
      UPDATE customers
      SET ${setClauses.join(', ')}
      WHERE id = $${values.length}
      RETURNING
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
      `,
                    values
                );

            return res.json({
                message: 'Customer updated successfully',
                data: result.rows[0]
            });

        } catch (error) {
            console.error('Failed to update customer:', error);

            return res.status(500).json({
                message: 'Failed to update customer'
            });
        }
    }

    async getCustomerConfig(req, res) {
        return res.json({
            customer_name: {
                header_name: 'Customer',
                columns: {
                    customers: 'customer_name'
                },
                filter_type: 'search',
                editable: true,
                sorting: true,
                info_note: "Customer's registered business name",
                elipsis: 'text_elipsis',
                active: true,
                show: true,
                master_edit_allow: true,
                filter_data: []
            },

            status: {
                header_name: 'Status',
                columns: {
                    customers: 'status'
                },
                filter_type: 'list',
                editable: true,
                sorting: true,
                info_note: 'Current customer status',
                elipsis: 'text_elipsis',
                active: true,
                show: true,
                master_edit_allow: true,
                filter_data: [
                    {
                        key: 'active',
                        name: 'Active',
                        type: 'check_box',
                        default: false
                    },
                    {
                        key: 'inactive',
                        name: 'Inactive',
                        type: 'check_box',
                        default: false
                    }
                ]
            },

            industry: {
                header_name: 'Industry',
                columns: {
                    customers: 'industry'
                },
                filter_type: 'search_list',
                editable: true,
                sorting: true,
                info_note: 'Customer industry',
                elipsis: 'text_elipsis',
                active: true,
                show: true,
                master_edit_allow: true,
                filter_data: []
            },

            country: {
                header_name: 'Country',
                columns: {
                    customers: 'country'
                },
                filter_type: 'multi_list',
                editable: true,
                sorting: true,
                info_note: 'Customer country',
                elipsis: 'text_elipsis',
                active: true,
                show: true,
                master_edit_allow: true,
                filter_data: []
            },

            employee_count: {
                header_name: 'Employees',
                columns: {
                    customers: 'employee_count'
                },
                filter_type: 'range',
                editable: true,
                sorting: true,
                info_note: 'Number of employees',
                elipsis: 'number_elipsis',
                active: true,
                show: true,
                master_edit_allow: true,
                filter_data: []
            },

            annual_revenue: {
                header_name: 'Annual Revenue',
                columns: {
                    customers: 'annual_revenue'
                },
                filter_type: 'range',
                editable: true,
                sorting: true,
                info_note: 'Annual revenue',
                elipsis: 'number_elipsis',
                active: true,
                show: true,
                master_edit_allow: true,
                filter_data: []
            },

            onboarding_date: {
                header_name: 'Onboarding Date',
                columns: {
                    customers: 'onboarding_date'
                },
                filter_type: 'date_range',
                editable: true,
                sorting: true,
                info_note: 'Date customer was onboarded',
                elipsis: 'text_elipsis',
                active: true,
                show: true,
                master_edit_allow: true,
                filter_data: []
            },

            risk_level: {
                header_name: 'Risk',
                columns: {
                    customers: 'risk_level'
                },
                filter_type: 'multi_list',
                editable: true,
                sorting: true,
                info_note: 'Customer risk classification',
                elipsis: 'text_elipsis',
                active: true,
                show: true,
                master_edit_allow: true,
                filter_data: [
                    {
                        key: 'low',
                        name: 'Low',
                        type: 'check_box',
                        default: false
                    },
                    {
                        key: 'medium',
                        name: 'Medium',
                        type: 'check_box',
                        default: false
                    },
                    {
                        key: 'high',
                        name: 'High',
                        type: 'check_box',
                        default: false
                    }
                ]
            },

            is_active: {
                header_name: 'Active',
                columns: {
                    customers: 'is_active'
                },
                filter_type: 'bool',
                editable: true,
                sorting: true,
                info_note: 'Whether the customer is active',
                elipsis: 'text_elipsis',
                active: true,
                show: true,
                master_edit_allow: true,
                filter_data: []
            },

            editable: {
                header_name: 'Editable',
                columns: {
                    customers: 'editable'
                },
                filter_type: 'bool',
                editable: true,
                sorting: true,
                info_note: 'Whether this customer can be edited',
                elipsis: 'text_elipsis',
                active: true,
                show: true,
                master_edit_allow: true,
                filter_data: []
            }
        });
    }


    async getCustomerTableConfig(req, res) {
        return res.json({
            "customer_table_unique_key": {
                "table_name": "customers",
                "display_name": "Customers",

                "data_api": "/customers",
                "update_api": "/customers/:id",
                "config_api": "/customers/config",
                "table_config_api": "/customers/table-config",

                "primary_key": "id",

                "selection": {
                    "enabled": true,
                    "multiple": true
                },

                "pagination": {
                    "enabled": true,
                    "default_page_size": 25,
                    "page_size_options": [10, 25, 50, 100]
                },

                "sorting": {
                    "enabled": true,
                    "multiple": true
                },

                "filtering": {
                    "enabled": true
                },

                "editing": {
                    "enabled": true,
                    "row_editable": true
                },

                "actions": {
                    "edit": true,
                    "delete": true,
                    "enable": true,
                    "disable": true,
                    "revert": true,
                    "more": true
                },

                "export": {
                    "enabled": true,
                    "formats": [
                        "excel",
                        "csv"
                    ]
                },

                "download": {
                    "enabled": true,
                    "formats": [
                        "excel",
                        "csv"
                    ]
                },

                "column_management": {
                    "enabled": true,
                    "reorder": true,
                    "show_hide": true
                },

                "column_freeze": {
                    "enabled": true,
                    "start": 2,
                    "end": 1
                },

                "row_freeze": {
                    "enabled": true,
                    "top": 2,
                    "bottom": 0
                },

                "column_resize": {
                    "enabled": true
                },

                "view": {
                    "fullscreen": true,
                    "density": true,
                    "default_density": "comfortable"
                },

                "live_collaboration": {
                    "enabled": true
                },

                "features": {
                    "column_navigation": true,
                    "column_count_indicator": true,
                    "save_view": true,
                    "reset_view": true
                }
            }
        });
    }
}