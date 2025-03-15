import {defineWidgetConfig} from "@medusajs/admin-sdk"
import {AdminProduct, DetailWidgetProps} from "@medusajs/framework/types"
import {Button, clx, Container, Drawer, DropdownMenu, Heading, IconButton, Text, toast} from "@medusajs/ui"
import {useQuery} from "@tanstack/react-query"
import {sdk} from "../lib/sdk"
import {EllipsisHorizontal, PencilSquare} from "@medusajs/icons";
import {useState} from "react";
import {useUpdateProduct} from "../hooks/brands.tsx";
import {useForm} from "react-hook-form";
import * as zod from "zod";
import {zodResolver} from "@hookform/resolvers/zod";
import {KeyboundForm} from "../components/utilities/keybound-form";
import {Form} from "../components/common/form/index.ts"
import {Combobox} from "../components/inputes/combobox/index.ts"
import {useComboboxData} from "../hooks/use-combobox-data.tsx";
import {RouteDrawer} from "../components/modals/index.ts"


type AdminProductBrand = AdminProduct & {
    brand?: {
        id: string
        name: string
    }
}

const UpdateProductBrandSchema = zod.object({
    brand_id: zod.string().optional()
})

type Brand = {
    id: string
    name: string
}

type BrandsResponse = {
    brands: Brand[],
    offset: number,
    limit: number,
    count: number
}

type BrandsParam = {
    q?: string
    offset?: number
    limit?: number
}

const ProductBrandWidget = ({
                                data: product,
                            }: DetailWidgetProps<AdminProduct>) => {

    const {data: queryResult} = useQuery({
        queryFn: () => sdk.admin.product.retrieve(product.id, {
            fields: "+brand.*",
        }),
        queryKey: [["product", product.id]],
    })

    const brandName = (queryResult?.product as AdminProductBrand)?.brand?.name
    const brandId = (queryResult?.product as AdminProductBrand)?.brand?.id

    const [open, setOpen] = useState(false);

    const {mutateAsync, isPending} = useUpdateProduct(product.id)

    const form = useForm<zod.infer<typeof UpdateProductBrandSchema>>({
        defaultValues: {
            brand_id: brandId,
        },
        resolver: zodResolver(UpdateProductBrandSchema),
    })


    const brands = useComboboxData<BrandsResponse, BrandsParam>({
        queryKey: ["product_brands"],
        queryFn: (params) => sdk.client.fetch(`/admin/brands`, {
            query: params,
        }),
        getOptions: (data) =>
            data.brands.map((brand) => ({
                label: brand.name,
                value: brand.id,
            })),
    })

    const handleSubmit = form.handleSubmit(async (data) => {
        await mutateAsync(
            {
                additional_data: {
                    brand_id: data.brand_id
                }
            },
            {
                onSuccess: ({product}) => {
                    toast.success(
                        "Success", {
                            description: product.title,
                        }
                    )
                    setOpen(false)
                },
                onError: (error) => {
                    toast.error(error.message)
                },
            }
        )
    })

    return (
        <Container className="divide-y p-0">
            <div className="flex items-center justify-between px-6 py-4">
                <Heading level="h2">Brand</Heading>
                <Drawer open={open} onOpenChange={(open) => setOpen(open)}>
                    <DropdownMenu>

                        <DropdownMenu.Trigger asChild>

                            <IconButton>

                                <EllipsisHorizontal/>

                            </IconButton>

                        </DropdownMenu.Trigger>

                        <DropdownMenu.Content>

                            <DropdownMenu.Item className="gap-x-2" onClick={() => setOpen(true)}>
                                <PencilSquare className="text-ui-fg-subtle"/>
                                Edit
                            </DropdownMenu.Item>

                        </DropdownMenu.Content>

                    </DropdownMenu>

                    <Drawer.Content>

                        <Drawer.Header>

                            <Drawer.Title>Edit Product Brand</Drawer.Title>

                        </Drawer.Header>

                        <Drawer.Body className="p-4">
                            <RouteDrawer.Form form={form}>
                                <KeyboundForm onSubmit={handleSubmit} className="flex h-full flex-col">
                                    <RouteDrawer.Body>
                                        <div className="flex h-full flex-col gap-y-8">
                                            <div className="flex flex-col gap-y-4">
                                                <Form.Field
                                                    control={form.control}
                                                    name="brand_id"
                                                    render={({field}) => {
                                                        return (
                                                            <Form.Item>
                                                                <Form.Label optional>
                                                                    Brand
                                                                </Form.Label>
                                                                <Form.Control>
                                                                    <Combobox
                                                                        {...field}
                                                                        options={brands.options}
                                                                        searchValue={brands.searchValue}
                                                                        onSearchValueChange={brands.onSearchValueChange}
                                                                        fetchNextPage={brands.fetchNextPage}
                                                                    />
                                                                </Form.Control>
                                                                <Form.ErrorMessage/>
                                                            </Form.Item>
                                                        )
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </RouteDrawer.Body>
                                    <RouteDrawer.Footer>
                                        <div className="flex items-center justify-end gap-x-2">
                                            <RouteDrawer.Close asChild>
                                                <Button size="small" variant="secondary">
                                                    Cancel
                                                </Button>
                                            </RouteDrawer.Close>
                                            <Button size="small" type="submit" isLoading={isPending}>
                                                Save
                                            </Button>
                                        </div>
                                    </RouteDrawer.Footer>
                                </KeyboundForm>
                            </RouteDrawer.Form>
                        </Drawer.Body>
                    </Drawer.Content>

                </Drawer>
            </div>
            <div
                className={clx(
                    `text-ui-fg-subtle grid grid-cols-2 items-center px-6 py-4`
                )}
            >
                <Text size="small" weight="plus" leading="compact">
                    Name
                </Text>

                <Text
                    size="small"
                    leading="compact"
                    className="whitespace-pre-line text-pretty"
                >
                    {brandName || "-"}
                </Text>
            </div>
        </Container>
    )
}

export const config = defineWidgetConfig({
    zone: "product.details.side.after"
})

export default ProductBrandWidget