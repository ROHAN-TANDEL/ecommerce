import { SidebarConfig } from "../config/sidebar.config.js";

export class SidebarController {

    private formatGrouped() {
        const sections = Object.values(SidebarConfig.sections)
            .sort((a: any, b: any) => a.order - b.order);

        return sections.map((sec: any) => {
            const sectionItems = Object.entries(SidebarConfig.items)
                .filter(([_, item]: any) => item.section === sec.id)
                .map(([key, item]: any) => ({
                    key,
                    ...item,
                    dropdown_list: item.dropdown_options 
                        ? Object.entries(item.dropdown_options).map(([optKey, opt]: any) => ({
                            key: optKey,
                            ...opt
                        })).sort((a: any, b: any) => a.order - b.order)
                        : []
                }))
                .sort((a: any, b: any) => a.order - b.order);

            return {
                ...sec,
                items: sectionItems
            };
        });
    }

    /**
     * @route   GET /sidebar OR GET /sidebar/config
     * @desc    Get complete sidebar navigation configuration
     * @query   format=grouped|tree (optional: returns items nested inside sections)
     *          raw=true (optional: returns raw JSON config)
     */
    async getSidebarConfig(req: any, res: any) {
        try {
            const isGrouped = req.query?.format === 'grouped' || req.query?.format === 'tree';
            const isRaw = req.query?.raw === 'true';

            if (isGrouped) {
                const grouped = this.formatGrouped();
                if (isRaw) return res.status(200).json(grouped);
                return res.status(200).json({
                    status: "success",
                    code: 200,
                    data: grouped
                });
            }

            if (isRaw) {
                return res.status(200).json(SidebarConfig);
            }

            return res.status(200).json({
                status: "success",
                code: 200,
                data: SidebarConfig,
                sections: SidebarConfig.sections,
                items: SidebarConfig.items,
                actions: SidebarConfig.actions
            });
        } catch (error: any) {
            return res.status(500).json({
                status: "failed",
                code: 500,
                message: error.message || "Failed to load sidebar configuration"
            });
        }
    }

    /**
     * @route   GET /sidebar/sections
     * @desc    Get all navigation sections
     */
    async getSections(_req: any, res: any) {
        return res.status(200).json({
            status: "success",
            code: 200,
            data: SidebarConfig.sections
        });
    }

    /**
     * @route   GET /sidebar/items
     * @desc    Get all navigation items or filter by ?section=section_1
     */
    async getItems(req: any, res: any) {
        const sectionFilter = req.query?.section;
        let items: any = SidebarConfig.items;

        if (sectionFilter) {
            items = Object.fromEntries(
                Object.entries(SidebarConfig.items).filter(([_, item]: any) => item.section === sectionFilter)
            );
        }

        return res.status(200).json({
            status: "success",
            code: 200,
            data: items
        });
    }

    /**
     * @route   GET /sidebar/items/:key
     * @desc    Get specific navigation item by key (e.g., users, clients, partners)
     */
    async getItem(req: any, res: any) {
        const itemKey = req.params?.key;
        const item = (SidebarConfig.items as any)[itemKey];

        if (!item) {
            return res.status(404).json({
                status: "failed",
                code: 404,
                message: `Sidebar item '${itemKey}' not found`
            });
        }

        return res.status(200).json({
            status: "success",
            code: 200,
            data: item
        });
    }

    /**
     * @route   GET /sidebar/grouped
     * @desc    Get navigation tree structured by section with items and dropdowns
     */
    async getGroupedConfig(_req: any, res: any) {
        return res.status(200).json({
            status: "success",
            code: 200,
            data: this.formatGrouped()
        });
    }
}
