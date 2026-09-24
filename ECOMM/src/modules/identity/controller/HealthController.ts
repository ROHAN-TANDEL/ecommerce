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
                // true - allow this column cells to be editable
                // false - even when edit is enabled or checkbox is selected this cell is not allowed to be edited
                editable: true,
                // true - show and allow sorting for this column
                // false - do not shown sorting for this column
                sorting: true,
                // true - show info note icon and on hover show this message
                // false - do not show info icon
                info_note: "Customer's registered business name",
                // true - perform eplisis on the cell text if it exceed cell width and on howver show full value as a info note
                // false - do not perform elipsis
                elipsis: 'text_elipsis',
                // true - column is shown normally
                // false - column is shown in disbaled mode , no edit, no freez nothing will work show a column with no actions, no sorting, no filter and nothing should work just show as is.
                active: true,
                // true - column is shown in UI
                // false - dont load, dont show the column
                show: true,
                // true - a master edit section is allowed - when a check box on master or row level is selected the same filter type is applied on this one till instead of filter it will take the changes made in this section and shown the same change happened in all of its cells
                master_edit_allow: true,
                // null - no freez allowed
                // freez_side - left side of the table the freez should happen
                // order - the order of columns to freez to set from left
                freez : {
                 freez_side : "left",
                 order : 1
                },
                // data if if filter type is list
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
                // string - show table title
                // null - dont show it at all
                "display_name": "Customers Rohan",

                // true - show headers section for the table
                // false - dont show headers, filters, master editor for the table just data rows
                show_headers : true,

                // true - show live count panel
                // false - hide live count panel
                live_count_panel : true,

                // true - show main action panel
                // false - dont show main action panel
                main_action_panel : true,
                // true - show checkes for the table
                // false - dont show check boxes for the table
                show_checkboxes : true,

                // true - check boxes section should be fixed
                // false - move check boxes horizontally along with columns
                fixed_checkboxes : true,

                // true  - action should be fixed to the utmost right of the table
                // false - action button can float move along horizontal with other columns
                fixed_actions : true,

                // true - show action items
                // false - hide action column
                show_actions : true,

                // use following API instead of hardcoded on, table should be replied on this
                // and always
                // get - data_api, config_api, table_config_api
                // put - update_api
                // api - the data api and pagination details
                "data_api": "http://localhost:3000/identity/management/customers",
                // api - the update api - send the intented response on update for master no id and master as type
                // api - individually selected checkboxes
                "update_api": "http://localhost:3000/identity/management/customers/:id",
                // column level configruation, for headers, filters, sorting, master lvel editing and all
                "config_api": "http://localhost:3000/identity/management/customers/config",
                // table level configuration
                "table_config_api": "http://localhost:3000/identity/management/customers/table-config",

                "primary_key": "id",

                "selection": {
                    // true - enable checkboxes for master and each rows
                    // false - do not show checkbox row for master and each rows
                    "enabled": true,
                    // true - allowed mutiple selection of checkboxes and master check boxes too
                    // false - no master check box, only on row check box is enabled
                    "multiple": true
                },

                "pagination": {
                    // true - show pagination section
                    // false - dont show pagination section
                    "enabled": true,
                    "default_page_size": 25,
                    "page_size_options": [10, 25, 50, 100]
                },

                "sorting": {
                    // true - show sorting if column config has the flag (column config is in seperate API customer/config)
                    // false - don't show sorting for any column
                    "enabled": true,
                    // experimental - not for implimenetaion
                    // true - show sorting if column config has the flag (column config is in seperate API customer/config)
                    // false - only one column is sorted and old sorted column is removed - experimental - do not develop this for now
                    "multiple": true
                },

                "filtering": {
                    // true - show filters for each column ( and also if column level is allowed or esle dont show for that column only)
                    // false - regardless of a column config to show the filters just dont show filtering for any columns - section is not shown in case of false
                    "enabled": true
                },

                "editing": {
                    // true - allow editing the table - false edit option is shown
                    // false - do not allow editing the table - edit option is not shown and for each row the edit option is not shown too
                    "enabled": true,
                    // true - show edition option for each row
                    // false - donot show edition option for each row
                    "row_editable": true
                },

                "actions": {
                    // true - show this option in section and for each row
                    // false - dont show this option and also not for each row
                    "edit": true,
                    // true - show this option in section and for each row
                    // false - dont show this option and also not for each row
                    "delete": true,
                    // true - show this option in section and for each row
                    // false - dont show this option and also not for each row
                    "enable": true,
                    // true - show this option in section and for each row
                    // false - dont show this option and also not for each row
                    "disable": true,
                    // true - show this option in section and for each row
                    // false - dont show this option and also not for each row
                    "revert": true,
                    // true - show this option in section and for each row
                    // false - dont show this option and also not for each row
                    "more": true
                },

                "export": {
                    // true - show this option in section and for each row
                    // false - dont show this option and also not for each row
                    "enabled": true,
                    "formats": [
                        "excel",
                        "csv"
                    ]
                },

                "download": {
                    // true - show this option in section and for each row
                    // false - dont show this option and also not for each row
                    "enabled": true,
                    "formats": [
                        "excel",
                        "csv"
                    ]
                },

                "column_management": {
                    // true - show this option in section and for each row
                    // false - dont show this option and also not for each row
                    "enabled": true,
                    // true - show this option in section and for each row
                    // false - dont show this option and also not for each row
                    "reorder": true,
                    // true - show this option in section and for each row
                    // false - dont show this option and also not for each row
                    "show_hide": false
                },

                "column_freeze": {
                    // true - allow freezing the columns via option
                    // false - dont show this option and also not for each row
                    "enabled": true,
                    // 2 - allow freezing the 2 columns at left side of table - which columns to feez will be taken from column config
                    "start": 2,
                    // 1 - allow freezing the 1 column at right side of table - which columns to feez will be taken from column config
                    "end": 1
                },

                "row_freeze": {
                    "enabled": true,
                    // 2 - allow freezing the 2 rows at top table - which rows to feez will be taken from row config
                    "top": 2,
                    // 0 - allow freezing the 0 rows at bottom of table - which rows to feez will be taken from row config
                    "bottom": 0
                },

                "column_resize": {
                    // true - each column is allowed to resize from its default size to minimum and maximum - the wdith is handled at UI
                    // false - resizign is not allowed
                    "enabled": true
                },

                "view": {
                    // true - show full screen button
                    // false - do not show full screen button
                    "fullscreen": true,
                    // true - show density button
                    // false - do not show density button
                    "density": true,
                    // apply this desity on table - if not given a default comfortable is selected that is in UI but if value is passed then this should be considered
                    "default_density": "comfortable"
                },

                "live_collaboration": {
                    // working as expected do not touch
                    "enabled": true
                },

                "features": {
                    // true - shown column nagivator indicator
                    // false - do not shown column nagivator indicator
                    "column_navigation": true,
                    // true - shown column count indicator
                    // false - do not shown column count indicator
                    "column_count_indicator": true,
                    // true - show save view button
                    // false - do not save view button
                    "save_view": true,
                    // true - show freset button
                    // false - do not show freset button
                    "reset_view": true
                }
            }
        });
    }
}