import {MedusaRequest, MedusaResponse} from "@medusajs/framework/http";
import BrandModuleService from "../../../../modules/brand/service";
import {BRAND_MODULE} from "../../../../modules/brand";

export const DELETE = async (
    req: MedusaRequest,
    res: MedusaResponse
) => {
    // Resolve the brand service from the Medusa container
    const brandModuleService: BrandModuleService = req.scope.resolve(
        BRAND_MODULE
    )
    const linkService = req.scope.resolve("link"); // For managing product-brand links

    // Extract the brand ID from the request params (e.g., /brands/:id)
    const {id} = req.params;

    if (!id) {
        return res.status(400).json({
            message: "Brand ID is required",
        });
    }

    try {
        // Optional: Remove all links between this brand and its products
        // This step depends on whether you want to cascade delete links
        await linkService.delete({
            [BRAND_MODULE]: {
                brand_id: id,
            }
        });

        // Delete the brand
        await brandModuleService.deleteBrands(id);

        // Return success response
        return res.status(200).json({
            message: `Brand with ID ${id} deleted successfully`,
        });
    } catch (error) {
        // Handle errors (e.g., brand not found)
        return res.status(500).json({
            message: "Failed to delete brand",
            error: error.message,
        });
    }
};