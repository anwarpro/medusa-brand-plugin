import {
    MedusaRequest,
    MedusaResponse,
} from "@medusajs/framework/http"
import {
    createBrandWorkflow,
} from "../../../workflows/create-brand"
import {z} from "zod"

import {PostAdminCreateBrand} from "./validators"
import BrandModuleService from "../../../modules/brand/service";
import {BRAND_MODULE} from "../../../modules/brand";

type PostAdminCreateBrandType = z.infer<typeof PostAdminCreateBrand>

export const POST = async (
    req: MedusaRequest<PostAdminCreateBrandType>,
    res: MedusaResponse
) => {
    const {result} = await createBrandWorkflow(req.scope)
        .run({
            input: req.validatedBody,
        })

    res.json({brand: result})
}

export const GET = async (
    req: MedusaRequest,
    res: MedusaResponse
) => {

    const query = req.scope.resolve("query")

    // Extract query params from the request
    const {q, limit = 10, offset = 0} = req.query as { q?: string; limit?: string | number; offset?: string | number };

    // Build filters for the brand entity
    const filters = q ? {name: {$ilike: `%${q}%`}} : {};


    const {

        data: brands,

        metadata: {count, take, skip} = {},

    } = await query.graph({

        entity: "brand",

        ...req.queryConfig,

        fields: ["id", "name", "products[]"], // Specify fields to return
        filters, // Apply filters based on q
    })


    res.json({

        brands,

        count,

        limit: take,

        offset: skip,

    })

}