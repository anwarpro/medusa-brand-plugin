import {createProductsWorkflow, updateProductsWorkflow} from "@medusajs/medusa/core-flows"
import {StepResponse} from "@medusajs/framework/workflows-sdk"
import {Modules} from "@medusajs/framework/utils"
import {LinkDefinition} from "@medusajs/framework/types"
import {BRAND_MODULE} from "../../modules/brand"
import BrandModuleService from "../../modules/brand/service"

updateProductsWorkflow.hooks.productsUpdated(
    (async ({products, additional_data}, {container}) => {
        const link = container.resolve("link")

        const logger = container.resolve("logger")

        if (!additional_data?.brand_id) {
            if(products.length === 1) {
                for (const product of products) {
                    //remove from here
                    await link.delete({
                        [Modules.PRODUCT]: {
                            product_id: product.id,
                        },
                    })
                }
            }

            return new StepResponse([], [])
        }

        const brandModuleService: BrandModuleService = container.resolve(
            BRAND_MODULE
        )
        // if the brand doesn't exist, an error is thrown.
        await brandModuleService.retrieveBrand(additional_data.brand_id as string)


        const links: LinkDefinition[] = []


        for (const product of products) {

            await link.delete({
                [Modules.PRODUCT]: {
                    product_id: product.id,
                },
            })

            links.push({
                [Modules.PRODUCT]: {
                    product_id: product.id,
                },

                [BRAND_MODULE]: {
                    brand_id: additional_data.brand_id,
                },
            })

        }


        await link.create(links)


        logger.info("Linked brand to products")


        return new StepResponse(links, links)
    }),
    (async (links, {container}) => {

        const logger = container.resolve("logger")

        logger.info("Delete callback")

        if (!links?.length) {

            return

        }


        const link = container.resolve("link")


        await link.dismiss(links)

    })
)